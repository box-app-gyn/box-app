# 🚀 Deploy Automático com GitHub Actions + Firebase

Este guia mostra como configurar deploy automático sem expor variáveis sensíveis no repositório.

## 📋 Pré-requisitos

1. **Conta GitHub** com repositório do projeto
2. **Projeto Firebase** configurado
3. **Firebase CLI** instalado localmente

## 🔧 Configuração

### 1. Configurar Secrets no GitHub

Vá para `Settings > Secrets and variables > Actions` no seu repositório e adicione:

#### Firebase Config (NEXT_PUBLIC_*)
```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Firebase Service Account
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your_project_id",...}
```

#### Firebase Admin (opcional - para functions)
```
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
```

### 2. Obter Service Account Key

```bash
# No Firebase Console
# Project Settings > Service Accounts > Generate New Private Key
# Copie o conteúdo JSON completo
```

### 3. Configurar Firebase CLI

```bash
# Login no Firebase
firebase login

# Inicializar projeto (se necessário)
firebase init hosting

# Testar deploy local
firebase deploy --only hosting
```

## 🔄 Como Funciona

### Workflow Automático
1. **Push para main/master** → Trigger do workflow
2. **Build** → Next.js build com variáveis do GitHub
3. **Deploy** → Firebase Hosting automaticamente

### Variáveis Seguras
- ✅ **NEXT_PUBLIC_*** → Incluídas no build (não sensíveis)
- ✅ **Service Account** → Usado apenas no deploy
- ❌ **Chaves privadas** → Nunca expostas no código

## 📁 Estrutura de Arquivos

```
.github/
  workflows/
    firebase-deploy.yml    # Workflow de deploy
firebase.json              # Config Firebase
lib/
  firebase.ts              # Config com env vars
env.example                # Exemplo de variáveis
```

## 🚀 Deploy

### Automático (Recomendado)
```bash
git push origin main
# Deploy automático via GitHub Actions
```

### Manual
```bash
# Build local
npm run build

# Deploy manual
firebase deploy --only hosting
```

## 🔍 Monitoramento

### GitHub Actions
- Vá para `Actions` tab no repositório
- Veja logs de build e deploy
- Debug em caso de erro

### Firebase Console
- **Hosting** → Status do deploy
- **Analytics** → Métricas de uso
- **Performance** → Monitoramento

## 🛠️ Troubleshooting

### Erro: "Firebase service account not found"
```bash
# Verificar se o secret está correto
# Copiar JSON completo da service account
```

### Erro: "Build failed"
```bash
# Verificar variáveis NEXT_PUBLIC_*
# Testar build local: npm run build
```

### Erro: "Deploy failed"
```bash
# Verificar firebase.json
# Testar deploy local: firebase deploy
```

## 🔒 Segurança

### ✅ O que é seguro
- Variáveis `NEXT_PUBLIC_*` (públicas por design)
- Service account no GitHub Secrets
- Configurações no Firebase Console

### ❌ O que NÃO fazer
- Commitar `.env` files
- Expor chaves privadas no código
- Usar variáveis sensíveis no frontend

## 📈 Benefícios

1. **Zero Downtime** → Deploy automático
2. **Segurança** → Variáveis protegidas
3. **Histórico** → Logs de todos os deploys
4. **Rollback** → Versões anteriores disponíveis
5. **CI/CD** → Testes automáticos antes do deploy

## 🎯 Próximos Passos

1. Configure os secrets no GitHub usando os valores do seu projeto
2. Teste o workflow com um push
3. Monitore o primeiro deploy
4. Configure domínio customizado (opcional)
5. Configure preview deployments (opcional)

## 📝 Nota sobre Variáveis

- **NEXT_PUBLIC_*** → Variáveis públicas (podem ser expostas)
- **FIREBASE_*** → Variáveis privadas (sempre em secrets)
- **Service Account** → JSON completo da conta de serviço
- **Admin Keys** → Apenas se usar Firebase Functions

## 🔐 Arquivo de Variáveis Reais

Crie um arquivo `docs/VARIABLES-REAIS.md` localmente (não commitado) com os valores reais do seu projeto para facilitar a configuração dos secrets. 