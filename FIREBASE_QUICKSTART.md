# 🚀 Firebase Quick Start - BobGuard

**Setup rápido em 5 minutos!**

## Opção 1: Script Automático (Recomendado)

```bash
cd /home/dosvaldo/Documentos/Hackathons/BobGuard
./setup-firebase.sh
```

O script vai guiar-te por todo o processo automaticamente! ✨

---

## Opção 2: Setup Manual Rápido

### 1️⃣ Criar Projeto (2 min)

1. Vai a: **https://console.firebase.google.com**
2. **Add project** → Nome: `bobguard-auth`
3. Desativa Google Analytics → **Create project**

### 2️⃣ Ativar Serviços (2 min)

**Authentication:**
- Menu → **Authentication** → **Get started**
- **Email/Password** → Enable → Save
- **Google** → Enable → Escolhe email → Save

**Firestore:**
- Menu → **Firestore Database** → **Create database**
- **Production mode** → Escolhe região → **Enable**
- Tab **Rules** → Cola as regras abaixo → **Publish**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### 3️⃣ Obter Credenciais (1 min)

1. **Project Settings** (⚙️) → **General**
2. **Your apps** → Ícone **</>** (Web)
3. Nome: `BobGuard Extension` → **Register app**
4. **Copia** as credenciais que aparecem

### 4️⃣ Configurar (1 min)

**No VS Code (`settings.json`):**
```json
{
  "bobguard.firebase.projectId": "bobguard-auth",
  "bobguard.firebase.apiKey": "AIzaSy..."
}
```

**No ficheiro `bobguard/web/login/firebase-config.js`:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "bobguard-auth.firebaseapp.com",
    projectId: "bobguard-auth",
    storageBucket: "bobguard-auth.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc..."
};
```

### 5️⃣ Deploy Página de Login (1 min)

```bash
cd bobguard/web
firebase login
firebase init hosting  # Escolhe: login como public directory
firebase deploy --only hosting
```

Copia a URL que aparece (ex: `https://bobguard-auth.web.app`)

### 6️⃣ Atualizar Extensão

Em `bobguard/src/utils/Constants.ts`, linha ~45:
```typescript
LOGIN_PAGE: 'https://bobguard-auth.web.app/login'
```

Recompila:
```bash
cd bobguard
npm run compile
```

### 7️⃣ Testar

1. Recarrega VS Code: `Ctrl+Shift+P` → `Developer: Reload Window`
2. Clica no ícone 🛡️ BobGuard
3. Clica em **"Fazer Login"**
4. Testa login com Email ou Google

---

## ✅ Checklist

- [ ] Projeto Firebase criado
- [ ] Authentication ativado (Email + Google)
- [ ] Firestore ativado com regras
- [ ] Credenciais copiadas
- [ ] `settings.json` atualizado
- [ ] `firebase-config.js` atualizado
- [ ] Página de login deployed
- [ ] `Constants.ts` atualizado
- [ ] Extensão recompilada
- [ ] VS Code recarregado
- [ ] Login testado e funciona

---

## 🆘 Problemas?

**Erro: "Firebase não configurado"**
→ Verifica `settings.json` e recarrega VS Code

**Erro: "Página de login não abre"**
→ Verifica se fizeste deploy: `firebase deploy --only hosting`

**Erro: "Authentication failed"**
→ Verifica se ativaste Email/Password e Google no Firebase Console

**Mais ajuda:**
→ Vê o guia completo: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

---

## 📚 Recursos

- 📖 [Guia Completo](FIREBASE_SETUP.md) - Passo-a-passo detalhado
- 🤖 [Script Automático](setup-firebase.sh) - Setup com um comando
- 🔥 [Firebase Console](https://console.firebase.google.com)
- 📘 [Firebase Docs](https://firebase.google.com/docs)

---

**Tempo total: ~5 minutos** ⏱️

🛡️ **BobGuard** - Setup rápido e fácil!
