import * as vscode from 'vscode';
import { Finding, SEVERITY_MAP, groupBySeverity } from '../models/Finding';
import { Session, formatTimestamp } from '../models/Session';
import { CustomRule } from '../models/Rule';
import { Logger } from '../utils/Logger';

/**
 * Provider da sidebar principal do BobGuard
 */
export class SidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'bobguard.sidebar';
    
    private _view?: vscode.WebviewView;
    private findings: Finding[] = [];
    private sessions: Session[] = [];
    private customRules: CustomRule[] = [];
    private currentUser: { email: string; userId: string } | null = null;
    private mode: 'minimal' | 'dashboard' = 'minimal';

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {
        // Carrega modo das configurações
        const config = vscode.workspace.getConfiguration();
        this.mode = config.get('bobguard.mode', 'minimal');
    }

    /**
     * Resolve webview view
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };

        webviewView.webview.html = this.getHtmlContent(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });

        Logger.debug('Sidebar view resolved');
    }

    /**
     * Atualiza findings
     */
    public updateFindings(findings: Finding[]): void {
        this.findings = findings;
        this.refresh();
    }

    /**
     * Atualiza sessões
     */
    public updateSessions(sessions: Session[]): void {
        this.sessions = sessions;
        this.refresh();
    }

    /**
     * Atualiza regras custom
     */
    public updateCustomRules(rules: CustomRule[]): void {
        this.customRules = rules;
        this.refresh();
    }

    /**
     * Atualiza utilizador atual
     */
    public updateUser(user: { email: string; userId: string } | null): void {
        this.currentUser = user;
        this.refresh();
    }

    /**
     * Alterna modo
     */
    public toggleMode(): void {
        this.mode = this.mode === 'minimal' ? 'dashboard' : 'minimal';
        
        // Guarda nas configurações
        const config = vscode.workspace.getConfiguration();
        config.update('bobguard.mode', this.mode, vscode.ConfigurationTarget.Global);
        
        this.refresh();
    }

    /**
     * Refresh da view
     */
    public refresh(): void {
        if (this._view) {
            this._view.webview.html = this.getHtmlContent(this._view.webview);
        }
    }

    /**
     * Handle messages from webview
     */
    private async handleMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'analyzeFile':
                await vscode.commands.executeCommand('bobguard.analyzeFile');
                break;
            case 'analyzeProject':
                await vscode.commands.executeCommand('bobguard.analyzeProject');
                break;
            case 'generateRoadmap':
                await vscode.commands.executeCommand('bobguard.generateRoadmap');
                break;
            case 'login':
                await vscode.commands.executeCommand('bobguard.login');
                break;
            case 'logout':
                await vscode.commands.executeCommand('bobguard.logout');
                break;
            case 'addRule':
                await vscode.commands.executeCommand('bobguard.addCustomRule');
                break;
            case 'deleteRule':
                await this.deleteRule(message.ruleId);
                break;
            case 'toggleRule':
                await this.toggleRule(message.ruleId);
                break;
            case 'toggleMode':
                this.toggleMode();
                break;
            case 'navigateToFinding':
                await vscode.commands.executeCommand('bobguard.navigateToFinding', message.finding);
                break;
            case 'viewSession':
                await this.viewSession(message.sessionId);
                break;
            case 'deleteSession':
                await vscode.commands.executeCommand('bobguard.deleteSession', message.sessionId);
                break;
        }
    }

    /**
     * Apaga regra
     */
    private async deleteRule(ruleId: string): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        const rules = config.get<CustomRule[]>('bobguard.customRules', []);
        const updatedRules = rules.filter(r => r.id !== ruleId);
        await config.update('bobguard.customRules', updatedRules, vscode.ConfigurationTarget.Global);
        this.customRules = updatedRules;
        this.refresh();
    }

    /**
     * Toggle regra
     */
    private async toggleRule(ruleId: string): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        const rules = config.get<CustomRule[]>('bobguard.customRules', []);
        const updatedRules = rules.map(r => 
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
        );
        await config.update('bobguard.customRules', updatedRules, vscode.ConfigurationTarget.Global);
        this.customRules = updatedRules;
        this.refresh();
    }

    /**
     * Visualiza sessão
     */
    private async viewSession(sessionId: string): Promise<void> {
        const session = this.sessions.find(s => s.id === sessionId);
        if (session) {
            this.updateFindings(session.findings);
        }
    }

    /**
     * Gera HTML content
     */
    private getHtmlContent(webview: vscode.Webview): string {
        if (!this.currentUser) {
            return this.getLoginHtml();
        }

        if (this.mode === 'dashboard') {
            return this.getDashboardHtml();
        } else {
            return this.getMinimalHtml();
        }
    }

    /**
     * HTML para login
     */
    private getLoginHtml(): string {
        return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BobGuard Login</title>
    <style>${this.getStyles()}</style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🛡️</div>
        <h1>BobGuard</h1>
        <p>AI-Powered Code Review</p>
        <button onclick="login()" class="btn-primary">
            Fazer Login
        </button>
        <p class="hint">Análise inteligente de código com IBM Bob</p>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        function login() {
            vscode.postMessage({ command: 'login' });
        }
    </script>
</body>
</html>`;
    }

    /**
     * HTML para modo minimal
     */
    private getMinimalHtml(): string {
        const groupedFindings = groupBySeverity(this.findings);
        
        return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BobGuard</title>
    <style>${this.getStyles()}</style>
</head>
<body>
    <div class="sidebar">
        <!-- Header -->
        <div class="header">
            <div class="logo">🛡️ BobGuard</div>
            <div class="user-info">
                <span class="user-email">${this.currentUser?.email}</span>
                <button onclick="logout()" class="btn-icon" title="Logout">
                    $(sign-out)
                </button>
            </div>
        </div>

        <!-- Actions -->
        <div class="actions">
            <button onclick="analyzeFile()" class="btn-primary">
                🔍 Analisar este ficheiro
            </button>
            <button onclick="analyzeProject()" class="btn-secondary">
                📦 Analisar projeto completo
            </button>
            <button onclick="generateRoadmap()" class="btn-secondary">
                🗺️ Gerar Roadmap
            </button>
        </div>

        <!-- Custom Rules -->
        <div class="section">
            <div class="section-header">
                <h3>📋 Regras Custom</h3>
                <button onclick="addRule()" class="btn-icon" title="Adicionar regra">+</button>
            </div>
            <div class="rules-list">
                ${this.customRules.length === 0 ? 
                    '<p class="empty-state">Nenhuma regra custom definida</p>' :
                    this.customRules.map(rule => `
                        <div class="rule-item ${rule.enabled ? '' : 'disabled'}">
                            <input type="checkbox" 
                                   ${rule.enabled ? 'checked' : ''} 
                                   onchange="toggleRule('${rule.id}')" />
                            <span class="rule-text">${rule.text}</span>
                            <button onclick="deleteRule('${rule.id}')" class="btn-icon-small">×</button>
                        </div>
                    `).join('')
                }
            </div>
        </div>

        <!-- Mode Toggle -->
        <div class="mode-toggle">
            <button onclick="toggleMode()" class="btn-secondary">
                ⚙️ Modo: ${this.mode === 'minimal' ? 'Minimal' : 'Dashboard'}
            </button>
        </div>

        <!-- Findings -->
        <div class="section">
            <h3>📊 Findings (${this.findings.length})</h3>
            ${this.findings.length === 0 ?
                '<p class="empty-state">Nenhum finding. Executa uma análise!</p>' :
                Object.entries(groupedFindings).map(([severity, findings]) => {
                    if (findings.length === 0) return '';
                    const info = SEVERITY_MAP[severity as Finding['severity']];
                    return `
                        <div class="severity-group">
                            <div class="severity-header" style="color: ${info.color}">
                                ${info.icon} ${info.label} (${findings.length})
                            </div>
                            ${findings.map(f => `
                                <div class="finding-item" onclick="navigateToFinding('${f.id}')">
                                    <div class="finding-title">${f.title}</div>
                                    <div class="finding-location">${this.getRelativePath(f.filePath)}:${f.line}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')
            }
        </div>

        <!-- History -->
        <div class="section">
            <h3>📜 Histórico</h3>
            ${this.sessions.length === 0 ?
                '<p class="empty-state">Nenhuma sessão anterior</p>' :
                this.sessions.slice(0, 5).map(s => `
                    <div class="session-item" onclick="viewSession('${s.id}')">
                        <div class="session-info">
                            <span class="session-time">${formatTimestamp(s.timestamp)}</span>
                            <span class="session-count">${s.findings.length} issues</span>
                        </div>
                        <button onclick="deleteSession('${s.id}'); event.stopPropagation();" 
                                class="btn-icon-small">×</button>
                    </div>
                `).join('')
            }
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function analyzeFile() {
            vscode.postMessage({ command: 'analyzeFile' });
        }
        
        function analyzeProject() {
            vscode.postMessage({ command: 'analyzeProject' });
        }
        
        function generateRoadmap() {
            vscode.postMessage({ command: 'generateRoadmap' });
        }
        
        function login() {
            vscode.postMessage({ command: 'login' });
        }
        
        function logout() {
            vscode.postMessage({ command: 'logout' });
        }
        
        function addRule() {
            vscode.postMessage({ command: 'addRule' });
        }
        
        function deleteRule(ruleId) {
            vscode.postMessage({ command: 'deleteRule', ruleId });
        }
        
        function toggleRule(ruleId) {
            vscode.postMessage({ command: 'toggleRule', ruleId });
        }
        
        function toggleMode() {
            vscode.postMessage({ command: 'toggleMode' });
        }
        
        function navigateToFinding(findingId) {
            vscode.postMessage({ command: 'navigateToFinding', findingId });
        }
        
        function viewSession(sessionId) {
            vscode.postMessage({ command: 'viewSession', sessionId });
        }
        
        function deleteSession(sessionId) {
            vscode.postMessage({ command: 'deleteSession', sessionId });
        }
    </script>
</body>
</html>`;
    }

    /**
     * HTML para modo dashboard
     */
    private getDashboardHtml(): string {
        const stats = this.calculateStats();
        
        return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BobGuard Dashboard</title>
    <style>${this.getStyles()}</style>
</head>
<body>
    <div class="sidebar dashboard">
        <!-- Header (same as minimal) -->
        <div class="header">
            <div class="logo">🛡️ BobGuard</div>
            <div class="user-info">
                <span class="user-email">${this.currentUser?.email}</span>
                <button onclick="logout()" class="btn-icon">$(sign-out)</button>
            </div>
        </div>

        <!-- Actions (same as minimal) -->
        <div class="actions">
            <button onclick="analyzeFile()" class="btn-primary">🔍 Analisar este ficheiro</button>
            <button onclick="analyzeProject()" class="btn-secondary">📦 Analisar projeto</button>
            <button onclick="generateRoadmap()" class="btn-secondary">🗺️ Gerar Roadmap</button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card critical">
                <div class="stat-value">${stats.critical}</div>
                <div class="stat-label">Crítico</div>
            </div>
            <div class="stat-card high">
                <div class="stat-value">${stats.high}</div>
                <div class="stat-label">Alto</div>
            </div>
            <div class="stat-card medium">
                <div class="stat-value">${stats.medium}</div>
                <div class="stat-label">Médio</div>
            </div>
            <div class="stat-card low">
                <div class="stat-value">${stats.low}</div>
                <div class="stat-label">Baixo</div>
            </div>
        </div>

        <!-- Category Distribution -->
        <div class="section">
            <h3>📊 Distribuição por Categoria</h3>
            <div class="category-bars">
                ${Object.entries(stats.byCategory).map(([cat, count]) => `
                    <div class="category-bar">
                        <span class="category-label">${cat}</span>
                        <div class="bar-container">
                            <div class="bar-fill" style="width: ${(count / stats.total * 100)}%"></div>
                        </div>
                        <span class="category-count">${count}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Mode Toggle -->
        <div class="mode-toggle">
            <button onclick="toggleMode()" class="btn-secondary">
                ⚙️ Modo: Dashboard
            </button>
        </div>

        <!-- Recent Findings -->
        <div class="section">
            <h3>🔍 Findings Recentes</h3>
            ${this.findings.slice(0, 10).map(f => {
                const info = SEVERITY_MAP[f.severity];
                return `
                    <div class="finding-item" onclick="navigateToFinding('${f.id}')">
                        <span style="color: ${info.color}">${info.icon}</span>
                        <div class="finding-content">
                            <div class="finding-title">${f.title}</div>
                            <div class="finding-location">${this.getRelativePath(f.filePath)}:${f.line}</div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        function analyzeFile() { vscode.postMessage({ command: 'analyzeFile' }); }
        function analyzeProject() { vscode.postMessage({ command: 'analyzeProject' }); }
        function generateRoadmap() { vscode.postMessage({ command: 'generateRoadmap' }); }
        function logout() { vscode.postMessage({ command: 'logout' }); }
        function toggleMode() { vscode.postMessage({ command: 'toggleMode' }); }
        function navigateToFinding(findingId) { vscode.postMessage({ command: 'navigateToFinding', findingId }); }
    </script>
</body>
</html>`;
    }

    /**
     * Calcula estatísticas
     */
    private calculateStats() {
        const stats = {
            total: this.findings.length,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            byCategory: {
                security: 0,
                performance: 0,
                quality: 0,
                legacy: 0
            }
        };

        this.findings.forEach(f => {
            stats[f.severity]++;
            stats.byCategory[f.category]++;
        });

        return stats;
    }

    /**
     * Obtém path relativo
     */
    private getRelativePath(filePath: string): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            return filePath.replace(workspaceFolder.uri.fsPath, '');
        }
        return filePath;
    }

    /**
     * Estilos CSS
     */
    private getStyles(): string {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: var(--vscode-font-family);
                font-size: var(--vscode-font-size);
                color: var(--vscode-foreground);
                background: var(--vscode-sideBar-background);
                padding: 10px;
            }
            .sidebar { display: flex; flex-direction: column; gap: 15px; }
            .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                padding-bottom: 10px;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            .logo { font-size: 18px; font-weight: bold; }
            .user-info { display: flex; align-items: center; gap: 8px; }
            .user-email { font-size: 12px; opacity: 0.8; }
            .actions { display: flex; flex-direction: column; gap: 8px; }
            .btn-primary, .btn-secondary, .btn-icon {
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                transition: opacity 0.2s;
            }
            .btn-primary {
                background: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
            }
            .btn-primary:hover { opacity: 0.9; }
            .btn-secondary {
                background: var(--vscode-button-secondaryBackground);
                color: var(--vscode-button-secondaryForeground);
            }
            .btn-secondary:hover { opacity: 0.9; }
            .btn-icon {
                background: transparent;
                padding: 4px 8px;
            }
            .btn-icon-small {
                background: transparent;
                border: none;
                cursor: pointer;
                font-size: 16px;
                opacity: 0.6;
            }
            .btn-icon-small:hover { opacity: 1; }
            .section {
                background: var(--vscode-editor-background);
                padding: 12px;
                border-radius: 6px;
            }
            .section h3 { 
                font-size: 14px; 
                margin-bottom: 10px;
                font-weight: 600;
            }
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .empty-state {
                text-align: center;
                opacity: 0.6;
                font-size: 12px;
                padding: 20px 0;
            }
            .rules-list { display: flex; flex-direction: column; gap: 6px; }
            .rule-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px;
                background: var(--vscode-input-background);
                border-radius: 4px;
                font-size: 12px;
            }
            .rule-item.disabled { opacity: 0.5; }
            .rule-text { flex: 1; }
            .severity-group { margin-bottom: 12px; }
            .severity-header {
                font-weight: 600;
                margin-bottom: 6px;
                font-size: 13px;
            }
            .finding-item {
                padding: 8px;
                background: var(--vscode-input-background);
                border-radius: 4px;
                margin-bottom: 6px;
                cursor: pointer;
                transition: background 0.2s;
            }
            .finding-item:hover {
                background: var(--vscode-list-hoverBackground);
            }
            .finding-title {
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 2px;
            }
            .finding-location {
                font-size: 11px;
                opacity: 0.7;
            }
            .session-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px;
                background: var(--vscode-input-background);
                border-radius: 4px;
                margin-bottom: 6px;
                cursor: pointer;
            }
            .session-item:hover {
                background: var(--vscode-list-hoverBackground);
            }
            .session-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .session-time { font-size: 12px; }
            .session-count { font-size: 11px; opacity: 0.7; }
            .mode-toggle { text-align: center; }
            .login-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                gap: 20px;
            }
            .login-container .logo { font-size: 48px; }
            .login-container h1 { font-size: 24px; }
            .login-container p { opacity: 0.7; }
            .hint { font-size: 12px; opacity: 0.6; }
            
            /* Dashboard specific */
            .stats-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .stat-card {
                padding: 15px;
                border-radius: 6px;
                text-align: center;
            }
            .stat-card.critical { background: rgba(255, 0, 0, 0.1); }
            .stat-card.high { background: rgba(255, 140, 0, 0.1); }
            .stat-card.medium { background: rgba(255, 215, 0, 0.1); }
            .stat-card.low { background: rgba(74, 158, 255, 0.1); }
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 4px;
            }
            .stat-label {
                font-size: 11px;
                opacity: 0.8;
            }
            .category-bars { display: flex; flex-direction: column; gap: 8px; }
            .category-bar {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
            }
            .category-label { min-width: 80px; }
            .bar-container {
                flex: 1;
                height: 8px;
                background: var(--vscode-input-background);
                border-radius: 4px;
                overflow: hidden;
            }
            .bar-fill {
                height: 100%;
                background: var(--vscode-button-background);
                transition: width 0.3s;
            }
            .category-count { min-width: 30px; text-align: right; }
            .finding-content { flex: 1; }
        `;
    }
}
