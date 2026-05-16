import * as vscode from 'vscode';
import { signInWithCustomToken, signOut, User } from 'firebase/auth';
import { FirebaseConfig } from './FirebaseConfig';
import { SessionManager } from './SessionManager';
import { Logger } from '../utils/Logger';
import { URLS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/Constants';

/**
 * Gestão de autenticação com Firebase
 */
export class AuthManager {
    private sessionManager: SessionManager;
    private context: vscode.ExtensionContext;
    private uriHandler: vscode.Disposable | null = null;

    constructor(context: vscode.ExtensionContext, sessionManager: SessionManager) {
        this.context = context;
        this.sessionManager = sessionManager;
    }

    /**
     * Inicializa o AuthManager e regista URI handler
     */
    async initialize(): Promise<void> {
        // Regista handler para capturar callback de autenticação
        this.uriHandler = vscode.window.registerUriHandler({
            handleUri: async (uri: vscode.Uri) => {
                await this.handleAuthCallback(uri);
            }
        });

        this.context.subscriptions.push(this.uriHandler);
        Logger.info('AuthManager inicializado');
    }

    /**
     * Inicia processo de login
     */
    async login(): Promise<boolean> {
        try {
            // Verifica se Firebase está configurado
            if (!FirebaseConfig.isConfigured()) {
                const configure = await vscode.window.showWarningMessage(
                    ERROR_MESSAGES.FIREBASE_NOT_CONFIGURED,
                    'Configurar Agora',
                    'Ver Documentação'
                );

                if (configure === 'Configurar Agora') {
                    await this.showFirebaseSetup();
                } else if (configure === 'Ver Documentação') {
                    vscode.env.openExternal(vscode.Uri.parse(URLS.DOCS));
                }
                return false;
            }

            // Abre página de login no browser
            const loginUrl = this.buildLoginUrl();
            await vscode.env.openExternal(vscode.Uri.parse(loginUrl));

            vscode.window.showInformationMessage(
                'Por favor, completa o login no browser. A extensão será autenticada automaticamente.'
            );

            return true;
        } catch (error) {
            Logger.error('Erro ao iniciar login', error);
            return false;
        }
    }

    /**
     * Faz logout
     */
    async logout(): Promise<void> {
        try {
            // Logout do Firebase se configurado
            if (FirebaseConfig.isConfigured()) {
                const auth = FirebaseConfig.getAuth();
                await signOut(auth);
            }

            // Limpa sessão local
            await this.sessionManager.clearSession();

            Logger.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
        } catch (error) {
            Logger.error('Erro ao fazer logout', error);
            throw error;
        }
    }

    /**
     * Verifica se está autenticado
     */
    isAuthenticated(): boolean {
        return this.sessionManager.isAuthenticated();
    }

    /**
     * Retorna utilizador atual
     */
    getCurrentUser(): { userId: string; email: string } | null {
        const userId = this.sessionManager.getUserId();
        const email = this.sessionManager.getEmail();

        if (!userId || !email) {
            return null;
        }

        return { userId, email };
    }

    /**
     * Processa callback de autenticação
     */
    private async handleAuthCallback(uri: vscode.Uri): Promise<void> {
        try {
            // URI esperado: vscode://bobguard-team.bobguard/auth?token=<JWT>&userId=<ID>&email=<EMAIL>
            const query = new URLSearchParams(uri.query);
            const token = query.get('token');
            const userId = query.get('userId');
            const email = query.get('email');

            if (!token || !userId || !email) {
                throw new Error('Parâmetros de autenticação inválidos');
            }

            // Guarda sessão
            await this.sessionManager.saveSession(token, userId, email);

            // Se Firebase configurado, faz login também lá
            if (FirebaseConfig.isConfigured()) {
                const auth = FirebaseConfig.getAuth();
                await signInWithCustomToken(auth, token);
            }

            Logger.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
            
            // Mostra mensagem de boas-vindas
            vscode.window.showInformationMessage(
                `Bem-vindo ao BobGuard, ${email}! 🛡️`
            );
        } catch (error) {
            Logger.error('Erro ao processar callback de autenticação', error);
            vscode.window.showErrorMessage(
                'Erro ao completar autenticação. Por favor, tenta novamente.'
            );
        }
    }

    /**
     * Constrói URL de login
     */
    private buildLoginUrl(): string {
        // Adiciona callback URL para a extensão
        const callbackUrl = encodeURIComponent('vscode://bobguard.bobguard/auth');
        return `${URLS.LOGIN_PAGE}?callback=${callbackUrl}`;
    }

    /**
     * Mostra setup do Firebase
     */
    private async showFirebaseSetup(): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'bobguardFirebaseSetup',
            'BobGuard - Configuração Firebase',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getFirebaseSetupHtml();
    }

    /**
     * HTML para setup do Firebase
     */
    private getFirebaseSetupHtml(): string {
        const exampleConfig = FirebaseConfig.getExampleConfig();
        
        return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuração Firebase</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        h1 {
            color: var(--vscode-foreground);
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 5px;
            border-left: 4px solid var(--vscode-button-background);
        }
        .step h3 {
            margin-top: 0;
            color: var(--vscode-button-background);
        }
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
        }
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <h1>🔥 Configuração do Firebase</h1>
    
    <p>Para usar todas as funcionalidades do BobGuard (autenticação e sincronização de sessões), precisas configurar o Firebase.</p>
    
    <div class="step">
        <h3>Passo 1: Criar Projeto Firebase</h3>
        <p>1. Acede a <a href="https://console.firebase.google.com">Firebase Console</a></p>
        <p>2. Clica em "Add project" ou "Adicionar projeto"</p>
        <p>3. Dá um nome ao projeto (ex: "bobguard-auth")</p>
        <p>4. Segue os passos até criar o projeto</p>
    </div>
    
    <div class="step">
        <h3>Passo 2: Ativar Authentication</h3>
        <p>1. No menu lateral, vai a "Authentication"</p>
        <p>2. Clica em "Get started"</p>
        <p>3. Ativa "Email/Password" e "Google" como métodos de login</p>
    </div>
    
    <div class="step">
        <h3>Passo 3: Ativar Firestore</h3>
        <p>1. No menu lateral, vai a "Firestore Database"</p>
        <p>2. Clica em "Create database"</p>
        <p>3. Escolhe "Start in production mode"</p>
        <p>4. Seleciona a região mais próxima</p>
    </div>
    
    <div class="step">
        <h3>Passo 4: Obter Credenciais</h3>
        <p>1. Vai a "Project Settings" (ícone de engrenagem)</p>
        <p>2. Na tab "General", encontra "Your apps"</p>
        <p>3. Clica no ícone "</>" para adicionar uma web app</p>
        <p>4. Dá um nome (ex: "BobGuard Extension")</p>
        <p>5. Copia o <code>projectId</code> e <code>apiKey</code></p>
    </div>
    
    <div class="step">
        <h3>Passo 5: Configurar no VS Code</h3>
        <p>Adiciona ao teu <code>settings.json</code>:</p>
        <pre>${exampleConfig}</pre>
    </div>
    
    <div style="margin-top: 30px;">
        <a href="https://console.firebase.google.com" class="button">Abrir Firebase Console</a>
        <a href="${URLS.DOCS}" class="button">Ver Documentação Completa</a>
    </div>
    
    <p style="margin-top: 30px; color: var(--vscode-descriptionForeground);">
        <strong>Nota:</strong> Podes usar o BobGuard sem Firebase, mas as funcionalidades de autenticação e sincronização de sessões não estarão disponíveis.
    </p>
</body>
</html>`;
    }

    /**
     * Verifica e renova token se necessário
     */
    async checkAndRefreshToken(): Promise<boolean> {
        if (!this.sessionManager.isAuthenticated()) {
            return false;
        }

        // Se sessão vai expirar em breve, tenta renovar
        if (this.sessionManager.isExpiringSoon()) {
            Logger.info('Sessão vai expirar em breve, tentando renovar...');
            
            try {
                // Em produção, aqui farias um pedido ao backend para renovar o token
                // Por agora, apenas logamos
                Logger.warn('Renovação automática de token não implementada ainda');
                return true;
            } catch (error) {
                Logger.error('Erro ao renovar token', error);
                return false;
            }
        }

        return true;
    }

    /**
     * Cleanup
     */
    dispose(): void {
        if (this.uriHandler) {
            this.uriHandler.dispose();
        }
    }
}
