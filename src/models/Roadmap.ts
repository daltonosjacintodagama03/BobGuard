/**
 * Representa um roadmap de projeto
 */
export interface Roadmap {
    id: string;
    projectName: string;
    projectPath: string;
    generatedAt: number;
    overview: ProjectOverview;
    architecture: ArchitectureAnalysis;
    criticalPoints: CriticalPoint[];
    technicalDebt: TechnicalDebtItem[];
    improvements: ImprovementPlan[];
}

/**
 * Visão geral do projeto
 */
export interface ProjectOverview {
    description: string;
    mainTechnologies: string[];
    linesOfCode: number;
    filesCount: number;
    mainFlows: string[];
    keyFeatures: string[];
}

/**
 * Análise de arquitetura
 */
export interface ArchitectureAnalysis {
    pattern: string; // e.g., "MVC", "Microservices", "Monolith"
    layers: string[];
    dependencies: string[];
    dataFlow: string;
    strengths: string[];
    weaknesses: string[];
}

/**
 * Ponto crítico identificado
 */
export interface CriticalPoint {
    id: string;
    title: string;
    description: string;
    location: string; // file path ou módulo
    impact: 'high' | 'medium' | 'low';
    risk: 'high' | 'medium' | 'low';
    recommendation: string;
}

/**
 * Item de debt técnico
 */
export interface TechnicalDebtItem {
    id: string;
    title: string;
    description: string;
    category: 'architecture' | 'code-quality' | 'security' | 'performance' | 'testing' | 'documentation';
    severity: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: 'low' | 'medium' | 'high';
    files: string[];
}

/**
 * Plano de melhoria
 */
export interface ImprovementPlan {
    id: string;
    title: string;
    description: string;
    priority: number; // 1 = highest
    category: 'security' | 'performance' | 'quality' | 'architecture' | 'testing' | 'documentation';
    estimatedEffort: 'low' | 'medium' | 'high';
    benefits: string[];
    steps: string[];
    dependencies?: string[]; // IDs de outras melhorias que devem ser feitas primeiro
}

/**
 * Converte roadmap para Markdown
 */
