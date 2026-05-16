import * as vscode from 'vscode';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { Logger } from '../utils/Logger';
import { CONFIG_KEYS, ERROR_MESSAGES } from '../utils/Constants';

/**
 * Configuração e inicialização do Firebase
 */
export class FirebaseConfig {
    private static app: FirebaseApp | null = null;
    private static auth: Auth | null = null;
    private static firestore: Firestore | null = null;

    /**
     * Inicializa Firebase com configurações do VS Code
     */
    static initialize(): boolean {
        try {
            const config = vscode.workspace.getConfiguration();
            const projectId = config.get<string>(CONFIG_KEYS.FIREBASE_PROJECT_ID);
            const apiKey = config.get<string>(CONFIG_KEYS.FIREBASE_API_KEY);

            if (!projectId || !apiKey) {
                Logger.warn('Firebase não configurado. Usando configuração padrão do BobGuard.');
                // Usar configuração padrão do projeto
                return this.initializeWithDefaultConfig();
            }

            const firebaseConfig = {
                apiKey: apiKey,
                authDomain: `${projectId}.firebaseapp.com`,
                projectId: projectId,
                storageBucket: `${projectId}.appspot.com`,
                messagingSenderId: this.extractMessagingSenderId(projectId),
                appId: this.generateAppId(projectId)
            };

            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.firestore = getFirestore(this.app);

            Logger.info('Firebase inicializado com sucesso', { projectId });
            return true;
        } catch (error) {
            Logger.error('Erro ao inicializar Firebase', error);
            return false;
        }
    }

    /**
     * Inicializa com configuração padrão do BobGuard
     */
    private static initializeWithDefaultConfig(): boolean {
        try {
            const firebaseConfig = {
                apiKey: "AIzaSyBunarj3Gfies5ls-SGWoJ2QbDU442oRI0",
                authDomain: "bobguard-36fb0.firebaseapp.com",
                projectId: "bobguard-36fb0",
                storageBucket: "bobguard-36fb0.firebasestorage.app",
                messagingSenderId: "23080734713",
                appId: "1:23080734713:web:6af9a2d965acfc85747728",
                measurementId: "G-PG8JQWP36V"
            };

            this.app = initializeApp(firebaseConfig);
            this.auth = getAuth(this.app);
            this.firestore = getFirestore(this.app);

            Logger.info('Firebase inicializado com configuração padrão do BobGuard');
            return true;
        } catch (error) {
            Logger.error('Erro ao inicializar Firebase com configuração padrão', error);
            return false;
        }
    }

    /**
     * Retorna instância do Auth
     */
    static getAuth(): Auth {
        if (!this.auth) {
            throw new Error(ERROR_MESSAGES.FIREBASE_NOT_CONFIGURED);
        }
        return this.auth;
    }

    /**
     * Retorna instância do Firestore
     */
    static getFirestore(): Firestore {
        if (!this.firestore) {
            throw new Error(ERROR_MESSAGES.FIREBASE_NOT_CONFIGURED);
        }
        return this.firestore;
    }

    /**
     * Verifica se Firebase está configurado
     */
    static isConfigured(): boolean {
        return this.app !== null && this.auth !== null && this.firestore !== null;
    }

    /**
     * Extrai messaging sender ID do project ID (simplificado)
     */
    private static extractMessagingSenderId(projectId: string): string {
        // Em produção, isto viria da configuração real
        // Por agora, geramos um ID baseado no projectId
        return projectId.split('-').map(part => part.length).join('');
    }

    /**
     * Gera app ID baseado no project ID (simplificado)
     */
    private static generateAppId(projectId: string): string {
        // Em produção, isto viria da configuração real
        return `1:${this.extractMessagingSenderId(projectId)}:web:${projectId.substring(0, 10)}`;
    }

    /**
     * Configuração de exemplo para documentação
     */
    static getExampleConfig(): string {
        return `{
  "bobguard.firebase.projectId": "your-project-id",
  "bobguard.firebase.apiKey": "your-api-key"
}

Para obter estas credenciais:
1. Acede a https://console.firebase.google.com
2. Cria ou seleciona um projeto
3. Vai a Project Settings > General
4. Copia o Project ID e Web API Key
5. Adiciona ao settings.json do VS Code`;
    }
}