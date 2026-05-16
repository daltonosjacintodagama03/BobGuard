# 🛡️ BobGuard - AI-Powered Code Review

**Análise inteligente de código usando IBM Bob como motor de análise**

BobGuard é uma extensão profissional para VS Code que oferece análise de código em tempo real focada em segurança, performance, qualidade e manutenibilidade. Usa o IBM Bob como motor de análise inteligente para identificar problemas e sugerir melhorias.

## ✨ Funcionalidades

### 🔍 Análise Inteligente
- **Segurança**: Deteta SQL injection, secrets hardcoded, falhas de autenticação, XSS, CSRF
- **Performance**: Identifica loops ineficientes, memory leaks, N+1 queries, falta de caching
- **Qualidade**: Encontra código morto, complexidade elevada, violações SOLID, falta de testes
- **Código Legado**: Deteta APIs deprecated, dependências desatualizadas, debt técnico

### 🎯 Interface Intuitiva
- **Sidebar Nativa**: Ícone próprio na Activity Bar com painel lateral completo
- **Modo Minimal**: Lista limpa de findings com severidade, ficheiro e linha
- **Modo Dashboard**: Métricas de qualidade, gráficos e histórico de reviews
- **Navegação Automática**: Clica num finding e o editor navega para a linha exata

### 📋 Regras Custom
- Escreve regras em linguagem natural (ex: "todas as funções devem ter docstring")
- Bob incorpora automaticamente as tuas regras em cada análise
- Ativa/desativa regras individualmente

### 🗺️ Roadmap do Projeto
- Análise completa do projeto com identificação de arquitetura
- Pontos críticos e debt técnico priorizado
- Plano de melhorias com estimativa de esforço (Low/Medium/High)
- Exportado como ROADMAP.md na raiz do projeto

### 🔐 Autenticação e Sincronização
- Login via Firebase (Email/Password ou Google)
- Sessões sincronizadas entre dispositivos
- Histórico de análises com comparação entre sessões

## 📦 Instalação

### Pré-requisitos

1. **VS Code** 1.120.0 ou superior
2. **IBM Bob CLI** instalado e acessível no PATH
   ```bash
   # Verifica se Bob está instalado
   bob --version
   ```

### Instalação Rápida com Docker 🐳

A forma mais simples de começar a usar o BobGuard é através do Docker:

```bash
# Clone o repositório
git clone git@github.com:daltonosjacintodagama03/BobGuard.git
cd BobGuard

# Inicie os containers
docker-compose up -d

# Verifique se está a correr
docker-compose ps
```

**Vantagens do Docker:**
- ✅ Todas as dependências já configuradas
- ✅ Ambiente isolado e consistente
- ✅ Fácil de partilhar com a equipa
- ✅ Sem conflitos com outras instalações

**Comandos úteis:**
```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir após mudanças
docker-compose up -d --build

# Executar testes
docker-compose run --rm bobguard-test
```

### Instalar Extensão

#### Opção 1: Via VSIX (Recomendado)
1. Descarrega o ficheiro `bobguard-0.1.0.vsix`
2. No VS Code: `Extensions` → `...` → `Install from VSIX...`
3. Seleciona o ficheiro `.vsix`
4. Recarrega o VS Code

#### Opção 2: Via Marketplace (Quando publicado)
```bash
code --install-extension bobguard.bobguard
```

### Requisitos do Sistema para Docker

- **Docker**: 20.10 ou superior
- **Docker Compose**: 2.0 ou superior
- **Espaço em disco**: ~500MB para imagens
- **RAM**: Mínimo 2GB disponível

**Instalar Docker:**
- **Linux**: `curl -fsSL https://get.docker.com | sh`
- **macOS/Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Troubleshooting Docker

**Problema: "Cannot connect to Docker daemon"**
```bash
# Linux: Adicionar utilizador ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

**Problema: "Port already in use"**
```bash
# Alterar porta no docker-compose.yml
ports:
  - "3001:3000"  # Usar porta 3001 em vez de 3000
