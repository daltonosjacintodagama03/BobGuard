import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    Timestamp 
} from 'firebase/firestore';
import { FirebaseConfig } from '../auth/FirebaseConfig';
import { Session } from '../models/Session';
import { Logger } from '../utils/Logger';

/**
 * Gestão de sessões no Firestore
 */
export class FirestoreManager {
    private static readonly COLLECTION_NAME = 'sessions';

    /**
     * Guarda sessão no Firestore
     */
    static async saveSession(session: Session): Promise<void> {
        if (!FirebaseConfig.isConfigured()) {
            Logger.warn('Firebase não configurado, sessão não será sincronizada');
            return;
        }

        try {
            const db = FirebaseConfig.getFirestore();
            const sessionRef = doc(db, this.COLLECTION_NAME, session.id);

            await setDoc(sessionRef, {
                ...session,
                timestamp: Timestamp.fromMillis(session.timestamp),
                findings: session.findings.map(f => ({
                    ...f,
                    timestamp: Timestamp.fromMillis(f.timestamp)
                }))
            });

            Logger.firebaseEvent('session_saved', { sessionId: session.id });
        } catch (error) {
            Logger.error('Erro ao guardar sessão no Firestore', error);
            throw error;
        }
    }

    /**
     * Carrega sessão do Firestore
     */
    static async loadSession(sessionId: string): Promise<Session | null> {
        if (!FirebaseConfig.isConfigured()) {
            return null;
        }

        try {
            const db = FirebaseConfig.getFirestore();
            const sessionRef = doc(db, this.COLLECTION_NAME, sessionId);
            const sessionSnap = await getDoc(sessionRef);

            if (!sessionSnap.exists()) {
                return null;
            }

            const data = sessionSnap.data();
            
            return {
                ...data,
                timestamp: data.timestamp.toMillis(),
                findings: data.findings.map((f: any) => ({
                    ...f,
                    timestamp: f.timestamp.toMillis()
                }))
            } as Session;
        } catch (error) {
            Logger.error('Erro ao carregar sessão do Firestore', error);
            return null;
        }
    }

    /**
     * Carrega todas as sessões de um utilizador
     */
    static async loadUserSessions(
        userId: string,
        maxSessions: number = 50
    ): Promise<Session[]> {
        if (!FirebaseConfig.isConfigured()) {
            return [];
        }

        try {
            const db = FirebaseConfig.getFirestore();
            const sessionsRef = collection(db, this.COLLECTION_NAME);
            
            const q = query(
                sessionsRef,
                where('userId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(maxSessions)
            );

            const querySnapshot = await getDocs(q);
            const sessions: Session[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                sessions.push({
                    ...data,
                    timestamp: data.timestamp.toMillis(),
                    findings: data.findings.map((f: any) => ({
                        ...f,
                        timestamp: f.timestamp.toMillis()
                    }))
                } as Session);
            });

            Logger.firebaseEvent('sessions_loaded', { 
                userId, 
                count: sessions.length 
            });

            return sessions;
        } catch (error) {
            Logger.error('Erro ao carregar sessões do utilizador', error);
            return [];
        }
    }

    /**
     * Apaga sessão do Firestore
     */
    static async deleteSession(sessionId: string): Promise<void> {
        if (!FirebaseConfig.isConfigured()) {
            return;
        }

        try {
            const db = FirebaseConfig.getFirestore();
            const sessionRef = doc(db, this.COLLECTION_NAME, sessionId);
            
            await deleteDoc(sessionRef);

            Logger.firebaseEvent('session_deleted', { sessionId });
        } catch (error) {
            Logger.error('Erro ao apagar sessão do Firestore', error);
            throw error;
        }
    }

    /**
     * Carrega sessões de um projeto específico
     */
    static async loadProjectSessions(
        userId: string,
        projectPath: string,
        maxSessions: number = 20
    ): Promise<Session[]> {
        if (!FirebaseConfig.isConfigured()) {
            return [];
        }

        try {
            const db = FirebaseConfig.getFirestore();
            const sessionsRef = collection(db, this.COLLECTION_NAME);
            
            const q = query(
                sessionsRef,
                where('userId', '==', userId),
                where('projectPath', '==', projectPath),
                orderBy('timestamp', 'desc'),
                limit(maxSessions)
            );

            const querySnapshot = await getDocs(q);
            const sessions: Session[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                sessions.push({
                    ...data,
                    timestamp: data.timestamp.toMillis(),
                    findings: data.findings.map((f: any) => ({
                        ...f,
                        timestamp: f.timestamp.toMillis()
                    }))
                } as Session);
            });

            return sessions;
        } catch (error) {
            Logger.error('Erro ao carregar sessões do projeto', error);
            return [];
        }
    }

    /**
     * Sincroniza sessões locais com Firestore
     */
    static async syncSessions(localSessions: Session[]): Promise<void> {
        if (!FirebaseConfig.isConfigured()) {
            return;
        }

        try {
            Logger.info('Sincronizando sessões com Firestore...', {
                count: localSessions.length
            });

            for (const session of localSessions) {
                await this.saveSession(session);
            }

            Logger.success('Sessões sincronizadas com sucesso');
        } catch (error) {
            Logger.error('Erro ao sincronizar sessões', error);
            throw error;
        }
    }
}
