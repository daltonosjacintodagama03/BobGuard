# 🚀 BobGuard - Guia de Início Rápido

## Instalação Rápida com Docker

### 1. Clone o Repositório
```bash
git clone git@github.com:daltonosjacintodagama03/BobGuard.git
cd BobGuard
```

### 2. Inicie com Docker
```bash
docker-compose up -d
```

### 3. Verifique a Instalação
```bash
docker-compose ps
```

Deverás ver:
```
NAME                  STATUS
bobguard-extension    Up
```

## Acesso à Aplicação

### Landing Page
Abre no navegador: `file:///caminho/para/BobGuard/bobguard/web/index.html`

Ou serve localmente:
```bash
cd bobguard/web
python3 -m http.server 8080
# Acede a http://localhost:8080
```

### Login
1. Acede à página de login: `bobguard/web/login/index.html`
2. Usa tua conta Google ou cria uma conta com email/password
3. Firebase já está configurado e pronto a usar!

## Desenvolvimento

### Compilar TypeScript
```bash
cd bobguard
npm install
npm run compile
```

### Modo Watch (desenvolvimento)
```bash
npm run watch
```

### Executar Testes
```bash
docker-compose --profile test run bobguard-test
```

## Comandos Úteis

### Docker
```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reconstruir
docker-compose up -d --build

# Limpar tudo
docker-compose down -v
```

### NPM
```bash
# Instalar dependências
npm install

# Compilar
npm run compile

# Watch mode
npm run watch

# Testes
npm test

# Criar VSIX
npm run package
```

## Estrutura do Projeto

```
BobGuard/
├── Dockerfile              # Imagem Docker
├── docker-compose.yml      # Orquestração
├── .dockerignore          # Exclusões Docker
└── bobguard/
    ├── src/               # Código TypeScript
    ├── web/               # Landing page e login
    │   ├── index.html     # Página principal
    │   ├── login/         # Sistema de login
    │   ├── styles/        # CSS
    │   └── scripts/       # JavaScript
    └── package.json       # Dependências
```

## Configuração Firebase

O Firebase já está configurado com as credenciais do projeto BobGuard:
- **Project ID**: bobguard-36fb0
- **Auth Domain**: bobguard-36fb0.firebaseapp.com

Se quiseres usar tua própria instância Firebase:
1. Cria um projeto em [Firebase Console](https://console.firebase.google.com)
2. Ativa Authentication (Email/Password e Google)
3. Ativa Firestore Database
4. Atualiza as credenciais em:
   - `bobguard/src/auth/FirebaseConfig.ts`
   - `bobguard/web/login/firebase-config.js`

## Próximos Passos

1. ✅ Instalar extensão no VS Code
2. ✅ Fazer login via Firebase
3. ✅ Analisar teu primeiro projeto
4. ✅ Gerar roadmap de melhorias
5. ✅ Criar regras custom

## Suporte

- 📚 [README Completo](bobguard/README.md)
- 🐛 [Reportar Issues](https://github.com/daltonosjacintodagama03/BobGuard/issues)
- 💬 [Discussões](https://github.com/daltonosjacintodagama03/BobGuard/discussions)

---

**Feito com ❤️ para a comunidade**
