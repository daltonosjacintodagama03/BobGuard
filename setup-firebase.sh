#!/bin/bash

# 🔥 Script de Setup Automático do Firebase para BobGuard
# Este script facilita a configuração do Firebase

set -e

echo "🛡️  BobGuard - Firebase Setup Script"
echo "===================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verifica se Firebase CLI está instalado
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI não está instalado"
        echo ""
        echo "Instala com: npm install -g firebase-tools"
        exit 1
    fi
    print_success "Firebase CLI encontrado"
}

# Verifica se está logado no Firebase
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        print_warning "Não estás logado no Firebase"
        echo ""
        print_info "A abrir browser para login..."
        firebase login
    fi
    print_success "Autenticado no Firebase"
}

# Pede credenciais ao utilizador
get_credentials() {
    echo ""
    echo "📝 Configuração das Credenciais"
    echo "================================"
    echo ""
    print_info "Obtém estas credenciais em: https://console.firebase.google.com"
    print_info "Project Settings > General > Your apps > Web app"
    echo ""
    
    read -p "Firebase Project ID: " PROJECT_ID
    read -p "Firebase API Key: " API_KEY
    read -p "Auth Domain (ex: $PROJECT_ID.firebaseapp.com): " AUTH_DOMAIN
    read -p "Storage Bucket (ex: $PROJECT_ID.appspot.com): " STORAGE_BUCKET
    read -p "Messaging Sender ID: " MESSAGING_SENDER_ID
    read -p "App ID: " APP_ID
    
    echo ""
}

# Atualiza firebase-config.js
update_firebase_config() {
    print_info "A atualizar firebase-config.js..."
    
    cat > bobguard/web/login/firebase-config.js << EOF
// Firebase Configuration for BobGuard
const firebaseConfig = {
    apiKey: "$API_KEY",
    authDomain: "$AUTH_DOMAIN",
    projectId: "$PROJECT_ID",
    storageBucket: "$STORAGE_BUCKET",
    messagingSenderId: "$MESSAGING_SENDER_ID",
    appId: "$APP_ID"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Erro ao inicializar Firebase. Por favor, verifica a configuração.');
}
EOF
    
    print_success "firebase-config.js atualizado"
}

# Atualiza VS Code settings
update_vscode_settings() {
    print_info "A atualizar configurações do VS Code..."
    
    VSCODE_SETTINGS="$HOME/.config/Code/User/settings.json"
    
    # Cria backup se o ficheiro existir
    if [ -f "$VSCODE_SETTINGS" ]; then
        cp "$VSCODE_SETTINGS" "$VSCODE_SETTINGS.backup"
        print_info "Backup criado: $VSCODE_SETTINGS.backup"
    fi
    
    # Adiciona configurações (simplificado - em produção usar jq)
    echo ""
    print_warning "Adiciona manualmente ao teu settings.json do VS Code:"
    echo ""
    echo "{"
    echo "  \"bobguard.firebase.projectId\": \"$PROJECT_ID\","
    echo "  \"bobguard.firebase.apiKey\": \"$API_KEY\""
    echo "}"
    echo ""
}

# Inicializa Firebase Hosting
init_firebase_hosting() {
    print_info "A inicializar Firebase Hosting..."
    
    cd bobguard/web
    
    # Cria firebase.json se não existir
    if [ ! -f "firebase.json" ]; then
        cat > firebase.json << EOF
{
  "hosting": {
    "public": "login",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
EOF
        print_success "firebase.json criado"
    fi
    
    cd ../..
}

# Deploy para Firebase Hosting
deploy_hosting() {
    echo ""
    read -p "Fazer deploy da página de login agora? (y/n): " DEPLOY
    
    if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
        print_info "A fazer deploy..."
        cd bobguard/web
        firebase deploy --only hosting --project "$PROJECT_ID"
        cd ../..
        
        echo ""
        print_success "Deploy concluído!"
        print_info "URL: https://$PROJECT_ID.web.app"
        echo ""
        
        # Atualiza Constants.ts
        print_info "Atualiza a URL em src/utils/Constants.ts:"
        echo "LOGIN_PAGE: 'https://$PROJECT_ID.web.app/login'"
    else
        print_info "Podes fazer deploy mais tarde com: firebase deploy --only hosting"
    fi
}

# Recompila extensão
recompile_extension() {
    echo ""
    read -p "Recompilar extensão agora? (y/n): " RECOMPILE
    
    if [ "$RECOMPILE" = "y" ] || [ "$RECOMPILE" = "Y" ]; then
        print_info "A recompilar..."
        cd bobguard
        npm run compile
        cd ..
        print_success "Extensão recompilada"
    fi
}

# Mostra próximos passos
show_next_steps() {
    echo ""
    echo "🎉 Setup Concluído!"
    echo "==================="
    echo ""
    print_info "Próximos passos:"
    echo ""
    echo "1. Vai a Firebase Console: https://console.firebase.google.com"
    echo "2. Ativa Authentication (Email/Password + Google)"
    echo "3. Ativa Firestore Database"
    echo "4. Configura regras de segurança (ver FIREBASE_SETUP.md)"
    echo "5. Recarrega o VS Code"
    echo "6. Testa o login no BobGuard"
    echo ""
    print_success "Guia completo disponível em: FIREBASE_SETUP.md"
    echo ""
}

# Main
main() {
    check_firebase_cli
    check_firebase_login
    get_credentials
    update_firebase_config
    update_vscode_settings
    init_firebase_hosting
    deploy_hosting
    recompile_extension
    show_next_steps
}

# Executa
main
