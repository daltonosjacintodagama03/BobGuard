# 🔥 Guia Completo de Configuração Firebase para BobGuard

Este guia vai levar-te passo-a-passo pela configuração completa do Firebase para o BobGuard.

## 📋 Pré-requisitos

- [ ] Conta Google
- [ ] Node.js instalado
- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] BobGuard já instalado no VS Code

## 🚀 Passo 1: Criar Projeto Firebase

### 1.1 Aceder à Firebase Console

1. Abre o browser e vai a: **https://console.firebase.google.com**
2. Faz login com a tua conta Google
3. Clica em **"Add project"** ou **"Adicionar projeto"**

### 1.2 Configurar o Projeto

1. **Nome do projeto:**
   - Escreve: `bobguard-auth` (ou outro nome à tua escolha)
   - Clica em **Continue**

2. **Google Analytics:**
   - Podes desativar (não é necessário para o BobGuard)
   - Ou ativar se quiseres métricas
   - Clica em **Create project**

3. **Aguarda a criação** (pode demorar 30-60 segundos)

4. Clica em **Continue** quando estiver pronto

✅ **Checkpoint:** Deves estar agora no dashboard do teu projeto Firebase

---

## 🔐 Passo 2: Ativar Authentication

### 2.1 Configurar Email/Password

1. No menu lateral esquerdo, clica em **Authentication**
2. Clica em **Get started**
3. Na tab **Sign-in method**, clica em **Email/Password**
4. **Ativa** o primeiro toggle (Email/Password)
5. **NÃO** ativas o segundo toggle (Email link)
6. Clica em **Save**

### 2.2 Configurar Google Sign-In

1. Ainda na tab **Sign-in method**, clica em **Google**
2. **Ativa** o toggle
3. **Project support email:** Seleciona o teu email
4. Clica em **Save**

✅ **Checkpoint:** Deves ver Email/Password e Google como "Enabled" na lista

---

## 💾 Passo 3: Ativar Firestore Database

### 3.1 Criar Database

1. No menu lateral, clica em **Firestore Database**
2. Clica em **Create database**
3. **Modo de segurança:**
   - Seleciona **Start in production mode**
   - Clica em **Next**

4. **Localização:**
   - Escolhe a região mais próxima (ex: `europe-west1` para Europa)
   - Clica em **Enable**

5. Aguarda a criação (pode demorar 1-2 minutos)

### 3.2 Configurar Regras de Segurança

1. Vai à tab **Rules**
2. **Substitui** o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para sessões do BobGuard
    match /sessions/{sessionId} {
      // Permite ler e escrever apenas as próprias sessões
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.userId;
      // Permite criar novas sessões
      allow create: if request.auth != null;
    }
    
    // Nega acesso a tudo o resto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Clica em **Publish**

✅ **Checkpoint:** Firestore está ativo e com regras de segurança configuradas

---

## 🔑 Passo 4: Obter Credenciais

### 4.1 Adicionar Web App

1. No topo da página, clica no ícone de **engrenagem** ⚙️
2. Clica em **Project settings**
3. Scroll down até **Your apps**
4. Clica no ícone **</>** (Web)

### 4.2 Registar App

1. **App nickname:** Escreve `BobGuard Extension`
2. **NÃO** ativas "Firebase Hosting" (por agora)
3. Clica em **Register app**

### 4.3 Copiar Configuração

Vais ver algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bobguard-auth.firebaseapp.com",
  projectId: "bobguard-auth",
  storageBucket: "bobguard-auth.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**IMPORTANTE:** Copia estes valores! Vais precisar deles nos próximos passos.

✅ **Checkpoint:** Tens as credenciais Firebase copiadas

---

## ⚙️ Passo 5: Configurar VS Code

### 5.1 Abrir Settings

