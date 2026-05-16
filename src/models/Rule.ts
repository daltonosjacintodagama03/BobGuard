/**
 * Representa uma regra custom de análise
 */
export interface CustomRule {
    id: string;
    text: string; // Regra em linguagem natural
    enabled: boolean;
    createdAt: number;
    category?: 'security' | 'performance' | 'quality' | 'legacy';
    severity?: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Valida se uma regra é válida
 */
export function validateRule(text: string): { valid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
        return { valid: false, error: 'Regra não pode estar vazia' };
    }

    if (text.trim().length < 10) {
        return { valid: false, error: 'Regra muito curta (mínimo 10 caracteres)' };
    }

    if (text.length > 500) {
        return { valid: false, error: 'Regra muito longa (máximo 500 caracteres)' };
    }

    return { valid: true };
}

/**
 * Cria uma nova regra custom
 */
export function createRule(text: string, category?: CustomRule['category'], severity?: CustomRule['severity']): CustomRule {
    return {
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: text.trim(),
        enabled: true,
        createdAt: Date.now(),
        category,
        severity
    };
}

/**
 * Converte regras custom em prompt para o Bob
 */
export function rulesToPrompt(rules: CustomRule[]): string {
    const enabledRules = rules.filter(r => r.enabled);
    
    if (enabledRules.length === 0) {
        return '';
    }

    const rulesList = enabledRules.map((rule, index) => 
        `${index + 1}. ${rule.text}`
    ).join('\n');

    return `\n\n**REGRAS CUSTOM DO UTILIZADOR:**\nAlém das análises padrão, verifica também as seguintes regras específicas:\n${rulesList}\n\nPara cada violação destas regras, cria um finding com a severidade apropriada.`;
}

/**
 * Exemplos de regras comuns
 */
export const RULE_EXAMPLES: string[] = [
    'Todas as funções públicas devem ter docstring',
    'Não usar console.log em código de produção',
    'Todas as queries SQL devem usar prepared statements',
    'Funções não devem ter mais de 50 linhas',
    'Variáveis devem usar camelCase',
    'Imports não utilizados devem ser removidos',
    'Todos os erros devem ser logados',
    'Não usar var, apenas let ou const',
    'Todas as promises devem ter .catch()',
    'Senhas nunca devem estar hardcoded'
];
