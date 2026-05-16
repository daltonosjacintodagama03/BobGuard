# Dockerfile para BobGuard Extension
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    bash

# Criar diretório de trabalho
WORKDIR /workspace

# Copiar package files
COPY bobguard/package*.json ./bobguard/

# Instalar dependências
WORKDIR /workspace/bobguard
RUN npm ci

# Copiar código fonte
COPY bobguard/ ./

# Compilar TypeScript
RUN npm run compile

# Expor porta para web server (se necessário)
EXPOSE 3000

# Comando padrão
CMD ["npm", "run", "watch"]
