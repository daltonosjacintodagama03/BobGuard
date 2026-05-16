import * as vscode from 'vscode';
import { Session } from '../models/Session';
import { Logger } from '../utils/Logger';
import { STORAGE_KEYS, LIMITS } from '../utils/Constants';

/**
 * Cache local de sessões
 */
export class LocalCache {
    private context: vscode.ExtensionContext;
    private sessions: Map<string, Session> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Inicializa cache carregando sessões do storage
     */
    async initialize(): Promise<void> {
        try {
            const cachedSessions = this.context.globalState.get<Session[]>(
                STORAGE_KEYS.SESSIONS_CACHE,
                []
            );

            cachedSessions.forEach(session => {
                this.sessions.set(session.id, session);
            });

            Logger.info('Cache local inicializado', { 
                sessionsCount: this.sessions.size 
            });
        } catch (error) {
            Logger.error('Erro ao inicializar cache local', error);
        }
    }

    /**
     * Adiciona sessão ao cache
     */
    async addSession(session: Session): Promise<void> {
        try {
            this.sessions.set(session.id, session);
            await this.persist();
            
            Logger.debug('Sessão adicionada ao cache', { sessionId: session.id });
        } catch (error) {
            Logger.error('Erro ao adicionar sessão ao cache', error);
            throw error;
        }
    }

    /**
     * Obtém sessão do cache
     */
    getSession(sessionId: string): Session | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Obtém todas as sessões
     */
    getAllSessions(): Session[] {
        return Array.from(this.sessions.values())
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Obtém sessões de um utilizador
     */
    getUserSessions(userId: string): Session[] {
        return this.getAllSessions()
            .filter(s => s.userId === userId);
    }

    /**
     * Obtém sessões de um projeto
     */
    getProjectSessions(projectPath: string): Session[] {
        return this.getAllSessions()
            .filter(s => s.projectPath === projectPath);
    }

    /**
     * Remove sessão do cache
     */
    async removeSession(sessionId: string): Promise<void> {
        try {
            this.sessions.delete(sessionId);
            await this.persist();
            
            Logger.debug('Sessão removida do cache', { sessionId });
        } catch (error) {
            Logger.error('Erro ao remover sessão do cache', error);
            throw error;
        }
    }

    /**
     * Limpa cache
     */
    async clear(): Promise<void> {
        try {
            this.sessions.clear();
            await this.persist();
            
            Logger.info('Cache limpo');
        } catch (error) {
            Logger.error('Erro ao limpar cache', error);
            throw error;
        }
    }

    /**
     * Persiste cache no storage
     */
    private async persist(): Promise<void> {
        try {
            const sessionsArray = this.getAllSessions();
            
            // Limita número de sessões no cache
            const limitedSessions = sessionsArray.slice(0, LIMITS.MAX_SESSIONS_CACHE);
            
            await this.context.globalState.update(
                STORAGE_KEYS.SESSIONS_CACHE,
                limitedSessions
            );
        } catch (error) {
            Logger.error('Erro ao persistir cache', error);
            throw error;
        }
    }

    /**
     * Obtém última sessão
     */
    getLastSession(): Session | undefined {
        const sessions = this.getAllSessions();
        return sessions.length > 0 ? sessions[0] : undefined;
    }

    /**
     * Obtém estatísticas do cache
     */
    getStats(): {
        totalSessions: number;
        totalFindings: number;
        oldestSession: number | null;
        newestSession: number | null;
    } {
        const sessions = this.getAllSessions();
        
        return {
            totalSessions: sessions.length,
            totalFindings: sessions.reduce((sum, s) => sum + s.findings.length, 0),
            oldestSession: sessions.length > 0 ? sessions[sessions.length - 1].timestamp : null,
            newestSession: sessions.length > 0 ? sessions[0].timestamp : null
        };
    }

    /**
     * Limpa sessões antigas (mais de 30 dias)
     */
    async cleanOldSessions(): Promise<number> {
        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const sessions = this.getAllSessions();
            
            let removedCount = 0;
            
            for (const session of sessions) {
                if (session.timestamp < thirtyDaysAgo) {
                    this.sessions.delete(session.id);
                    removedCount++;
                }
            }
            
            if (removedCount > 0) {
                await this.persist();
                Logger.info(`${removedCount} sessões antigas removidas do cache`);
            }
            
            return removedCount;
        } catch (error) {
            Logger.error('Erro ao limpar sessões antigas', error);
            return 0;
        }
    }
}
