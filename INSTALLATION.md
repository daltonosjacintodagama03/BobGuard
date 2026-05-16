# 🛡️ BobGuard - Guia de Instalação Completo

## 📋 Pré-requisitos

- **VS Code** versão 1.120.0 ou superior
- **Node.js** versão 18 ou superior
- **npm** versão 8 ou superior
- **Docker** (opcional, para desenvolvimento)
- **Python 3** (para servidor de login local)

## 🚀 Instalação Rápida

### Método 1: Script Automático (Recomendado)

```bash
cd BobGuard
./install-extension.sh
```

Este script irá:
1. Instalar dependências npm
2. Compilar o código TypeScript
3. Empacotar a extensão (.vsix)
4. Instalar no VS Code

### Método 2: Manual

```bash
cd BobGuard/bobguard

# 1. Instalar dependências
npm install

# 2. Compilar TypeScript
npm run compile

# 3. Empacotar extensão
npm run package

# 4. Instalar no VS Code
code --install-extension bobguard-0.1.1.vsix --force
```

## 🔐 Configuração de Autenticação

### Passo 1: Iniciar Servidor de Login

```bash
cd BobGuard
./serve-login.sh
```

Ou manualmente:
```bash
cd bobguard/web
python3 -m http.server 8080
```

### Passo 2: Fazer Login

1. Abre o navegador em: `http://localhost:8080/login/`
2. Escolhe um método de autenticação:
   - **Google Sign-In** (recomendado)
   - **Email/Password**
3. Completa o processo de autenticação
4. Serás automaticamente redirecionado para o VS Code

### Passo 3: Verificar Instalação

1. Reinicia o VS Code
2. Procura o ícone **🛡️ BobGuard** na barra lateral esquerda
3. Abre a Command Palette (`Ctrl+Shift+P` ou `Cmd+Shift+P`)
4. Procura por "BobGuard" - deves ver todos os comandos disponíveis

## 🔍 Verificação de Problemas

### Problema: Ícone não aparece na barra lateral

**Solução:**
```bash
# 1. Verifica se a extensão está instalada
code --list-extensions | grep bobguard

# 2. Se não aparecer, reinstala
cd BobGuard
./install-extension.sh

# 3. Reinicia o VS Code completamente
# Fecha todas as janelas e abre novamente
```

### Problema: Comandos não aparecem na Command Palette

**Causa:** A extensão não foi ativada corretamente.

**Solução:**
1. Abre o **Output Panel** (`Ctrl+Shift+U`)
2. Seleciona "Log (Extension Host)" no dropdown
3. Procura por mensagens de erro relacionadas com "bobguard"
4. Verifica se aparece: `🛡️ BobGuard is now active!`

Se não aparecer:
```bash
# Verifica logs de compilação
cd BobGuard/bobguard
npm run compile

# Deve mostrar "Found 0 errors"
```

### Problema: Autenticação não funciona

**Sintomas:**
- Login completa mas VS Code não reconhece
- Mensagem "Autenticação bem sucedida!" mas nada muda no VS Code

**Causa:** URI handler não está registado corretamente.

**Solução:**

1. **Verifica o URI Scheme:**
   ```bash
   # No Linux
   xdg-mime query default x-scheme-handler/vscode
   
   # Deve retornar algo como: code-url-handler.desktop
   ```

2. **Reinstala a extensão:**
   ```bash
   cd BobGuard
   ./install-extension.sh
   ```

3. **Testa o URI manualmente:**
   ```bash
   # Abre este URL no navegador (substitui os valores)
   vscode://bobguard-team.bobguard/auth?token=TEST&userId=123&email=test@example.com
   ```
   
   O VS Code deve abrir automaticamente.

4. **Verifica o publisher ID:**
   - Abre `bobguard/package.json`
   - Confirma que `"publisher": "bobguard-team"`
   - O URI deve ser: `vscode://bobguard-team.bobguard/auth`

### Problema: Firebase não configurado

**Sintoma:** Mensagem "Firebase não configurado"

**Solução:**

O Firebase já está pré-configurado! Mas se quiseres usar tua própria instância:

