import * as vscode from 'vscode';

/**
 * Sistema de logging centralizado para BobGuard
 */
export class Logger {
    private static outputChannel: vscode.OutputChannel;
    private static isDebugMode: boolean = false;

    /**
     * Inicializa o logger
     */
    static initialize(context: vscode.ExtensionContext) {
        this.outputChannel = vscode.window.createOutputChannel('BobGuard');
        context.subscriptions.push(this.outputChannel);
        
        // Verifica se está em modo debug
        this.isDebugMode = process.env.VSCODE_DEBUG_MODE === 'true';
        
        this.info('BobGuard Logger inicializado');
    }

    /**
     * Log de informação
     */
    static info(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO] [${timestamp}] ${message}`;
        
        this.outputChannel.appendLine(logMessage);
        
        if (data) {
            this.outputChannel.appendLine(JSON.stringify(data, null, 2));
        }

        if (this.isDebugMode) {
            console.log(logMessage, data);
        }
    }

    /**
     * Log de warning
     */
    static warn(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[WARN] [${timestamp}] ${message}`;
        
        this.outputChannel.appendLine(logMessage);
        
        if (data) {
            this.outputChannel.appendLine(JSON.stringify(data, null, 2));
        }

        if (this.isDebugMode) {
            console.warn(logMessage, data);
        }
    }

    /**
     * Log de erro
     */
    static error(message: string, error?: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[ERROR] [${timestamp}] ${message}`;
        
        this.outputChannel.appendLine(logMessage);
        
        if (error) {
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error: ${error.message}`);
                this.outputChannel.appendLine(`Stack: ${error.stack}`);
            } else {
                this.outputChannel.appendLine(JSON.stringify(error, null, 2));
            }
        }

        if (this.isDebugMode) {
            console.error(logMessage, error);
        }

        // Mostra notificação de erro ao utilizador
        vscode.window.showErrorMessage(`BobGuard: ${message}`);
    }

    /**
     * Log de debug (apenas em modo debug)
     */
    static debug(message: string, data?: any) {
        if (!this.isDebugMode) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logMessage = `[DEBUG] [${timestamp}] ${message}`;
        
        this.outputChannel.appendLine(logMessage);
        
        if (data) {
            this.outputChannel.appendLine(JSON.stringify(data, null, 2));
        }

        console.debug(logMessage, data);
    }

    /**
     * Log de sucesso
     */
    static success(message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const logMessage = `[SUCCESS] [${timestamp}] ${message}`;
        
        this.outputChannel.appendLine(logMessage);
        
        if (data) {
            this.outputChannel.appendLine(JSON.stringify(data, null, 2));
        }

        if (this.isDebugMode) {
            console.log(logMessage, data);
        }

        // Mostra notificação de sucesso ao utilizador
        vscode.window.showInformationMessage(`BobGuard: ${message}`);
    }

    /**
     * Mostra o output channel
     */
    static show() {
        this.outputChannel.show();
    }

    /**
     * Limpa o output channel
     */
    static clear() {
        this.outputChannel.clear();
    }

    /**
     * Log de análise iniciada
     */
    static analysisStarted(type: 'file' | 'project', target: string) {
        this.info(`Análise ${type} iniciada`, { target });
    }

    /**
     * Log de análise concluída
     */
    static analysisCompleted(type: 'file' | 'project', target: string, duration: number, findingsCount: number) {
        this.success(`Análise ${type} concluída em ${duration}ms`, {
            target,
            findingsCount
        });
    }

    /**
     * Log de análise falhada
     */
    static analysisFailed(type: 'file' | 'project', target: string, error: any) {
        this.error(`Análise ${type} falhou`, {
            target,
            error: error instanceof Error ? error.message : error
        });
    }

    /**
     * Log de autenticação
     */
    static authEvent(event: 'login' | 'logout' | 'token_refresh' | 'session_expired', userId?: string) {
        this.info(`Auth event: ${event}`, { userId });
    }

    /**
     * Log de Firebase
     */
    static firebaseEvent(event: string, data?: any) {
        this.debug(`Firebase: ${event}`, data);
    }

    /**
     * Log de Bob CLI
     */
    static bobCLI(command: string, duration?: number) {
        if (duration) {
            this.debug(`Bob CLI executado em ${duration}ms`, { command });
        } else {
            this.debug('Bob CLI executando...', { command });
        }
    }
}