```

**Problema: Mudanças no código não refletem**
```bash
# Reconstruir containers
docker-compose down
docker-compose up -d --build
```

## ⚙️ Configuração

### Configuração Básica (Sem Firebase)

A extensão funciona sem Firebase, mas sem autenticação e sincronização de sessões.

### Configuração Completa (Com Firebase)

Para usar todas as funcionalidades (autenticação e sincronização):

#### 1. Criar Projeto Firebase

1. Acede a [Firebase Console](https://console.firebase.google.com)
2. Clica em "Add project" ou "Adicionar projeto"
3. Dá um nome ao projeto (ex: "bobguard-auth")
4. Segue os passos até criar o projeto

#### 2. Ativar Authentication

1. No menu lateral, vai a **Authentication**
2. Clica em **Get started**
3. Ativa os métodos:
   - **Email/Password**: Clica em "Email/Password" → Enable → Save
   - **Google**: Clica em "Google" → Enable → Save

#### 3. Ativar Firestore

1. No menu lateral, vai a **Firestore Database**
2. Clica em **Create database**
3. Escolhe **Start in production mode**
4. Seleciona a região mais próxima (ex: europe-west1)

#### 4. Configurar Regras de Segurança

No Firestore, vai a **Rules** e adiciona:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

#### 5. Obter Credenciais

1. Vai a **Project Settings** (ícone de engrenagem)
2. Na tab **General**, encontra **Your apps**
3. Clica no ícone **</>** para adicionar uma web app
4. Dá um nome (ex: "BobGuard Extension")
5. **NÃO** ativas Firebase Hosting (por agora)
6. Copia o `projectId` e `apiKey`

#### 6. Configurar no VS Code

Adiciona ao teu `settings.json` (Ctrl+Shift+P → "Preferences: Open Settings (JSON)"):

```json
{
  "bobguard.firebase.projectId": "your-project-id",
  "bobguard.firebase.apiKey": "your-api-key"
}
```

#### 7. Configurar Página de Login

1. Edita `web/login/firebase-config.js` com as tuas credenciais:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
```

2. Hospeda a página de login no Firebase Hosting:

```bash
cd web
firebase init hosting
# Escolhe o diretório 'login' como public directory
firebase deploy --only hosting
```

3. Atualiza a URL de login em `src/utils/Constants.ts`:

```typescript
LOGIN_PAGE: 'https://your-project-id.web.app/login'
```

## 🚀 Uso

### Análise de Ficheiro

1. Abre um ficheiro no editor
2. Clica no ícone 🛡️ BobGuard na Activity Bar
3. Clica em **"🔍 Analisar este ficheiro"**
4. Aguarda a análise (pode demorar alguns segundos)
5. Vê os findings na sidebar
6. Clica num finding para navegar para a linha

**Ou usa o comando:**
- `Ctrl+Shift+P` → `BobGuard: Analisar este ficheiro`

### Análise de Projeto Completo

1. Abre um workspace/projeto
2. Na sidebar do BobGuard, clica em **"📦 Analisar projeto completo"**
3. Aguarda a análise (pode demorar vários minutos)
4. Vê todos os findings organizados por severidade

**Ou usa o comando:**
- `Ctrl+Shift+P` → `BobGuard: Analisar projeto completo`

### Gerar Roadmap

1. Na sidebar do BobGuard, clica em **"🗺️ Gerar Roadmap"**
2. Aguarda a geração (pode demorar alguns minutos)
3. O ficheiro `ROADMAP.md` será criado na raiz do projeto
4. Abre automaticamente para visualização

**Ou usa o comando:**
- `Ctrl+Shift+P` → `BobGuard: Gerar Roadmap do Projeto`

### Regras Custom

1. Na sidebar, secção **"📋 Regras Custom"**
2. Clica em **"+"** para adicionar uma regra
3. Escreve a regra em linguagem natural
4. A regra é aplicada automaticamente nas próximas análises

