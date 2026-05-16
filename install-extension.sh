#!/bin/bash

# BobGuard Extension Installation Script
# Este script compila, empacota e instala a extensão BobGuard no VS Code

set -e

echo "🛡️  BobGuard - Script de Instalação"
echo "===================================="
echo ""

# Navegar para o diretório da extensão
cd "$(dirname "$0")/bobguard"

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔨 Compilando TypeScript..."
npm run compile

echo ""
echo "📦 Empacotando extensão..."
npm run package

echo ""
echo "🚀 Instalando extensão no VS Code..."
VSIX_FILE=$(ls -t bobguard-*.vsix | head -1)
code --install-extension "$VSIX_FILE" --force

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Reinicia o VS Code"
echo "2. Procura por 'BobGuard' na barra lateral esquerda"
echo "3. Abre a Command Palette (Ctrl+Shift+P) e procura 'BobGuard'"
echo "4. Executa 'BobGuard: Login' para autenticar"
echo ""
echo "🌐 Para fazer login:"
echo "   Abre: file://$(pwd)/web/login/index.html"
echo "   Ou serve localmente: cd web && python3 -m http.server 8080"
echo ""
echo "📚 Documentação: $(pwd)/README.md"
echo ""
