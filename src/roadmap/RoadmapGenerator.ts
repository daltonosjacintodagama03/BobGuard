import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Roadmap, roadmapToMarkdown } from '../models/Roadmap';
import { BobCLI } from '../utils/BobCLI';
import { Logger } from '../utils/Logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Gerador de roadmap de projeto
 */
export class RoadmapGenerator {
    /**
     * Gera roadmap completo do projeto
     */
    static async generateRoadmap(workspaceRoot: string): Promise<Roadmap> {
        Logger.info('Gerando roadmap do projeto...', { workspaceRoot });
        const startTime = Date.now();

        try {
            // 1. Analisa estrutura do projeto
            const projectStructure = await this.analyzeProjectStructure(workspaceRoot);

            // 2. Identifica ficheiros principais
            const mainFiles = await this.identifyMainFiles(workspaceRoot);

            // 3. Extrai dependências
            const dependencies = await this.extractDependencies(workspaceRoot);

            // 4. Gera roadmap via Bob
            const response = await BobCLI.generateRoadmap(
                projectStructure,
                mainFiles,
                dependencies
            );

            // 5. Parse da resposta
            const roadmapData = BobCLI.parseJSON<any>(response);

            // 6. Constrói objeto Roadmap
            const roadmap: Roadmap = {
                id: uuidv4(),
                projectName: path.basename(workspaceRoot),
                projectPath: workspaceRoot,
                generatedAt: Date.now(),
                overview: {
                    description: roadmapData.overview?.description || 'Sem descrição',
                    mainTechnologies: roadmapData.overview?.mainTechnologies || [],
                    linesOfCode: await this.countLinesOfCode(workspaceRoot),
                    filesCount: mainFiles.length,
                    mainFlows: roadmapData.overview?.mainFlows || [],
                    keyFeatures: roadmapData.overview?.keyFeatures || []
                },
                architecture: {
                    pattern: roadmapData.architecture?.pattern || 'Não identificado',
                    layers: roadmapData.architecture?.layers || [],
                    dependencies: dependencies,
                    dataFlow: roadmapData.architecture?.dataFlow || 'Não identificado',
                    strengths: roadmapData.architecture?.strengths || [],
                    weaknesses: roadmapData.architecture?.weaknesses || []
                },
                criticalPoints: (roadmapData.criticalPoints || []).map((cp: any) => ({
                    id: uuidv4(),
                    title: cp.title,
                    description: cp.description,
                    location: cp.location,
                    impact: cp.impact || 'medium',
                    risk: cp.risk || 'medium',
                    recommendation: cp.recommendation
                })),
                technicalDebt: (roadmapData.technicalDebt || []).map((td: any) => ({
                    id: uuidv4(),
                    title: td.title,
                    description: td.description,
                    category: td.category || 'code-quality',
                    severity: td.severity || 'medium',
                    estimatedEffort: td.estimatedEffort || 'medium',
                    files: td.files || []
                })),
                improvements: (roadmapData.improvements || []).map((imp: any) => ({
                    id: uuidv4(),
                    title: imp.title,
                    description: imp.description,
                    priority: imp.priority || 999,
                    category: imp.category || 'quality',
                    estimatedEffort: imp.estimatedEffort || 'medium',
                    benefits: imp.benefits || [],
                    steps: imp.steps || [],
                    dependencies: imp.dependencies
                }))
            };

            const duration = Date.now() - startTime;
            Logger.success(`Roadmap gerado em ${duration}ms`);

            return roadmap;
        } catch (error) {
            Logger.error('Erro ao gerar roadmap', error);
            throw error;
        }
    }

    /**
     * Salva roadmap como ROADMAP.md
     */
    static async saveRoadmap(roadmap: Roadmap): Promise<string> {
        try {
            const markdown = roadmapToMarkdown(roadmap);
            const filePath = path.join(roadmap.projectPath, 'ROADMAP.md');

            fs.writeFileSync(filePath, markdown, 'utf-8');

            Logger.success('Roadmap salvo', { filePath });
            return filePath;
        } catch (error) {
            Logger.error('Erro ao salvar roadmap', error);
            throw error;
        }
    }