**Exemplos de regras:**
- "Todas as funções públicas devem ter docstring"
- "Não usar console.log em código de produção"
- "Todas as queries SQL devem usar prepared statements"
- "Funções não devem ter mais de 50 linhas"

### Alternar Modo (Minimal/Dashboard)

- Clica no botão **"⚙️ Modo: Minimal"** na sidebar
- Ou usa: `Ctrl+Shift+P` → `BobGuard: Alternar Modo`

### Histórico de Sessões

- Vê sessões anteriores na secção **"📜 Histórico"**
- Clica numa sessão para ver os findings
- Clica no **×** para apagar uma sessão

## 🎨 Configurações

Todas as configurações estão disponíveis em `Settings` → `Extensions` → `BobGuard`:

| Configuração | Descrição | Padrão |
|--------------|-----------|--------|
| `bobguard.mode` | Modo de visualização (minimal/dashboard) | `minimal` |
| `bobguard.customRules` | Array de regras custom | `[]` |
| `bobguard.autoAnalyze` | Analisar automaticamente ao salvar | `false` |
| `bobguard.severityFilter` | Filtrar findings por severidade | `["critical","high","medium","low"]` |
| `bobguard.firebase.projectId` | Firebase Project ID | `""` |
| `bobguard.firebase.apiKey` | Firebase API Key | `""` |

## 🔧 Desenvolvimento

### Setup do Projeto

```bash
# Clone o repositório
git clone https://github.com/yourusername/bobguard.git
cd bobguard/bobguard

# Instala dependências
npm install

# Compila
npm run compile

# Executa em modo watch
npm run watch
```

### Testar a Extensão

1. Abre o projeto no VS Code
2. Pressiona `F5` para abrir uma nova janela com a extensão carregada
3. Testa as funcionalidades

### Build VSIX

```bash
npm run package
```

Isto gera `bobguard-0.1.0.vsix` pronto para instalação.

## 📊 Categorias de Análise

### 🔒 Segurança (Critical/High)
- SQL/NoSQL/Command/LDAP injection
- Hardcoded secrets (API keys, passwords, tokens)
- Authentication/Authorization flaws
- Sensitive data exposure
- Input validation missing
- XSS, CSRF, SSRF vulnerabilities
- Insecure cryptography

### ⚡ Performance (Medium/High)
- Inefficient loops (O(n²)+)
- Blocking I/O operations
- Memory leaks
- N+1 query problems
- Missing caching opportunities
- Unnecessary re-renders

### ✨ Qualidade (Low/Medium)
- Dead code and unused imports
- Long functions (>50 lines)
- High cyclomatic complexity
- Poor naming conventions
- Missing error handling
- Code duplication
- SOLID violations

### 📦 Código Legado (Low/Medium)
- Deprecated APIs and patterns
- Outdated dependencies
- Missing documentation
- Tight coupling
- Technical debt

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Cria uma branch para a tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as tuas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abre um Pull Request

## 📝 Licença

Este projeto está licenciado sob a licença MIT - vê o ficheiro [LICENSE](LICENSE) para detalhes.

## 🐛 Reportar Bugs

Encontraste um bug? [Abre uma issue](https://github.com/yourusername/bobguard/issues) com:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Versão do VS Code e da extensão

## 💬 Suporte

- 📚 [Documentação](https://github.com/yourusername/bobguard#readme)
- 🐛 [Issues](https://github.com/yourusername/bobguard/issues)
- 💡 [Discussions](https://github.com/yourusername/bobguard/discussions)

## 🙏 Agradecimentos

- **IBM Bob** - Motor de análise inteligente
- **Firebase** - Autenticação e sincronização
- **VS Code** - Plataforma de extensões

---

**Feito com ❤️ para a comunidade de developers**

🛡️ **BobGuard** - Código mais seguro, performante e de qualidade!