1. Cria projeto em [Firebase Console](https://console.firebase.google.com)
2. Ativa Authentication (Google + Email/Password)
3. Ativa Firestore Database
4. Copia as credenciais
5. Atualiza em `bobguard/src/auth/FirebaseConfig.ts`:

```typescript
private static readonly DEFAULT_CONFIG = {
    apiKey: "TUA_API_KEY",
    authDomain: "TEU_PROJECT_ID.firebaseapp.com",
    projectId: "TEU_PROJECT_ID",
    // ...
};
```

6. Atualiza também em `bobguard/web/login/firebase-config.js`
7. Recompila e reinstala:
   ```bash
   ./install-extension.sh
   ```

## 📱 Testando a Extensão

### Teste 1: Verificar Ativação

1. Abre VS Code
2. Abre Developer Tools: `Help > Toggle Developer Tools`
3. Na tab Console, procura por: `🛡️ BobGuard is now active!`

### Teste 2: Verificar Comandos

1. Abre Command Palette (`Ctrl+Shift+P`)
2. Digita "BobGuard"
3. Deves ver todos os comandos:
   - BobGuard: Login
   - BobGuard: Logout
   - BobGuard: Analisar este ficheiro
   - BobGuard: Analisar projeto completo
   - BobGuard: Gerar Roadmap do Projeto
   - etc.

### Teste 3: Verificar Sidebar

1. Procura o ícone 🛡️ na barra lateral esquerda
2. Clica nele
3. Deves ver o painel "Code Review"
4. Se não estiveres autenticado, verás opção de login

### Teste 4: Testar Análise

1. Abre um ficheiro de código
2. Clica com botão direito no editor
3. Seleciona "BobGuard: Analisar este ficheiro"
4. Aguarda a análise (pode demorar alguns segundos)
5. Verifica os resultados no painel lateral

## 🐛 Debug Avançado

### Ver Logs Detalhados

```bash
# 1. Abre VS Code via terminal para ver logs
code --verbose

# 2. Ou verifica logs da extensão
tail -f ~/.vscode/extensions/bobguard-team.bobguard-*/out/*.log
```

### Verificar Estado da Extensão

1. Abre Command Palette
2. Digita: `Developer: Show Running Extensions`
3. Procura por "bobguard"
4. Verifica status: deve estar "Activated"

### Limpar Cache e Reinstalar

```bash
# 1. Remove extensão
code --uninstall-extension bobguard-team.bobguard

# 2. Limpa cache do VS Code
rm -rf ~/.vscode/extensions/bobguard-team.bobguard-*

# 3. Reinstala
cd BobGuard
./install-extension.sh

# 4. Reinicia VS Code completamente
```

## 📚 Estrutura de Ficheiros Importantes

```
BobGuard/
├── install-extension.sh       # Script de instalação
├── serve-login.sh            # Servidor de login
├── INSTALLATION.md           # Este ficheiro
└── bobguard/
    ├── package.json          # Configuração da extensão
    ├── src/
    │   ├── extension.ts      # Ponto de entrada
    │   └── auth/
    │       └── AuthManager.ts # Gestão de autenticação
    └── web/
        └── login/
            ├── index.html    # Página de login
            └── login.js      # Lógica de autenticação
```

## 🆘 Suporte

Se continuares com problemas:

1. **Verifica os logs:**
   - VS Code Output Panel > "Log (Extension Host)"
   - Developer Tools Console

2. **Reporta o problema:**
   - Cria issue em: https://github.com/daltonosjacintodagama03/BobGuard/issues
   - Inclui:
     - Sistema operativo
     - Versão do VS Code
     - Logs de erro
     - Passos para reproduzir

3. **Documentação adicional:**
   - [README.md](bobguard/README.md)
   - [QUICK_START.md](QUICK_START.md)
   - [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

## ✅ Checklist de Instalação

- [ ] Node.js e npm instalados
- [ ] Docker instalado (opcional)
- [ ] Repositório clonado
- [ ] Script de instalação executado
- [ ] Extensão aparece no VS Code
- [ ] Ícone 🛡️ visível na barra lateral
- [ ] Comandos aparecem na Command Palette
- [ ] Servidor de login iniciado
- [ ] Autenticação completada com sucesso
- [ ] VS Code reconhece utilizador autenticado
- [ ] Análise de ficheiro funciona

---

**Feito com ❤️ para a comunidade**
