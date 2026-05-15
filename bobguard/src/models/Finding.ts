/**
 * Representa um finding (issue) encontrado durante a análise de código
 */
export interface Finding {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'security' | 'performance' | 'quality' | 'legacy';
    title: string;
    description: string;
    filePath: string;
    line: number;
    column?: number;
    code?: string; // Snippet do código problemático
    suggestion: string; // Como corrigir
    ruleId?: string; // ID da regra que detectou (se for custom rule)
    timestamp: number;
}

/**
 * Severidade com informação de display
 */
export interface SeverityInfo {
    level: Finding['severity'];
    label: string;
    icon: string;
    color: string;
    priority: number;
}

/**
 * Mapa de severidades para UI
 */
export const SEVERITY_MAP: Record<Finding['severity'], SeverityInfo> = {
    critical: {
        level: 'critical',
        label: 'Crítico',
        icon: '🔴',
        color: '#ff0000',
        priority: 4
    },
    high: {
        level: 'high',
        label: 'Alto',
        icon: '🟠',
        color: '#ff8c00',
        priority: 3
    },
    medium: {
        level: 'medium',
        label: 'Médio',
        icon: '🟡',
        color: '#ffd700',
        priority: 2
    },
    low: {
        level: 'low',
        label: 'Baixo',
        icon: '🔵',
        color: '#4a9eff',
        priority: 1
    }
};

/**
 * Categoria com informação de display
 */
export interface CategoryInfo {
    type: Finding['category'];
    label: string;
    icon: string;
    description: string;
}

/**
 * Mapa de categorias para UI
 */
export const CATEGORY_MAP: Record<Finding['category'], CategoryInfo> = {
    security: {
        type: 'security',
        label: 'Segurança',
        icon: '🔒',
        description: 'Vulnerabilidades e falhas de segurança'
    },
    performance: {
        type: 'performance',
        label: 'Performance',
        icon: '⚡',
        description: 'Problemas de performance e otimização'
    },
    quality: {
        type: 'quality',
        label: 'Qualidade',
        icon: '✨',
        description: 'Qualidade de código e manutenibilidade'
    },
    legacy: {
        type: 'legacy',
        label: 'Código Legado',
        icon: '📦',
        description: 'Código desatualizado e debt técnico'
    }
};

/**
 * Agrupa findings por severidade
 */
export function groupBySeverity(findings: Finding[]): Record<Finding['severity'], Finding[]> {
    return findings.reduce((acc, finding) => {
        if (!acc[finding.severity]) {
            acc[finding.severity] = [];
        }
        acc[finding.severity].push(finding);
        return acc;
    }, {} as Record<Finding['severity'], Finding[]>);
}

/**
 * Agrupa findings por categoria
 */
export function groupByCategory(findings: Finding[]): Record<Finding['category'], Finding[]> {
    return findings.reduce((acc, finding) => {
        if (!acc[finding.category]) {
            acc[finding.category] = [];
        }
        acc[finding.category].push(finding);
        return acc;
    }, {} as Record<Finding['category'], Finding[]>);
}

/**
 * Ordena findings por severidade (crítico primeiro)
 */
export function sortBySeverity(findings: Finding[]): Finding[] {
    return [...findings].sort((a, b) => {
        return SEVERITY_MAP[b.severity].priority - SEVERITY_MAP[a.severity].priority;
    });
}

/**
 * Filtra findings por severidade mínima
 */
export function filterByMinSeverity(
    findings: Finding[],
    minSeverity: Finding['severity']
): Finding[] {
    const minPriority = SEVERITY_MAP[minSeverity].priority;
    return findings.filter(f => SEVERITY_MAP[f.severity].priority >= minPriority);
}