export function roadmapToMarkdown(roadmap: Roadmap): string {
    const sections: string[] = [];

    // Header
    sections.push(`# 🗺️ Roadmap do Projeto: ${roadmap.projectName}`);
    sections.push(`\n*Gerado em: ${new Date(roadmap.generatedAt).toLocaleString('pt-PT')}*\n`);
    sections.push('---\n');

    // Overview
    sections.push('## 📋 Visão Geral do Projeto\n');
    sections.push(`**Descrição:** ${roadmap.overview.description}\n`);
    sections.push(`**Linhas de Código:** ${roadmap.overview.linesOfCode.toLocaleString()}`);
    sections.push(`**Ficheiros:** ${roadmap.overview.filesCount}\n`);
    
    sections.push('**Tecnologias Principais:**');
    roadmap.overview.mainTechnologies.forEach(tech => {
        sections.push(`- ${tech}`);
    });
    sections.push('');

    sections.push('**Fluxos Principais:**');
    roadmap.overview.mainFlows.forEach(flow => {
        sections.push(`- ${flow}`);
    });
    sections.push('');

    sections.push('**Funcionalidades Chave:**');
    roadmap.overview.keyFeatures.forEach(feature => {
        sections.push(`- ${feature}`);
    });
    sections.push('\n---\n');

    // Architecture
    sections.push('## 🏗️ Arquitetura\n');
    sections.push(`**Padrão:** ${roadmap.architecture.pattern}\n`);
    
    sections.push('**Camadas:**');
    roadmap.architecture.layers.forEach(layer => {
        sections.push(`- ${layer}`);
    });
    sections.push('');

    sections.push('**Dependências Principais:**');
    roadmap.architecture.dependencies.forEach(dep => {
        sections.push(`- ${dep}`);
    });
    sections.push('');

    sections.push(`**Fluxo de Dados:** ${roadmap.architecture.dataFlow}\n`);

    sections.push('**Pontos Fortes:**');
    roadmap.architecture.strengths.forEach(strength => {
        sections.push(`- ✅ ${strength}`);
    });
    sections.push('');

    sections.push('**Pontos Fracos:**');
    roadmap.architecture.weaknesses.forEach(weakness => {
        sections.push(`- ⚠️ ${weakness}`);
    });
    sections.push('\n---\n');

    // Critical Points
    if (roadmap.criticalPoints.length > 0) {
        sections.push('## 🚨 Pontos Críticos\n');
        roadmap.criticalPoints.forEach((point, index) => {
            const impactIcon = point.impact === 'high' ? '🔴' : point.impact === 'medium' ? '🟡' : '🟢';
            const riskIcon = point.risk === 'high' ? '⚠️' : point.risk === 'medium' ? '⚡' : 'ℹ️';
            
            sections.push(`### ${index + 1}. ${point.title}`);
            sections.push(`${impactIcon} **Impacto:** ${point.impact.toUpperCase()} | ${riskIcon} **Risco:** ${point.risk.toUpperCase()}`);
            sections.push(`**Localização:** \`${point.location}\``);
            sections.push(`\n${point.description}\n`);
            sections.push(`**Recomendação:** ${point.recommendation}\n`);
        });
        sections.push('---\n');
    }

    // Technical Debt
    if (roadmap.technicalDebt.length > 0) {
        sections.push('## 💳 Debt Técnico\n');
        
        const debtByCategory = roadmap.technicalDebt.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, TechnicalDebtItem[]>);

        Object.entries(debtByCategory).forEach(([category, items]) => {
            sections.push(`### ${getCategoryIcon(category)} ${category.replace('-', ' ').toUpperCase()}\n`);
            items.forEach(item => {
                const severityIcon = item.severity === 'critical' ? '🔴' : 
                                   item.severity === 'high' ? '🟠' : 
                                   item.severity === 'medium' ? '🟡' : '🔵';
                const effortIcon = item.estimatedEffort === 'high' ? '⏰⏰⏰' : 
                                 item.estimatedEffort === 'medium' ? '⏰⏰' : '⏰';
                
                sections.push(`#### ${severityIcon} ${item.title}`);
                sections.push(`**Esforço Estimado:** ${effortIcon} ${item.estimatedEffort.toUpperCase()}`);
                sections.push(`\n${item.description}\n`);
                sections.push('**Ficheiros afetados:**');
                item.files.forEach(file => {
                    sections.push(`- \`${file}\``);
                });
                sections.push('');
            });
        });
        sections.push('---\n');
    }

    // Improvement Plan
    if (roadmap.improvements.length > 0) {
        sections.push('## 📈 Plano de Melhorias Priorizado\n');
        
        const sortedImprovements = [...roadmap.improvements].sort((a, b) => a.priority - b.priority);
        
        sortedImprovements.forEach((improvement, index) => {
            const effortIcon = improvement.estimatedEffort === 'high' ? '⏰⏰⏰' : 
                             improvement.estimatedEffort === 'medium' ? '⏰⏰' : '⏰';
            
            sections.push(`### ${index + 1}. ${improvement.title}`);
            sections.push(`**Prioridade:** #${improvement.priority} | **Categoria:** ${improvement.category} | **Esforço:** ${effortIcon} ${improvement.estimatedEffort.toUpperCase()}`);
            sections.push(`\n${improvement.description}\n`);
            
            sections.push('**Benefícios:**');
            improvement.benefits.forEach(benefit => {
                sections.push(`- ✨ ${benefit}`);
            });
            sections.push('');

            sections.push('**Passos de Implementação:**');
            improvement.steps.forEach((step, stepIndex) => {
                sections.push(`${stepIndex + 1}. ${step}`);
            });
            sections.push('');

            if (improvement.dependencies && improvement.dependencies.length > 0) {
                sections.push('**Dependências:**');
                improvement.dependencies.forEach(dep => {
                    sections.push(`- Requer: ${dep}`);
                });
                sections.push('');
            }
        });
    }

    sections.push('---\n');
    sections.push('*Roadmap gerado automaticamente pelo BobGuard 🛡️*');

    return sections.join('\n');
}

function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        'architecture': '🏗️',
        'code-quality': '✨',
        'security': '🔒',
        'performance': '⚡',
        'testing': '🧪',
        'documentation': '📚'
    };
    return icons[category] || '📋';
}
