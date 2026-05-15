import * as vscode from 'vscode';
import { Logger } from '../utils/Logger';
import { STORAGE_KEYS, LIMITS, ERROR_MESSAGES } from '../utils/Constants';

/**
 * Interface para dados de sessão
 */
export interface SessionData {
    token: string;
    userId: string;
    email: string;
    expiresAt: number;
}

/**
 * Gestão de sessões locais no VS Code
 */
export class SessionManager {
    private context: vscode.ExtensionContext;
    private currentSession: SessionData | null = null;
    private onSessionChangeEmitter = new vscode.EventEmitter<SessionData | null>();
    
    /**
     * Evento disparado quando a sessão muda
     */
    readonly onSessionChange = this.onSessionChangeEmitter.event;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Inicializa e carrega sessão existente
     */
    async initialize(): Promise<boolean> {
        try {
            const token = await this.context.secrets.get(STORAGE_KEYS.AUTH_TOKEN);
            const userId = this.context.globalState.get<string>(STORAGE_KEYS.USER_ID);
            const email = this.context.globalState.get<string>(STORAGE_KEYS.USER_EMAIL);
            
            if (token && userId && email) {
                // Verifica se token ainda é válido
                const expiresAt = this.extractExpiryFromToken(token);
                
                if (expiresAt > Date.now()) {
                    this.currentSession = { token, userId, email, expiresAt };
                    Logger.info('Sessão existente carregada', { userId, email });
                    this.onSessionChangeEmitter.fire(this.currentSession);
                    return true;
                } else {
                    Logger.warn('Sessão expirada, limpando...');
                    await this.clearSession();
                }
            }
            
            return false;
        } catch (error) {
            Logger.error('Erro ao inicializar sessão', error);
            return false;
        }
    }

    /**
     * Guarda nova sessão
     */
    async saveSession(token: string, userId: string, email: string): Promise<void> {
        try {
            const expiresAt = this.extractExpiryFromToken(token);
            
            // Guarda token no SecretStorage (encriptado)
            await this.context.secrets.store(STORAGE_KEYS.AUTH_TOKEN, token);
            
            // Guarda outros dados no GlobalState
            await this.context.globalState.update(STORAGE_KEYS.USER_ID, userId);
            await this.context.globalState.update(STORAGE_KEYS.USER_EMAIL, email);
            
            this.currentSession = { token, userId, email, expiresAt };
            
            Logger.authEvent('login', userId);
            Logger.info('Sessão guardada com sucesso', { userId, email });
            
            this.onSessionChangeEmitter.fire(this.currentSession);
        } catch (error) {
            Logger.error('Erro ao guardar sessão', error);
            throw error;
        }
    }

    /**
     * Limpa sessão atual
     */
    async clearSession(): Promise<void> {
        try {
            const userId = this.currentSession?.userId;
            
            await this.context.secrets.delete(STORAGE_KEYS.AUTH_TOKEN);
            await this.context.globalState.update(STORAGE_KEYS.USER_ID, undefined);
            await this.context.globalState.update(STORAGE_KEYS.USER_EMAIL, undefined);
            
            this.currentSession = null;
            
            Logger.authEvent('logout', userId);
            Logger.info('Sessão limpa');
            
            this.onSessionChangeEmitter.fire(null);
        } catch (error) {
            Logger.error('Erro ao limpar sessão', error);
            throw error;
        }
    }

    /**
     * Retorna sessão atual
     */
    getSession(): SessionData | null {
        return this.currentSession;
    }

    /**
     * Verifica se está autenticado
     */
    isAuthenticated(): boolean {
        if (!this.currentSession) {
            return false;
        }
        
        // Verifica se token ainda é válido
        if (this.currentSession.expiresAt <= Date.now()) {
            Logger.authEvent('session_expired', this.currentSession.userId);
            this.clearSession();
            return false;
        }
        
        return true;
    }

    /**
     * Retorna token atual
     */
    getToken(): string | null {
        if (!this.isAuthenticated()) {
            return null;
        }
        return this.currentSession!.token;
    }

    /**
     * Retorna user ID atual
     */
    getUserId(): string | null {
        if (!this.isAuthenticated()) {
            return null;
        }
        return this.currentSession!.userId;
    }

    /**
     * Retorna email atual
     */
    getEmail(): string | null {
        if (!this.isAuthenticated()) {
            return null;
        }
        return this.currentSession!.email;
    }

    /**
     * Verifica se sessão vai expirar em breve (menos de 1 dia)
     */
    isExpiringSoon(): boolean {
        if (!this.currentSession) {
            return false;
        }
        
        const oneDayInMs = 24 * 60 * 60 * 1000;
        return (this.currentSession.expiresAt - Date.now()) < oneDayInMs;
    }

    /**
     * Extrai data de expiração do token JWT
     * (Simplificado - em produção usar biblioteca JWT)
     */
    private extractExpiryFromToken(token: string): number {
        try {
            // JWT tem formato: header.payload.signature
            const parts = token.split('.');
            if (parts.length !== 3) {
                // Token inválido, define expiração padrão
                return Date.now() + LIMITS.SESSION_EXPIRY;
            }
            
            // Decode payload (base64)
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            
            // JWT usa 'exp' em segundos, convertemos para ms
            if (payload.exp) {
                return payload.exp * 1000;
            }
            
            // Se não tem exp, usa expiração padrão
            return Date.now() + LIMITS.SESSION_EXPIRY;
        } catch (error) {
            Logger.warn('Erro ao extrair expiração do token, usando padrão', error);
            return Date.now() + LIMITS.SESSION_EXPIRY;
        }
    }

    /**
     * Atualiza token (refresh)
     */
    async refreshToken(newToken: string): Promise<void> {
        if (!this.currentSession) {
            throw new Error(ERROR_MESSAGES.AUTH_REQUIRED);
        }
        
        try {
            const expiresAt = this.extractExpiryFromToken(newToken);
            
            await this.context.secrets.store(STORAGE_KEYS.AUTH_TOKEN, newToken);
            
            this.currentSession.token = newToken;
            this.currentSession.expiresAt = expiresAt;
            
            Logger.authEvent('token_refresh', this.currentSession.userId);
            Logger.info('Token atualizado');
            
            this.onSessionChangeEmitter.fire(this.currentSession);
        } catch (error) {
            Logger.error('Erro ao atualizar token', error);
            throw error;
        }
    }

    /**
     * Retorna informação de sessão para display
     */
    getSessionInfo(): string {
        if (!this.currentSession) {
            return 'Não autenticado';
        }
        
        const expiresIn = this.currentSession.expiresAt - Date.now();
        const daysLeft = Math.floor(expiresIn / (24 * 60 * 60 * 1000));
        
        return `${this.currentSession.email} (expira em ${daysLeft} dias)`;
    }
}
