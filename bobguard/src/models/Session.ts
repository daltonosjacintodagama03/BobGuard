import { Finding } from './Finding';

/**
 * Representa uma sessão de análise
 */
export interface Session {
    id: string;
    userId: string;
    projectPath: string;
    projectName: string;
    timestamp: number;
    findings: Finding[];
    stats: SessionStats;
    type: 'file' | 'project';
    targetFile?: string; // Se type === 'file'
    customRules?: string[]; // Regras custom usadas nesta sessão
}

/**
 * Estatísticas de uma sessão
 */
export interface SessionStats {
    total: number;
    bySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    byCategory: {
        security: number;
        performance: number;
        quality: number;
        legacy: number;
    };
    filesAnalyzed: number;
    linesAnalyzed: number;
    duration: number; // em ms
}

/**
 * Comparação entre duas sessões
 */
export interface SessionComparison {
    session1: Session;
    session2: Session;
    improvements: {
        total: number;
        bySeverity: {
            critical: number;
            high: number;
            medium: number;
            low: number;
        };
    };
    newIssues: Finding[];
    resolvedIssues: Finding[];
    persistentIssues: Finding[];
}

/**
 * Calcula estatísticas de uma sessão
 */
export function calculateStats(findings: Finding[], filesAnalyzed: number, linesAnalyzed: number, duration: number): SessionStats {
    const stats: SessionStats = {
        total: findings.length,
        bySeverity: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        },
        byCategory: {
            security: 0,
            performance: 0,
            quality: 0,
            legacy: 0
        },
        filesAnalyzed,
        linesAnalyzed,
        duration
    };

    findings.forEach(finding => {
        stats.bySeverity[finding.severity]++;
        stats.byCategory[finding.category]++;
    });

    return stats;
}

/**
 * Compara duas sessões
 */
export function compareSessions(session1: Session, session2: Session): SessionComparison {
    const improvements = {
        total: session1.stats.total - session2.stats.total,
        bySeverity: {
            critical: session1.stats.bySeverity.critical - session2.stats.bySeverity.critical,
            high: session1.stats.bySeverity.high - session2.stats.bySeverity.high,
            medium: session1.stats.bySeverity.medium - session2.stats.bySeverity.medium,
            low: session1.stats.bySeverity.low - session2.stats.bySeverity.low
        }
    };

    // Findings que existiam em session1 mas não em session2 (resolvidos)
    const resolvedIssues = session1.findings.filter(f1 => 
        !session2.findings.some(f2 => 
            f2.filePath === f1.filePath && 
            f2.line === f1.line && 
            f2.title === f1.title
        )
    );

    // Findings que existem em session2 mas não em session1 (novos)
    const newIssues = session2.findings.filter(f2 => 
        !session1.findings.some(f1 => 
            f1.filePath === f2.filePath && 
            f1.line === f2.line && 
            f1.title === f2.title
        )
    );

    // Findings que existem em ambas (persistentes)
    const persistentIssues = session2.findings.filter(f2 => 
        session1.findings.some(f1 => 
            f1.filePath === f2.filePath && 
            f1.line === f2.line && 
            f1.title === f2.title
        )
    );

    return {
        session1,
        session2,
        improvements,
        newIssues,
        resolvedIssues,
        persistentIssues
    };
}

/**
 * Formata duração em formato legível
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Formata timestamp em formato legível
 */
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
        return 'Agora mesmo';
    } else if (diffMins < 60) {
        return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
        return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else {
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
