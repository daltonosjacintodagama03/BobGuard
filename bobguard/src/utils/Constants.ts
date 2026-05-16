/**
 * Constantes globais da extensão BobGuard
 */

export const EXTENSION_ID = 'bobguard';
export const EXTENSION_NAME = 'BobGuard';
export const EXTENSION_VERSION = '0.1.0';

/**
 * Comandos da extensão
 */
export const COMMANDS = {
    ANALYZE_FILE: 'bobguard.analyzeFile',
    ANALYZE_PROJECT: 'bobguard.analyzeProject',
    GENERATE_ROADMAP: 'bobguard.generateRoadmap',
    LOGIN: 'bobguard.login',
    LOGOUT: 'bobguard.logout',
    ADD_CUSTOM_RULE: 'bobguard.addCustomRule',
    TOGGLE_MODE: 'bobguard.toggleMode',
    NAVIGATE_TO_FINDING: 'bobguard.navigateToFinding',
    VIEW_HISTORY: 'bobguard.viewHistory',
    COMPARE_SESSION: 'bobguard.compareSession',
    DELETE_SESSION: 'bobguard.deleteSession',
    REFRESH: 'bobguard.refresh'
} as const;

/**
 * Configurações
 */
export const CONFIG_KEYS = {
    MODE: 'bobguard.mode',
    CUSTOM_RULES: 'bobguard.customRules',
    AUTO_ANALYZE: 'bobguard.autoAnalyze',
    SEVERITY_FILTER: 'bobguard.severityFilter',
    FIREBASE_PROJECT_ID: 'bobguard.firebase.projectId',
    FIREBASE_API_KEY: 'bobguard.firebase.apiKey'
} as const;

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'bobguard.authToken',
    USER_ID: 'bobguard.userId',
    USER_EMAIL: 'bobguard.userEmail',
    LAST_SESSION_ID: 'bobguard.lastSessionId',
    SESSIONS_CACHE: 'bobguard.sessionsCache'
} as const;

/**
 * URLs
 */
export const URLS = {
    LOGIN_PAGE: 'http://localhost:8080/login',
    DOCS: 'https://github.com/daltonosjacintodagama03/BobGuard#readme',
    ISSUES: 'https://github.com/daltonosjacintodagama03/BobGuard/issues',
    FIREBASE_CONSOLE: 'https://console.firebase.google.com'
} as const;

/**
 * Timeouts e limites
 */
export const LIMITS = {
    MAX_FILE_SIZE: 1024 * 1024, // 1MB
    MAX_FILES_PROJECT_ANALYSIS: 1000,
    BOB_TIMEOUT: 300000, // 5 minutos
    SESSION_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 dias
    MAX_SESSIONS_CACHE: 50,
    MAX_CUSTOM_RULES: 50
} as const;

/**
 * Mensagens de erro
 */
export const ERROR_MESSAGES = {
    NO_ACTIVE_FILE: 'Nenhum ficheiro ativo para analisar',
    NO_WORKSPACE: 'Nenhum workspace aberto',
    BOB_NOT_FOUND: 'Bob CLI não encontrado. Certifica-te que o Bob está instalado e acessível no PATH.',
    AUTH_REQUIRED: 'Autenticação necessária. Por favor, faz login.',
    SESSION_EXPIRED: 'Sessão expirada. Por favor, faz login novamente.',
    FIREBASE_NOT_CONFIGURED: 'Firebase não configurado. Verifica as configurações.',
    ANALYSIS_FAILED: 'Análise falhou. Verifica os logs para mais detalhes.',
    FILE_TOO_LARGE: 'Ficheiro demasiado grande para análise',
    INVALID_RULE: 'Regra inválida',
    MAX_RULES_REACHED: 'Número máximo de regras atingido'
} as const;

/**
 * Mensagens de sucesso
 */
export const SUCCESS_MESSAGES = {
    ANALYSIS_COMPLETE: 'Análise concluída com sucesso',
    ROADMAP_GENERATED: 'Roadmap gerado com sucesso',
    RULE_ADDED: 'Regra adicionada com sucesso',
    RULE_DELETED: 'Regra removida com sucesso',
    SESSION_DELETED: 'Sessão apagada com sucesso',
    LOGIN_SUCCESS: 'Login efetuado com sucesso',
    LOGOUT_SUCCESS: 'Logout efetuado com sucesso'
} as const;

/**
 * Ícones (codicons do VS Code)
 */
export const ICONS = {
    CRITICAL: '$(error)',
    HIGH: '$(warning)',
    MEDIUM: '$(info)',
    LOW: '$(circle-outline)',
    SECURITY: '$(shield)',
    PERFORMANCE: '$(zap)',
    QUALITY: '$(sparkle)',
    LEGACY: '$(archive)',
    FILE: '$(file)',
    FOLDER: '$(folder)',
    REFRESH: '$(refresh)',
    LOGIN: '$(sign-in)',
    LOGOUT: '$(sign-out)',
    ADD: '$(add)',
    DELETE: '$(trash)',
    EDIT: '$(edit)',
    SEARCH: '$(search)',
    MAP: '$(map)',
    HISTORY: '$(history)',
    COMPARE: '$(git-compare)',
    SETTINGS: '$(settings-gear)'
} as const;

/**
 * Cores (theme colors do VS Code)
 */
export const COLORS = {
    CRITICAL: 'errorForeground',
    HIGH: 'editorWarning.foreground',
    MEDIUM: 'editorInfo.foreground',
    LOW: 'foreground',
    SUCCESS: 'testing.iconPassed',
    ERROR: 'testing.iconFailed'
} as const;

/**
 * Extensões de ficheiros suportadas
 */
export const SUPPORTED_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.java', '.c', '.cpp', '.cs',
    '.go', '.rs', '.rb', '.php',
    '.html', '.css', '.scss', '.sass',
    '.json', '.xml', '.yaml', '.yml',
    '.sql', '.sh', '.bash'
] as const;

/**
 * Padrões de ficheiros a ignorar
 */
export const IGNORE_PATTERNS = [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/.git/**',
    '**/.vscode/**',
    '**/coverage/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/package-lock.json',
    '**/yarn.lock'
] as const;

/**
 * Prompts base para o Bob
 */
export const BOB_PROMPTS = {
    SYSTEM: `És um especialista em análise de código com foco em segurança, performance, qualidade e manutenibilidade. 
Analisa código de forma profunda e fornece findings acionáveis com sugestões concretas de correção.
Responde sempre em formato JSON válido.`,
    
    SECURITY: `Analisa este código focando APENAS em segurança:
- SQL/NoSQL/Command/LDAP injection
- Hardcoded secrets (API keys, passwords, tokens)
- Authentication/Authorization flaws
- Sensitive data exposure
- Input validation missing
- Known vulnerable dependencies
- XSS, CSRF, SSRF vulnerabilities
- Insecure cryptography`,
    
    PERFORMANCE: `Analisa este código focando APENAS em performance:
- Inefficient loops (O(n²) or worse)
- Blocking I/O operations
- Memory leaks
- N+1 query problems
- Missing caching opportunities
- Unnecessary re-renders
- Large bundle sizes`,
    
    QUALITY: `Analisa este código focando APENAS em qualidade:
- Dead code and unused imports
- Long functions (>50 lines)
- High cyclomatic complexity
- Poor naming conventions
- Missing error handling
- Code duplication
- Missing tests
- SOLID violations`,
    
    LEGACY: `Analisa este código focando APENAS em código legado:
- Deprecated APIs and patterns
- Outdated dependencies
- Missing documentation
- Tight coupling
- Technical debt
- Obsolete patterns`
} as const;