    /**
     * Analisa estrutura do projeto
     */
    private static async analyzeProjectStructure(workspaceRoot: string): Promise<string> {
        try {
            const structure: string[] = [];
            
            // Lista diretórios principais
            const entries = fs.readdirSync(workspaceRoot, { withFileTypes: true });
            
            for (const entry of entries) {
                // Ignora node_modules, .git, etc
                if (this.shouldIgnoreEntry(entry.name)) {
                    continue;
                }

                if (entry.isDirectory()) {
                    structure.push(`📁 ${entry.name}/`);
                    
                    // Lista alguns ficheiros dentro
                    const subPath = path.join(workspaceRoot, entry.name);
                    const subEntries = fs.readdirSync(subPath, { withFileTypes: true });
                    
                    for (const subEntry of subEntries.slice(0, 5)) {
                        if (!this.shouldIgnoreEntry(subEntry.name)) {
                            const icon = subEntry.isDirectory() ? '📁' : '📄';
                            structure.push(`  ${icon} ${subEntry.name}`);
                        }
                    }
                    
                    if (subEntries.length > 5) {
                        structure.push(`  ... (${subEntries.length - 5} mais)`);
                    }
                } else {
                    structure.push(`📄 ${entry.name}`);
                }
            }

            return structure.join('\n');
        } catch (error) {
            Logger.error('Erro ao analisar estrutura', error);
            return 'Estrutura não disponível';
        }
    }

    /**
     * Identifica ficheiros principais do projeto
     */
    private static async identifyMainFiles(workspaceRoot: string): Promise<string[]> {
        const mainFiles: string[] = [];

        // Procura por ficheiros de entrada comuns
        const entryPoints = [
            'index.js', 'index.ts', 'main.js', 'main.ts',
            'app.js', 'app.ts', 'server.js', 'server.ts',
            'index.html', 'App.tsx', 'App.jsx'
        ];

        for (const file of entryPoints) {
            const filePath = path.join(workspaceRoot, file);
            if (fs.existsSync(filePath)) {
                mainFiles.push(file);
            }

            // Também procura em src/
            const srcPath = path.join(workspaceRoot, 'src', file);
            if (fs.existsSync(srcPath)) {
                mainFiles.push(`src/${file}`);
            }
        }

        // Adiciona package.json se existir
        const packageJsonPath = path.join(workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            mainFiles.push('package.json');
        }

        // Adiciona README se existir
        const readmePath = path.join(workspaceRoot, 'README.md');
        if (fs.existsSync(readmePath)) {
            mainFiles.push('README.md');
        }

        return mainFiles;
    }

    /**
     * Extrai dependências do projeto
     */
    private static async extractDependencies(workspaceRoot: string): Promise<string[]> {
        const dependencies: string[] = [];

        // Tenta ler package.json
        const packageJsonPath = path.join(workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                
                if (packageJson.dependencies) {
                    Object.keys(packageJson.dependencies).forEach(dep => {
                        dependencies.push(`${dep}@${packageJson.dependencies[dep]}`);
                    });
                }

                if (packageJson.devDependencies) {
                    Object.keys(packageJson.devDependencies).forEach(dep => {
                        dependencies.push(`${dep}@${packageJson.devDependencies[dep]} (dev)`);
                    });
                }
            } catch (error) {
                Logger.warn('Erro ao ler package.json', error);
            }
        }

        // Tenta ler requirements.txt (Python)
        const requirementsPath = path.join(workspaceRoot, 'requirements.txt');
        if (fs.existsSync(requirementsPath)) {
            try {
                const requirements = fs.readFileSync(requirementsPath, 'utf-8');
                requirements.split('\n').forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        dependencies.push(trimmed);
                    }
                });
            } catch (error) {
                Logger.warn('Erro ao ler requirements.txt', error);
            }
        }

        return dependencies;
    }

    /**
     * Conta linhas de código
     */
    private static async countLinesOfCode(workspaceRoot: string): Promise<number> {
        try {
            const files = await vscode.workspace.findFiles(
                '**/*.{js,jsx,ts,tsx,py,java,c,cpp,cs,go,rs,rb,php}',
                '**/node_modules/**'
            );

            let totalLines = 0;

            for (const file of files) {
                try {
                    const content = fs.readFileSync(file.fsPath, 'utf-8');
                    totalLines += content.split('\n').length;
                } catch (error) {
                    // Ignora erros de leitura
                }
            }

            return totalLines;
        } catch (error) {
            Logger.warn('Erro ao contar linhas de código', error);
            return 0;
        }
    }

    /**
     * Verifica se deve ignorar entrada
     */
    private static shouldIgnoreEntry(name: string): boolean {
        const ignoreList = [
            'node_modules', '.git', 'dist', 'build', 'out',
            'coverage', '.vscode', '.idea', '__pycache__',
            '.DS_Store', 'Thumbs.db'
        ];

        return ignoreList.includes(name) || name.startsWith('.');
    }

    /**
     * Abre roadmap no editor
     */
    static async openRoadmap(filePath: string): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document, {
                preview: false,
                viewColumn: vscode.ViewColumn.One
            });
        } catch (error) {
            Logger.error('Erro ao abrir roadmap', error);
            throw error;
        }
    }
}
