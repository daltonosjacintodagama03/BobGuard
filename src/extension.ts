import * as vscode from 'vscode';
import { Logger } from './utils/Logger';
import { FirebaseConfig } from './auth/FirebaseConfig';
import { SessionManager } from './auth/SessionManager';
import { AuthManager } from './auth/AuthManager';
import { LocalCache } from './storage/LocalCache';
import { FirestoreManager } from './storage/FirestoreManager';
import { BobAnalyzer } from './analysis/BobAnalyzer';
import { RoadmapGenerator } from './roadmap/RoadmapGenerator';
import { SidebarProvider } from './ui/SidebarProvider';
import { FindingsNavigator } from './ui/FindingsNavigator';
import { Finding } from './models/Finding';
import { Session, calculateStats } from './models/Session';
import { CustomRule, createRule, validateRule } from './models/Rule';
import { COMMANDS, ERROR_MESSAGES, SUCCESS_MESSAGES } from './utils/Constants';
import { BobCLI } from './utils/BobCLI';
import { v4 as uuidv4 } from 'uuid';

/**
 * Ativa a extensão BobGuard
 */
export async function activate(context: vscode.ExtensionContext) {
	console.log('🛡️ BobGuard is activating...');

	try {
		// 1. Inicializa Logger
		Logger.initialize(context);
		Logger.info('BobGuard extension starting...');

		// 2. Verifica se Bob CLI está disponível
		const bobAvailable = await BobCLI.isAvailable();
		if (!bobAvailable) {
			Logger.warn('Bob CLI não está disponível. Algumas funcionalidades podem não funcionar.');
			vscode.window.showWarningMessage(
				ERROR_MESSAGES.BOB_NOT_FOUND,
				'Ver Documentação'
			).then(selection => {
				if (selection === 'Ver Documentação') {
					vscode.env.openExternal(vscode.Uri.parse('https://github.com/yourusername/bobguard#readme'));
				}
			});
		}

		// 3. Inicializa Firebase (opcional)
		const firebaseConfigured = FirebaseConfig.initialize();
		if (!firebaseConfigured) {
			Logger.info('Firebase não configurado. Funcionalidades de autenticação e sincronização desabilitadas.');
		}

		// 4. Inicializa SessionManager
		const sessionManager = new SessionManager(context);
		await sessionManager.initialize();

		// 5. Inicializa AuthManager
		const authManager = new AuthManager(context, sessionManager);
		await authManager.initialize();

		// 6. Inicializa LocalCache
		const localCache = new LocalCache(context);
		await localCache.initialize();

		// 7. Inicializa UI Components
		const sidebarProvider = new SidebarProvider(context);
		const findingsNavigator = new FindingsNavigator();

		// 8. Regista Sidebar
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				SidebarProvider.viewType,
				sidebarProvider
			)
		);

		// 9. Estado da aplicação
		let currentFindings: Finding[] = [];
		let currentSession: Session | null = null;
		let diagnosticCollection = vscode.languages.createDiagnosticCollection('bobguard');
		context.subscriptions.push(diagnosticCollection);

		// 10. Atualiza sidebar com utilizador atual
		const currentUser = authManager.getCurrentUser();
		if (currentUser) {
			sidebarProvider.updateUser(currentUser);
			
			// Carrega sessões do utilizador
			if (firebaseConfigured) {
				const sessions = await FirestoreManager.loadUserSessions(currentUser.userId);
				sidebarProvider.updateSessions(sessions);
			} else {
				const sessions = localCache.getAllSessions();
				sidebarProvider.updateSessions(sessions);
			}
		}

		// 11. Carrega regras custom
		const config = vscode.workspace.getConfiguration();
		const customRules = config.get<CustomRule[]>('bobguard.customRules', []);
		sidebarProvider.updateCustomRules(customRules);

		// 12. Listener para mudanças de sessão
		sessionManager.onSessionChange((session) => {
			if (session) {
				sidebarProvider.updateUser({
					email: session.email,
					userId: session.userId
				});
			} else {
				sidebarProvider.updateUser(null);
			}
		});

		// ===== COMANDOS =====

		// Comando: Login
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.LOGIN, async () => {
				await authManager.login();
			})
		);

		// Comando: Logout
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.LOGOUT, async () => {
				await authManager.logout();
				currentFindings = [];
				currentSession = null;
				diagnosticCollection.clear();
				sidebarProvider.updateFindings([]);
				sidebarProvider.updateSessions([]);
			})
		);

		// Comando: Analisar Ficheiro
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.ANALYZE_FILE, async () => {
				const editor = vscode.window.activeTextEditor;
				
				if (!editor) {
					vscode.window.showErrorMessage(ERROR_MESSAGES.NO_ACTIVE_FILE);
					return;
				}

				const document = editor.document;
				const filePath = document.fileName;
				const content = document.getText();
				const language = document.languageId;

				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: "BobGuard está a analisar o ficheiro...",
					cancellable: false
				}, async (progress) => {
					try {
						progress.report({ increment: 0, message: "Iniciando análise..." });

						// Analisa ficheiro
						const findings = await BobAnalyzer.analyzeFile(
							filePath,
							content,
							language,
							customRules
						);

						progress.report({ increment: 100, message: "Análise concluída!" });

						// Atualiza estado
						currentFindings = findings;

						// Cria sessão
						const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
						if (workspaceFolder && authManager.isAuthenticated()) {
							const user = authManager.getCurrentUser()!;
							currentSession = {
								id: uuidv4(),
								userId: user.userId,
								projectPath: workspaceFolder.uri.fsPath,
								projectName: workspaceFolder.name,
								timestamp: Date.now(),
								findings: findings,
								stats: calculateStats(findings, 1, content.split('\n').length, 0),
								type: 'file',
								targetFile: filePath,
								customRules: customRules.map(r => r.text)
							};

							// Guarda sessão
							await localCache.addSession(currentSession);
							
							if (firebaseConfigured) {
								await FirestoreManager.saveSession(currentSession);
							}

							// Atualiza sidebar
							const sessions = localCache.getAllSessions();
							sidebarProvider.updateSessions(sessions);
						}

						// Atualiza UI
						sidebarProvider.updateFindings(findings);
						
						// Cria diagnostics
						diagnosticCollection.clear();
						const newDiagnostics = findingsNavigator.createDiagnostics(findings);
						diagnosticCollection = newDiagnostics;

						// Mostra resultado
						vscode.window.showInformationMessage(
							`${SUCCESS_MESSAGES.ANALYSIS_COMPLETE}: ${findings.length} findings encontrados`
						);
					} catch (error) {
						Logger.error('Erro ao analisar ficheiro', error);
						vscode.window.showErrorMessage(ERROR_MESSAGES.ANALYSIS_FAILED);
					}
				});
			})
		);

		// Comando: Analisar Projeto
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.ANALYZE_PROJECT, async () => {
				const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
				
				if (!workspaceFolder) {
					vscode.window.showErrorMessage(ERROR_MESSAGES.NO_WORKSPACE);
					return;
				}

				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: "BobGuard está a analisar o projeto...",
					cancellable: false
				}, async (progress) => {
					try {
						const findings = await BobAnalyzer.analyzeProject(
							workspaceFolder.uri.fsPath,
							customRules,
							(current, total, file) => {
								const percentage = Math.floor((current / total) * 100);
								progress.report({ 
									increment: 1, 
									message: `Analisando ${current}/${total}: ${file}` 
								});
							}
						);

						// Cria sessão
						if (authManager.isAuthenticated()) {
							const user = authManager.getCurrentUser()!;
							currentSession = {
								id: uuidv4(),
								userId: user.userId,
								projectPath: workspaceFolder.uri.fsPath,
								projectName: workspaceFolder.name,
								timestamp: Date.now(),
								findings: findings,
								stats: calculateStats(findings, 0, 0, 0),
								type: 'project',
								customRules: customRules.map(r => r.text)
							};

							await localCache.addSession(currentSession);
							
							if (firebaseConfigured) {
								await FirestoreManager.saveSession(currentSession);
							}

							const sessions = localCache.getAllSessions();
							sidebarProvider.updateSessions(sessions);
						}

						currentFindings = findings;
						sidebarProvider.updateFindings(findings);
						
						diagnosticCollection.clear();
						const newDiagnostics = findingsNavigator.createDiagnostics(findings);
						diagnosticCollection = newDiagnostics;

						vscode.window.showInformationMessage(
							`${SUCCESS_MESSAGES.ANALYSIS_COMPLETE}: ${findings.length} findings em ${workspaceFolder.name}`
						);
					} catch (error) {
						Logger.error('Erro ao analisar projeto', error);
						vscode.window.showErrorMessage(ERROR_MESSAGES.ANALYSIS_FAILED);
					}
				});
			})
		);

		// Comando: Gerar Roadmap
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.GENERATE_ROADMAP, async () => {
				const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
				
				if (!workspaceFolder) {
					vscode.window.showErrorMessage(ERROR_MESSAGES.NO_WORKSPACE);
					return;
				}

				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: "BobGuard está a gerar roadmap...",
					cancellable: false
				}, async (progress) => {
					try {
						progress.report({ increment: 0, message: "Analisando projeto..." });

						const roadmap = await RoadmapGenerator.generateRoadmap(
							workspaceFolder.uri.fsPath
						);

						progress.report({ increment: 50, message: "Gerando documento..." });

						const filePath = await RoadmapGenerator.saveRoadmap(roadmap);

						progress.report({ increment: 100, message: "Roadmap gerado!" });

						const openFile = await vscode.window.showInformationMessage(
							SUCCESS_MESSAGES.ROADMAP_GENERATED,
							'Abrir Roadmap'
						);

						if (openFile === 'Abrir Roadmap') {
							await RoadmapGenerator.openRoadmap(filePath);
						}
					} catch (error) {
						Logger.error('Erro ao gerar roadmap', error);
						vscode.window.showErrorMessage('Erro ao gerar roadmap');
					}
				});
			})
		);

		// Comando: Adicionar Regra Custom
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.ADD_CUSTOM_RULE, async () => {
				const ruleText = await vscode.window.showInputBox({
					prompt: 'Escreve a tua regra custom em linguagem natural',
					placeHolder: 'Ex: Todas as funções devem ter docstring',
					validateInput: (value) => {
						const validation = validateRule(value);
						return validation.valid ? null : validation.error;
					}
				});

				if (ruleText) {
					const rule = createRule(ruleText);
					const rules = config.get<CustomRule[]>('bobguard.customRules', []);
					rules.push(rule);
					await config.update('bobguard.customRules', rules, vscode.ConfigurationTarget.Global);
					sidebarProvider.updateCustomRules(rules);
					vscode.window.showInformationMessage(SUCCESS_MESSAGES.RULE_ADDED);
				}
			})
		);

		// Comando: Toggle Mode
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.TOGGLE_MODE, () => {
				sidebarProvider.toggleMode();
			})
		);

		// Comando: Navegar para Finding
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.NAVIGATE_TO_FINDING, async (findingId: string) => {
				const finding = currentFindings.find(f => f.id === findingId);
				if (finding) {
					await findingsNavigator.navigateToFinding(finding);
				}
			})
		);

		// Comando: Apagar Sessão
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.DELETE_SESSION, async (sessionId: string) => {
				const confirm = await vscode.window.showWarningMessage(
					'Tens a certeza que queres apagar esta sessão?',
					'Sim',
					'Não'
				);

				if (confirm === 'Sim') {
					await localCache.removeSession(sessionId);
					
					if (firebaseConfigured) {
						await FirestoreManager.deleteSession(sessionId);
					}

					const sessions = localCache.getAllSessions();
					sidebarProvider.updateSessions(sessions);
					vscode.window.showInformationMessage(SUCCESS_MESSAGES.SESSION_DELETED);
				}
			})
		);

		// Comando: Refresh
		context.subscriptions.push(
			vscode.commands.registerCommand(COMMANDS.REFRESH, () => {
				sidebarProvider.refresh();
			})
		);

		// 13. Cleanup de sessões antigas (ao iniciar)
		await localCache.cleanOldSessions();

		Logger.success('BobGuard extension activated successfully! 🛡️');
		console.log('🛡️ BobGuard is now active!');

	} catch (error) {
		Logger.error('Failed to activate BobGuard extension', error);
		vscode.window.showErrorMessage('Erro ao ativar BobGuard. Verifica os logs.');
	}
}

/**
 * Desativa a extensão
 */
export function deactivate() {
	Logger.info('BobGuard extension deactivating...');
	console.log('🛡️ BobGuard is deactivating...');
}
