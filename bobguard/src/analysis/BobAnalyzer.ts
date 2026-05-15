import * as vscode from 'vscode';
import { Finding } from '../models/Finding';
import { BobCLI } from '../utils/BobCLI';
import { Logger } from '../utils/Logger';
import { CustomRule, rulesToPrompt } from '../models/Rule';
import { v4 as uuidv4 } from 'uuid';

/**
 * Motor principal de análise usando Bob CLI
 */
export class BobAnalyzer {
    /**
     * Analisa um ficheiro completo
     */
    static async analyzeFile(
        filePath: string,
        content: string,
        language: string,
        customRules: CustomRule[] = []
    ): Promise<Finding[]> {
        Logger.analysisStarted('file', filePath);
        const startTime = Date.now();

        try {
            // Prepara prompt com regras custom
            const customRulesPrompt = rulesToPrompt(customRules);

            // Executa análise completa
            const response = await BobCLI.analyzeCode(
                content,
                language,
                'all',
                customRulesPrompt
            );

            // Parse da resposta
            const rawFindings = BobCLI.parseJSON<any[]>(response);

            // Converte para Finding objects
            const findings = rawFindings.map(raw => this.rawToFinding(raw, filePath));

            const duration = Date.now() - startTime;
            Logger.analysisCompleted('file', filePath, duration, findings.length);

            return findings;
        } catch (error) {
            Logger.analysisFailed('file', filePath, error);
            throw error;
        }
    }

    /**
     * Analisa múltiplos ficheiros (projeto completo)
     */
    static async analyzeProject(
        workspaceRoot: string,
        customRules: CustomRule[] = [],
        progressCallback?: (current: number, total: number, file: string) => void
    ): Promise<Finding[]> {
        Logger.analysisStarted('project', workspaceRoot);
        const startTime = Date.now();

        try {
            // Encontra todos os ficheiros relevantes
            const files = await this.findProjectFiles(workspaceRoot);
            
            if (files.length === 0) {
                Logger.warn('Nenhum ficheiro encontrado para análise');
                return [];
            }

            Logger.info(`Analisando ${files.length} ficheiros...`);

            const allFindings: Finding[] = [];
            let processedFiles = 0;

            // Analisa cada ficheiro
            for (const file of files) {
                try {
                    if (progressCallback) {
                        progressCallback(processedFiles + 1, files.length, file.fsPath);
                    }

                    const document = await vscode.workspace.openTextDocument(file);
                    const content = document.getText();
                    const language = document.languageId;

                    const findings = await this.analyzeFile(
                        file.fsPath,
                        content,
                        language,
                        customRules
                    );

                    allFindings.push(...findings);
                    processedFiles++;
                } catch (error) {
                    Logger.warn(`Erro ao analisar ${file.fsPath}`, error);
                    // Continua com próximo ficheiro
                }
            }

            const duration = Date.now() - startTime;
            Logger.analysisCompleted('project', workspaceRoot, duration, allFindings.length);

            return allFindings;
        } catch (error) {
            Logger.analysisFailed('project', workspaceRoot, error);
            throw error;
        }
    }

    /**
     * Analisa apenas segurança
     */
    static async analyzeSecurityOnly(
        filePath: string,
        content: string,
        language: string
    ): Promise<Finding[]> {
        try {
            const response = await BobCLI.analyzeCode(content, language, 'security');
            const rawFindings = BobCLI.parseJSON<any[]>(response);
            return rawFindings.map(raw => this.rawToFinding(raw, filePath));
        } catch (error) {
            Logger.error('Erro na análise de segurança', error);
            throw error;
        }
    }

    /**
     * Analisa apenas performance
     */
    static async analyzePerformanceOnly(
        filePath: string,
        content: string,
        language: string
    ): Promise<Finding[]> {
        try {
            const response = await BobCLI.analyzeCode(content, language, 'performance');
            const rawFindings = BobCLI.parseJSON<any[]>(response);
            return rawFindings.map(raw => this.rawToFinding(raw, filePath));
        } catch (error) {
            Logger.error('Erro na análise de performance', error);
            throw error;
        }
    }

