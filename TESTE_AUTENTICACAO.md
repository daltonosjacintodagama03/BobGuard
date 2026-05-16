# 🔐 Teste de Autenticação - BobGuard

## ✅ Status Atual

- ✅ Extensão instalada no VS Code (v0.1.1)
- ✅ Servidor HTTP rodando em `http://localhost:8080`
- ✅ URL de login corrigido para localhost
- ✅ Publisher ID corrigido: `bobguard-team.bobguard`

## 🚀 Passos para Testar

### 1. Reinicia o VS Code COMPLETAMENTE
```bash
# Fecha TODAS as janelas do VS Code
# Depois abre novamente
code .
```

### 2. Verifica se a Extensão Está Ativa

**Opção A: Verifica o ícone**
- Procura o ícone 🛡️ na barra lateral esquerda
- Se aparecer, a extensão está instalada!

**Opção B: Verifica comandos**
- Pressiona `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
- Digita "BobGuard"
- Deves ver comandos como:
  - `BobGuard: Login`
  - `BobGuard: Analisar este ficheiro`
  - etc.

**Opção C: Verifica logs**
- Abre Developer Tools: `Help > Toggle Developer Tools`
- Na tab Console, procura por: `🛡️ BobGuard is now active!`

### 3. Testa a Autenticação

**Método 1: Via Comando (RECOMENDADO)**
1. Pressiona `Ctrl+Shift+P`
2. Digita: `BobGuard: Login`
3. Pressiona Enter
4. O navegador deve abrir automaticamente em `http://localhost:8080/login/`
5. Escolhe "Continuar com Google" ou usa Email/Password
6. Após login bem-sucedido, deves ver: "Autenticação bem sucedida! Redirecionando..."
7. O VS Code deve abrir automaticamente e reconhecer o login

**Método 2: Via Navegador Direto**
1. Abre manualmente: `http://localhost:8080/login/`
2. Faz login com Google ou Email/Password
3. Após sucesso, clica no link que aparece ou copia o URL
4. O VS Code deve abrir automaticamente

### 4. Verifica se o Login Funcionou

**No VS Code:**
1. Clica no ícone 🛡️ BobGuard na barra lateral
2. Deves ver teu email/nome de utilizador
3. Ou abre Command Palette e executa: `BobGuard: Analisar este ficheiro`
4. Se pedir login, algo falhou

**Nos Logs:**
1. Abre Output Panel: `View > Output`
2. Seleciona "Log (Extension Host)" no dropdown
3. Procura por mensagens de autenticação

## 🐛 Troubleshooting

### Problema: "Address already in use" (porta 8080)

**Solução:**
```bash
# Para o servidor antigo
lsof -ti:8080 | xargs kill -9

# Inicia novamente
cd bobguard/web
python3 -m http.server 8080
```

### Problema: VS Code não abre após login

**Causa:** URI handler não está registado.

**Solução:**
```bash
# Verifica se o URI está registado (Linux)
xdg-mime query default x-scheme-handler/vscode

# Testa manualmente (substitui os valores)
xdg-open "vscode://bobguard-team.bobguard/auth?token=TEST&userId=123&email=test@test.com"
```

### Problema: Login completa mas VS Code não reconhece

**Debug:**
1. Abre Developer Tools no VS Code
2. Na tab Console, procura por erros
3. Verifica se aparece: `handleAuthCallback` ou `saveSession`
4. Se não aparecer, o callback não está a ser chamado

**Solução:**
```bash
# Reinstala a extensão
cd BobGuard
./install-extension.sh

# Reinicia VS Code COMPLETAMENTE
```

### Problema: Página de login não carrega

**Verifica:**
```bash
# Confirma que o servidor está a correr
curl http://localhost:8080/login/

# Deve retornar HTML da página de login
```

## 🔍 URLs Importantes

- **Login Local:** http://localhost:8080/login/
- **Landing Page:** http://localhost:8080/
- **URI Callback:** vscode://bobguard-team.bobguard/auth

## 📝 Notas Técnicas

### Como Funciona o Fluxo de Autenticação

1. **Usuário clica "Login"** → VS Code abre `http://localhost:8080/login/`
2. **Usuário faz login** → Firebase autentica
3. **Firebase retorna token** → JavaScript captura o token
4. **Redirect para VS Code** → `vscode://bobguard-team.bobguard/auth?token=...&userId=...&email=...`
5. **VS Code recebe callback** → `AuthManager.handleAuthCallback()` processa
6. **Sessão guardada** → Token, userId e email guardados localmente
7. **UI atualizada** → Sidebar mostra utilizador autenticado

### Ficheiros Relevantes

- `bobguard/src/auth/AuthManager.ts` - Gestão de autenticação
- `bobguard/src/utils/Constants.ts` - URLs (agora aponta para localhost:8080)
- `bobguard/web/login/login.js` - Lógica de login no browser
- `bobguard/package.json` - Publisher ID: `bobguard-team`

## ✅ Checklist de Teste

- [ ] VS Code reiniciado completamente
- [ ] Ícone 🛡️ aparece na barra lateral
- [ ] Comandos "BobGuard" aparecem na Command Palette
- [ ] Servidor HTTP rodando em localhost:8080
- [ ] Página de login abre corretamente
- [ ] Login com Google funciona
- [ ] VS Code abre automaticamente após login
- [ ] Email/nome aparece no painel BobGuard
- [ ] Comando "Analisar ficheiro" funciona sem pedir login novamente

---

**Se tudo funcionar:** Parabéns! 🎉 A extensão está configurada corretamente!

**Se algo falhar:** Consulta a secção de Troubleshooting ou abre issue em:
https://github.com/daltonosjacintodagama03/BobGuard/issues