1. No VS Code, pressiona `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
2. Escreve: `Preferences: Open Settings (JSON)`
3. Pressiona Enter

### 5.2 Adicionar Configuração

Adiciona estas linhas ao teu `settings.json`:

```json
{
  "bobguard.firebase.projectId": "bobguard-auth",
  "bobguard.firebase.apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

**Substitui:**
- `bobguard-auth` pelo teu `projectId`
- `AIzaSy...` pela tua `apiKey`

### 5.3 Guardar e Recarregar

1. Guarda o ficheiro (`Ctrl+S`)
2. Recarrega o VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`

✅ **Checkpoint:** VS Code está configurado com Firebase

---

## 🌐 Passo 6: Configurar Página de Login

### 6.1 Editar firebase-config.js

1. Abre o ficheiro:
   ```
   /home/dosvaldo/Documentos/Hackathons/BobGuard/bobguard/web/login/firebase-config.js
   ```

2. **Substitui** o conteúdo por:

```javascript
// Firebase Configuration for BobGuard
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "bobguard-auth.firebaseapp.com",
    projectId: "bobguard-auth",
    storageBucket: "bobguard-auth.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Erro ao inicializar Firebase. Por favor, verifica a configuração.');
}
```

3. **Substitui** todos os valores pelas tuas credenciais reais
4. Guarda o ficheiro

### 6.2 Testar Localmente (Opcional)

```bash
cd /home/dosvaldo/Documentos/Hackathons/BobGuard/bobguard/web/login
python3 -m http.server 8000
# Abre http://localhost:8000 no browser para testar
```

✅ **Checkpoint:** Página de login configurada

---

## 🚀 Passo 7: Deploy da Página de Login

### 7.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 7.2 Login no Firebase

```bash
firebase login
```

Isto vai abrir o browser para autenticares.

### 7.3 Inicializar Firebase Hosting

```bash
cd /home/dosvaldo/Documentos/Hackathons/BobGuard/bobguard/web
firebase init hosting
```

**Respostas às perguntas:**

1. **Select a default Firebase project:**
   - Escolhe o teu projeto (`bobguard-auth`)

2. **What do you want to use as your public directory?**
   - Escreve: `login`

3. **Configure as a single-page app?**
   - Escreve: `N` (No)

4. **Set up automatic builds and deploys with GitHub?**
   - Escreve: `N` (No)

5. **File login/index.html already exists. Overwrite?**
   - Escreve: `N` (No)

### 7.4 Deploy

```bash
firebase deploy --only hosting
```

Aguarda o deploy (pode demorar 1-2 minutos).

### 7.5 Obter URL

Após o deploy, vais ver algo como:

```
✔  Deploy complete!

Hosting URL: https://bobguard-auth.web.app
```

**Copia esta URL!**

✅ **Checkpoint:** Página de login está online

---

## 🔗 Passo 8: Atualizar URL de Login na Extensão

### 8.1 Editar Constants.ts

1. Abre:
   ```
   /home/dosvaldo/Documentos/Hackathons/BobGuard/bobguard/src/utils/Constants.ts
   ```

2. Encontra a linha:
   ```typescript
   LOGIN_PAGE: 'https://bobguard-auth.web.app/login',
   ```

3. **Substitui** pela tua URL real (a que copiaste no passo anterior)

4. Guarda o ficheiro

### 8.2 Recompilar Extensão

```bash
cd /home/dosvaldo/Documentos/Hackathons/BobGuard/bobguard
npm run compile
```

### 8.3 Recarregar VS Code

1. No VS Code: `Ctrl+Shift+P`
2. Escreve: `Developer: Reload Window`
3. Pressiona Enter

✅ **Checkpoint:** Extensão atualizada com URL correta

---

## ✅ Passo 9: Testar Tudo

### 9.1 Testar Login

1. No VS Code, clica no ícone 🛡️ **BobGuard** na Activity Bar
2. Clica em **"Fazer Login"**
3. O browser deve abrir com a página de login
4. Testa login com:
   - **Email/Password** (cria uma conta nova)
   - **Google** (usa a tua conta Google)

### 9.2 Verificar Autenticação

1. Após login bem sucedido, deves ser redirecionado de volta ao VS Code
2. Na sidebar do BobGuard, deves ver o teu email
3. Testa fazer uma análise de ficheiro

### 9.3 Verificar Firestore

1. Volta à Firebase Console
2. Vai a **Firestore Database**
3. Deves ver uma collection `sessions` com as tuas sessões

✅ **Checkpoint:** Tudo funciona!

---

## 🎉 Configuração Completa!

Parabéns! O Firebase está completamente configurado para o BobGuard.

### O que tens agora:

✅ Autenticação com Email/Password
✅ Autenticação com Google
✅ Firestore para sincronização de sessões
✅ Página de login hospedada no Firebase
✅ Extensão VS Code integrada

### Próximos Passos:

1. **Usa o BobGuard** normalmente
2. **Testa em múltiplos dispositivos** - as sessões sincronizam automaticamente
3. **Convida outros** - partilha a extensão com a tua equipa

---

## 🐛 Troubleshooting

### Problema: "Firebase não configurado"

**Solução:**
- Verifica se adicionaste as configurações ao `settings.json`
- Recarrega o VS Code

### Problema: "Erro ao autenticar"

**Solução:**
- Verifica se ativaste Email/Password e Google no Firebase Console
- Verifica se o `firebase-config.js` tem as credenciais corretas

### Problema: "Página de login não abre"

**Solução:**
- Verifica se fizeste deploy: `firebase deploy --only hosting`
- Verifica se atualizaste a URL em `Constants.ts`
- Recompila: `npm run compile`

### Problema: "Sessões não sincronizam"

**Solução:**
- Verifica as regras de segurança no Firestore
- Verifica se estás autenticado
- Vê os logs: `Ctrl+Shift+P` → `Developer: Toggle Developer Tools`

---

## 📚 Recursos Adicionais

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [BobGuard README](../bobguard/README.md)

---

**Precisas de ajuda?** Abre uma issue no GitHub ou contacta o suporte.

🛡️ **BobGuard** - Código mais seguro com Firebase!