    /**
     * Analisa apenas qualidade
     */
    static async analyzeQualityOnly(
        filePath: string,
        content: string,
        language: string
    ): Promise<Finding[]> {
        try {
            const response = await BobCLI.analyzeCode(content, language, 'quality');
            const rawFindings = BobCLI.parseJSON<any[]>(response);
            return rawFindings.map(raw => this.rawToFinding(raw, filePath));
        } catch (error) {
            Logger.error('Erro na análise de qualidade', error);
            throw error;
        }
    }

    /**
     * Analisa apenas código legado
     */
    static async analyzeLegacyOnly(
        filePath: string,
        content: string,
        language: string
    ): Promise<Finding[]> {
        try {
            const response = await BobCLI.analyzeCode(content, language, 'legacy');
            const rawFindings = BobCLI.parseJSON<any[]>(response);
            return rawFindings.map(raw => this.rawToFinding(raw, filePath));
        } catch (error) {
            Logger.error('Erro na análise de código legado', error);
            throw error;
        }
    }

    /**
     * Converte raw finding para Finding object
     */
    private static rawToFinding(raw: any, filePath: string): Finding {
        return {
            id: uuidv4(),
            severity: this.normalizeSeverity(raw.severity),
            category: this.normalizeCategory(raw.category),
            title: raw.title || 'Issue sem título',
            description: raw.description || '',
            filePath: filePath,
            line: raw.line || 1,
            column: raw.column,
            code: raw.code,
            suggestion: raw.suggestion || 'Sem sugestão disponível',
            ruleId: raw.ruleId,
            timestamp: Date.now()
        };
    }

    /**
     * Normaliza severidade
     */
    private static normalizeSeverity(severity: string): Finding['severity'] {
        const normalized = severity?.toLowerCase();
        if (['critical', 'high', 'medium', 'low'].includes(normalized)) {
            return normalized as Finding['severity'];
        }
        return 'medium'; // default
    }

    /**
     * Normaliza categoria
     */
    private static normalizeCategory(category: string): Finding['category'] {
        const normalized = category?.toLowerCase();
        if (['security', 'performance', 'quality', 'legacy'].includes(normalized)) {
            return normalized as Finding['category'];
        }
        return 'quality'; // default
    }

    /**
     * Encontra ficheiros do projeto para análise
     */
    private static async findProjectFiles(workspaceRoot: string): Promise<vscode.Uri[]> {
        const patterns = [
            '**/*.{js,jsx,ts,tsx}',
            '**/*.{py,java,c,cpp,cs}',
            '**/*.{go,rs,rb,php}',
            '**/*.{html,css,scss}'
        ];

        const excludePatterns = [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/out/**',
            '**/.git/**',
            '**/coverage/**',
            '**/*.min.js',
            '**/*.bundle.js'
        ];

        const allFiles: vscode.Uri[] = [];

        for (const pattern of patterns) {
            const files = await vscode.workspace.findFiles(
                pattern,
                `{${excludePatterns.join(',')}}`
            );
            allFiles.push(...files);
        }

        // Remove duplicados
        const uniqueFiles = Array.from(new Set(allFiles.map(f => f.fsPath)))
            .map(path => vscode.Uri.file(path));

        return uniqueFiles;
    }

    /**
     * Extrai snippet de código ao redor de uma linha
     */
    static async getCodeSnippet(
        filePath: string,
        line: number,
        contextLines: number = 3
    ): Promise<string> {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            const startLine = Math.max(0, line - contextLines - 1);
            const endLine = Math.min(document.lineCount - 1, line + contextLines);

            const lines: string[] = [];
            for (let i = startLine; i <= endLine; i++) {
                const lineText = document.lineAt(i).text;
                const lineNumber = i + 1;
                const marker = lineNumber === line ? '→' : ' ';
                lines.push(`${marker} ${lineNumber}: ${lineText}`);
            }

            return lines.join('\n');
        } catch (error) {
            Logger.error('Erro ao extrair snippet de código', error);
            return '';
        }
    }
}
