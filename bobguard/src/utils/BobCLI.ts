import { spawn } from 'child_process';
import { Logger } from './Logger';
import { LIMITS } from './Constants';

/**
 * Wrapper para comunicação com Bob CLI
 */
export class BobCLI {
    /**
     * Executa um comando Bob e retorna a resposta
     */
    static async execute(prompt: string, timeout: number = LIMITS.BOB_TIMEOUT): Promise<string> {
        const startTime = Date.now();
        Logger.bobCLI(prompt.substring(0, 100) + '...');

        return new Promise((resolve, reject) => {
            const bobProcess = spawn('bob', ['ask', prompt], {
                shell: true,
                cwd: process.cwd()
            });

            let stdout = '';
            let stderr = '';
            let timeoutHandle: NodeJS.Timeout;

            // Timeout handler
            if (timeout > 0) {
                timeoutHandle = setTimeout(() => {
                    bobProcess.kill('SIGTERM');
                    reject(new Error(`Bob CLI timeout após ${timeout}ms`));
                }, timeout);
            }

            bobProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            bobProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            bobProcess.on('close', (code) => {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }

                const duration = Date.now() - startTime;
                Logger.bobCLI(prompt.substring(0, 100) + '...', duration);

                if (code !== 0) {
                    Logger.error(`Bob CLI falhou com código ${code}`, stderr);
                    reject(new Error(`Bob process exited with code ${code}: ${stderr}`));
                } else {
                    resolve(stdout);
                }
            });

            bobProcess.on('error', (error) => {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                }
                Logger.error('Erro ao executar Bob CLI', error);
                reject(new Error(`Failed to spawn Bob process: ${error.message}`));
            });
        });
    }

    /**
     * Verifica se Bob CLI está disponível
     */
    static async isAvailable(): Promise<boolean> {
        try {
            await this.execute('test', 5000);
            return true;
        } catch (error) {
            Logger.warn('Bob CLI não está disponível', error);
            return false;
        }
    }

    /**
     * Executa análise de código com Bob
     */
    static async analyzeCode(
        code: string,
        language: string,
        analysisType: 'security' | 'performance' | 'quality' | 'legacy' | 'all',
        customRules?: string
    ): Promise<string> {
        const prompt = this.buildAnalysisPrompt(code, language, analysisType, customRules);
        return this.execute(prompt);
    }

    /**
     * Constrói prompt de análise
     */
    private static buildAnalysisPrompt(
        code: string,
        language: string,
        analysisType: string,
        customRules?: string
    ): string {
        let basePrompt = `Analisa o seguinte código ${language} e identifica problemas.

IMPORTANTE: Responde APENAS com um array JSON válido de findings. Cada finding deve ter:
{
  "severity": "critical" | "high" | "medium" | "low",
  "category": "security" | "performance" | "quality" | "legacy",
  "title": "Título curto do problema",
  "description": "Descrição detalhada",
  "line": número da linha (se identificável),
  "suggestion": "Como corrigir"
}

`;

        // Adiciona instruções específicas por tipo
        if (analysisType === 'security' || analysisType === 'all') {
            basePrompt += `\n**SEGURANÇA:**
- SQL/NoSQL/Command/LDAP injection
- Hardcoded secrets (API keys, passwords, tokens)
- Auth/Authorization flaws
- Sensitive data exposure
- Input validation missing
- XSS, CSRF, SSRF vulnerabilities
- Insecure cryptography
`;
        }

        if (analysisType === 'performance' || analysisType === 'all') {
            basePrompt += `\n**PERFORMANCE:**
- Inefficient loops (O(n²)+)
- Blocking I/O operations
- Memory leaks
- N+1 query problems
- Missing caching opportunities
`;
        }

        if (analysisType === 'quality' || analysisType === 'all') {
            basePrompt += `\n**QUALIDADE:**
- Dead code and unused imports
- Long functions (>50 lines)
- High cyclomatic complexity
- Poor naming conventions
- Missing error handling
- Code duplication
- SOLID violations
`;
        }

        if (analysisType === 'legacy' || analysisType === 'all') {
            basePrompt += `\n**CÓDIGO LEGADO:**
- Deprecated APIs and patterns
- Outdated dependencies
- Missing documentation
- Tight coupling
- Technical debt
`;
        }

        if (customRules) {
            basePrompt += `\n${customRules}`;
        }

        basePrompt += `\n\nCódigo a analisar:\n\`\`\`${language}\n${code}\n\`\`\`\n\nResponde APENAS com o array JSON, sem texto adicional.`;

        return basePrompt;
    }

    /**
     * Gera roadmap de projeto
     */
    static async generateRoadmap(
        projectStructure: string,
        mainFiles: string[],
        dependencies: string[]
    ): Promise<string> {
        const prompt = `Analisa este projeto e gera um roadmap completo.

**ESTRUTURA DO PROJETO:**
${projectStructure}

**FICHEIROS PRINCIPAIS:**
${mainFiles.join('\n')}

**DEPENDÊNCIAS:**
${dependencies.join('\n')}

Responde com um JSON contendo:
{
  "overview": {
    "description": "descrição do projeto",
    "mainTechnologies": ["tech1", "tech2"],
    "mainFlows": ["fluxo1", "fluxo2"],
    "keyFeatures": ["feature1", "feature2"]
  },
  "architecture": {
    "pattern": "padrão arquitetural",
    "layers": ["layer1", "layer2"],
    "dataFlow": "descrição do fluxo de dados",
    "strengths": ["ponto forte 1"],
    "weaknesses": ["ponto fraco 1"]
  },
  "criticalPoints": [
    {
      "title": "título",
      "description": "descrição",
      "location": "ficheiro/módulo",
      "impact": "high|medium|low",
      "risk": "high|medium|low",
      "recommendation": "recomendação"
    }
  ],
  "technicalDebt": [
    {
      "title": "título",
      "description": "descrição",
      "category": "architecture|code-quality|security|performance|testing|documentation",
      "severity": "critical|high|medium|low",
      "estimatedEffort": "low|medium|high",
      "files": ["file1", "file2"]
    }
  ],
  "improvements": [
    {
      "title": "título",
      "description": "descrição",
      "priority": 1,
      "category": "security|performance|quality|architecture|testing|documentation",
      "estimatedEffort": "low|medium|high",
      "benefits": ["benefício 1"],
      "steps": ["passo 1", "passo 2"]
    }
  ]
}

Responde APENAS com o JSON, sem texto adicional.`;

        return this.execute(prompt, LIMITS.BOB_TIMEOUT * 2); // Roadmap pode demorar mais
    }

    /**
     * Parse da resposta JSON do Bob
     */
    static parseJSON<T>(response: string): T {
        try {
            // Remove possível texto antes/depois do JSON
            const jsonMatch = response.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Nenhum JSON encontrado na resposta');
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            Logger.error('Erro ao fazer parse da resposta do Bob', { response, error });
            throw new Error('Resposta do Bob não está em formato JSON válido');
        }
    }
}
