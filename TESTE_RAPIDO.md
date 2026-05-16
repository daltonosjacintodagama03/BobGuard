# 🚀 Teste Rápido - BobGuard

## 📋 Checklist Rápido (5 minutos)

### ✅ Passo 1: Reinicia o VS Code
```bash
# Fecha TODAS as janelas do VS Code
# Abre novamente
code .
```

### ✅ Passo 2: Verifica se Aparece o Ícone 🛡️
- Olha para a barra lateral esquerda
- Deves ver o ícone do escudo 🛡️
- **Se NÃO aparecer:** Algo está errado, vê INSTALLATION.md

### ✅ Passo 3: Abre a Página de Login
O servidor já está a correr em: **http://localhost:8080/login/**

Abre no navegador ou usa o comando:
```bash
xdg-open http://localhost:8080/login/
```

### ✅ Passo 4: Faz Login
1. Clica em **"Continuar com Google"**
2. Seleciona tua conta Google
3. Aguarda a mensagem: **"Autenticação bem sucedida! Redirecionando..."**
4. O VS Code deve abrir automaticamente

### ✅ Passo 5: Verifica se Funcionou
1. Clica no ícone 🛡️ BobGuard na barra lateral
2. Deves ver teu email/nome
3. Ou pressiona `Ctrl+Shift+P` e digita "BobGuard"
4. Executa: **"BobGuard: Analisar este ficheiro"**
5. Se funcionar sem pedir login = SUCESSO! 🎉

---

## 🐛 Se Algo Falhar

### Problema: Ícone não aparece
```bash
cd BobGuard
./install-extension.sh
# Reinicia VS Code
```

### Problema: VS Code não abre após login
```bash
# Testa manualmente
xdg-open "vscode://bobguard-team.bobguard/auth?token=TEST&userId=123&email=test@test.com"
```

### Problema: Porta 8080 ocupada
```bash
lsof -ti:8080 | xargs kill -9
cd bobguard/web
python3 -m http.server 8080
```

---

## 📚 Documentação Completa
- **Instalação Detalhada:** [INSTALLATION.md](INSTALLATION.md)
- **Teste Completo:** [TESTE_AUTENTICACAO.md](TESTE_AUTENTICACAO.md)
- **Início Rápido:** [QUICK_START.md](QUICK_START.md)

---

**Servidor HTTP está rodando em background (PID: 667419)**
Para parar: `kill 667419`
