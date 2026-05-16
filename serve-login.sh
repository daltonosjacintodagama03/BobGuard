#!/bin/bash

# BobGuard Login Server
# Serve a página de login via HTTP para o Firebase funcionar corretamente

set -e

echo "🌐 BobGuard - Servidor de Login"
echo "================================"
echo ""

cd "$(dirname "$0")/bobguard/web"

PORT=8080

echo "🚀 Iniciando servidor HTTP na porta $PORT..."
echo ""
echo "📱 Acede a página de login em:"
echo "   http://localhost:$PORT/login/"
echo ""
echo "🔐 Após fazer login, serás redirecionado automaticamente para o VS Code"
echo ""
echo "⚠️  IMPORTANTE: Mantém este terminal aberto enquanto fazes login"
echo ""
echo "Para parar o servidor: Ctrl+C"
echo ""
echo "---"
echo ""

# Verifica se Python 3 está disponível
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "❌ Erro: Python não encontrado!"
    echo "   Instala Python 3 para usar este servidor"
    exit 1
fi
