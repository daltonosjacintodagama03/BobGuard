import * as vscode from 'vscode';
import { Finding } from '../models/Finding';
import { Logger } from '../utils/Logger';

/**
 * Navegação automática para findings
 */
export class FindingsNavigator {
    private decorationType: vscode.TextEditorDecorationType;
    private currentDecorations: Map<string, vscode.Range[]> = new Map();

    constructor() {
        // Cria decoration type para highlight de findings
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: new vscode.ThemeColor('editor.findMatchBorder'),
            overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
            overviewRulerLane: vscode.OverviewRulerLane.Center
        });
    }

    /**
     * Navega para um finding específico
     */
    async navigateToFinding(finding: Finding): Promise<void> {
        try {
            Logger.debug('Navegando para finding', { 
                file: finding.filePath, 
                line: finding.line 
            });

            // Abre o documento
            const document = await vscode.workspace.openTextDocument(finding.filePath);
            
            // Mostra o documento no editor
            const editor = await vscode.window.showTextDocument(document, {
                preview: false,
                viewColumn: vscode.ViewColumn.One
            });

            // Calcula posição (line é 1-based, VS Code usa 0-based)
            const line = Math.max(0, finding.line - 1);
            const position = new vscode.Position(line, finding.column || 0);
            
            // Move cursor para a posição
            editor.selection = new vscode.Selection(position, position);
            
            // Centraliza a linha no viewport
            editor.revealRange(
                new vscode.Range(position, position),
                vscode.TextEditorRevealType.InCenter
            );

            // Aplica highlight
            await this.highlightFinding(editor, finding);

            // Mostra informação do finding
            this.showFindingInfo(finding);

            Logger.debug('Navegação concluída');
        } catch (error) {
            Logger.error('Erro ao navegar para finding', error);
            vscode.window.showErrorMessage(
                `Erro ao navegar para ${finding.filePath}:${finding.line}`
            );
        }
    }

    /**
     * Aplica highlight ao finding
     */
    private async highlightFinding(
        editor: vscode.TextEditor,
        finding: Finding
    ): Promise<void> {
        try {
            const line = Math.max(0, finding.line - 1);
            const lineText = editor.document.lineAt(line);
            
            // Cria range para a linha completa
            const range = new vscode.Range(
                new vscode.Position(line, 0),
                new vscode.Position(line, lineText.text.length)
            );

            // Aplica decoration
            editor.setDecorations(this.decorationType, [range]);

            // Guarda decoração para limpar depois
            const filePath = editor.document.uri.fsPath;
            if (!this.currentDecorations.has(filePath)) {
                this.currentDecorations.set(filePath, []);
            }
            this.currentDecorations.get(filePath)!.push(range);

            // Remove highlight após 3 segundos
            setTimeout(() => {
                this.clearHighlights(editor);
            }, 3000);
        } catch (error) {
            Logger.warn('Erro ao aplicar highlight', error);
        }
    }

    /**
     * Limpa highlights
     */
    private clearHighlights(editor: vscode.TextEditor): void {
        editor.setDecorations(this.decorationType, []);
        this.currentDecorations.delete(editor.document.uri.fsPath);
    }

    /**
     * Mostra informação do finding
     */
    private showFindingInfo(finding: Finding): void {
        const message = `**${finding.title}**\n\n${finding.description}\n\n**Sugestão:** ${finding.suggestion}`;
        
        vscode.window.showInformationMessage(
            finding.title,
            { modal: false },
            'Ver Detalhes',
            'Copiar Sugestão'
        ).then(selection => {
            if (selection === 'Ver Detalhes') {
                this.showFindingDetails(finding);
            } else if (selection === 'Copiar Sugestão') {
                vscode.env.clipboard.writeText(finding.suggestion);
                vscode.window.showInformationMessage('Sugestão copiada!');
            }
        });
    }

    /**
     * Mostra detalhes completos do finding
     */
    private showFindingDetails(finding: Finding): void {
        const panel = vscode.window.createWebviewPanel(
            'bobguardFindingDetails',
            `Finding: ${finding.title}`,
            vscode.ViewColumn.Beside,
            { enableScripts: false }
        );

        panel.webview.html = this.getFindingDetailsHtml(finding);
    }

    /**
     * HTML para detalhes do finding
     */
    private getFindingDetailsHtml(finding: Finding): string {
        const severityColors: Record<Finding['severity'], string> = {
            critical: '#ff0000',
            high: '#ff8c00',
            medium: '#ffd700',
            low: '#4a9eff'
        };

        const categoryIcons: Record<Finding['category'], string> = {
            security: '🔒',
            performance: '⚡',
            quality: '✨',
            legacy: '📦'
        };

        return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finding Details</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            line-height: 1.6;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .header {
            border-bottom: 2px solid var(--vscode-panel-border);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .badges {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .badge {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .severity {
            background-color: ${severityColors[finding.severity]}33;
            color: ${severityColors[finding.severity]};
            border: 1px solid ${severityColors[finding.severity]};
        }
        .category {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .section {
            margin: 20px 0;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--vscode-textLink-foreground);
        }
        .location {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        .description {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            padding: 15px;
            margin: 10px 0;
        }
        .suggestion {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            padding: 15px;
            border-radius: 4px;
        }
        .code-snippet {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${finding.title}</div>
        <div class="badges">
            <span class="badge severity">${finding.severity.toUpperCase()}</span>
            <span class="badge category">${categoryIcons[finding.category]} ${finding.category}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📍 Localização</div>
        <div class="location">
            ${finding.filePath}<br>
            Linha: ${finding.line}${finding.column ? `, Coluna: ${finding.column}` : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">📝 Descrição</div>
        <div class="description">
            ${finding.description}
        </div>
    </div>

    ${finding.code ? `
    <div class="section">
        <div class="section-title">💻 Código</div>
        <div class="code-snippet">${this.escapeHtml(finding.code)}</div>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">💡 Sugestão de Correção</div>
        <div class="suggestion">
            ${finding.suggestion}
        </div>
    </div>

    ${finding.ruleId ? `
    <div class="section">
        <div class="section-title">📋 Regra</div>
        <div class="location">ID: ${finding.ruleId}</div>
    </div>
    ` : ''}
</body>
</html>`;
    }

    /**
     * Escape HTML
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Navega para múltiplos findings (mostra quick pick)
     */
    async navigateToFindings(findings: Finding[]): Promise<void> {
        if (findings.length === 0) {
            vscode.window.showInformationMessage('Nenhum finding para navegar');
            return;
        }

        if (findings.length === 1) {
            await this.navigateToFinding(findings[0]);
            return;
        }

        // Mostra quick pick para selecionar finding
        const items = findings.map(f => ({
            label: f.title,
            description: `${f.filePath}:${f.line}`,
            detail: f.description,
            finding: f
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Seleciona um finding para navegar',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            await this.navigateToFinding(selected.finding);
        }
    }

    /**
     * Cria diagnostic collection para findings
     */
    createDiagnostics(findings: Finding[]): vscode.DiagnosticCollection {
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('bobguard');
        
        // Agrupa findings por ficheiro
        const findingsByFile = new Map<string, Finding[]>();
        findings.forEach(f => {
            if (!findingsByFile.has(f.filePath)) {
                findingsByFile.set(f.filePath, []);
            }
            findingsByFile.get(f.filePath)!.push(f);
        });

        // Cria diagnostics para cada ficheiro
        findingsByFile.forEach((fileFindings, filePath) => {
            const uri = vscode.Uri.file(filePath);
            const diagnostics: vscode.Diagnostic[] = fileFindings.map(f => {
                const line = Math.max(0, f.line - 1);
                const range = new vscode.Range(
                    new vscode.Position(line, f.column || 0),
                    new vscode.Position(line, 1000) // Até fim da linha
                );

                const severity = this.getSeverityLevel(f.severity);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    f.title,
                    severity
                );

                diagnostic.source = 'BobGuard';
                diagnostic.code = f.category;
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(uri, range),
                        f.suggestion
                    )
                ];

                return diagnostic;
            });

            diagnosticCollection.set(uri, diagnostics);
        });

        return diagnosticCollection;
    }

    /**
     * Converte severidade para DiagnosticSeverity
     */
    private getSeverityLevel(severity: Finding['severity']): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical':
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
                return vscode.DiagnosticSeverity.Information;
        }
    }

    /**
     * Cleanup
     */
    dispose(): void {
        this.decorationType.dispose();
        this.currentDecorations.clear();
    }
}
