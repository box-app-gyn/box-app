# 🚀 Scripts de Setup Automatizado - Vertex AI

Este diretório contém scripts para automatizar a configuração do Vertex AI no projeto CERRADØ INTERBOX.

## 📋 Scripts Disponíveis

### 1. **setup-vertex-ai.sh** (Linux/macOS)
Script bash para configuração completa do Vertex AI.

### 2. **setup-vertex-ai.ps1** (Windows)
Script PowerShell para configuração completa do Vertex AI.

## 🚀 Como Usar

### **Opção 1: Via npm (Recomendado)**

```bash
# Setup completo
npm run setup:vertex-ai

# Verificar status
npm run setup:vertex-ai:check

# Ver logs do Vertex AI
npm run vertex-ai:logs

# Verificar APIs habilitadas
npm run vertex-ai:status
```

### **Opção 2: Executar Diretamente**

#### Linux/macOS:
```bash
# Tornar executável (primeira vez)
chmod +x scripts/setup-vertex-ai.sh

# Executar
./scripts/setup-vertex-ai.sh
```

#### Windows (PowerShell):
```powershell
# Executar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\setup-vertex-ai.ps1
```

## 🔧 O que o Script Faz

### ✅ **Verificações Iniciais**
- Google Cloud CLI instalado
- Usuário logado no Google Cloud
- Billing habilitado

### 🏗️ **Configuração do Projeto**
- Cria projeto `interbox-app-8d400` (se não existir)
- Define como projeto padrão
- Habilita APIs necessárias:
  - `aiplatform.googleapis.com` (Vertex AI)
  - `cloudfunctions.googleapis.com` (Cloud Functions)
  - `cloudbuild.googleapis.com` (Cloud Build)

### 👤 **Service Account**
- Cria service account `vertex-ai-sa`
- Concede permissões necessárias:
  - `roles/aiplatform.user`
  - `roles/aiplatform.developer`
  - `roles/cloudfunctions.developer`

### 🔑 **Autenticação**
- Gera chave JSON `vertex-ai-key.json`
- Configura variáveis de ambiente no `.env.local`
- Testa autenticação

### 📦 **Dependências**
- Instala `@google-cloud/vertexai` no projeto principal
- Instala nas Firebase Functions (se existir)
- Configura variáveis do Firebase

### 📊 **Monitoramento**
- Cria arquivo de configuração `vertex-ai-config.json`
- Fornece comandos para monitoramento

## 📁 Arquivos Criados

```
cerrado-app/
├── vertex-ai-key.json          # Chave de autenticação
├── vertex-ai-config.json       # Configuração para produção
├── .env.local                  # Variáveis de ambiente
└── scripts/
    ├── setup-vertex-ai.sh      # Script bash
    ├── setup-vertex-ai.ps1     # Script PowerShell
    └── README.md               # Este arquivo
```

## 🛠️ Troubleshooting

### **Erro: "Google Cloud CLI não está instalado"**
```bash
# Instalar Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# macOS (via Homebrew)
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### **Erro: "Billing não está habilitado"**
1. Acesse: https://console.cloud.google.com/billing/projects/interbox-app-8d400
2. Habilite o billing para o projeto
3. Execute o script novamente

### **Erro: "Permission denied"**
```bash
# Verificar permissões
gcloud projects get-iam-policy interbox-app-8d400

# Adicionar permissão manualmente
gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="user:seu@email.com" \
  --role="roles/owner"
```

### **Erro: "API not enabled"**
```bash
# Habilitar API manualmente
gcloud services enable aiplatform.googleapis.com
```

## 🔍 Comandos Úteis

### **Verificar Status**
```bash
# Status do projeto
gcloud config get-value project

# APIs habilitadas
gcloud services list --enabled

# Service accounts
gcloud iam service-accounts list

# Billing
gcloud billing projects describe interbox-app-8d400
```

### **Logs e Monitoramento**
```bash
# Logs do Vertex AI
gcloud logging read "resource.type=aiplatform.googleapis.com/Model" --limit=20

# Logs de erro
gcloud logging read "severity>=ERROR" --limit=10

# Métricas de uso
gcloud logging read "resource.type=aiplatform.googleapis.com/Model" \
  --format="table(timestamp,textPayload)" --limit=50
```

### **Limpeza (se necessário)**
```bash
# Remover service account
gcloud iam service-accounts delete vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com

# Remover projeto (CUIDADO!)
gcloud projects delete interbox-app-8d400

# Remover arquivos locais
rm vertex-ai-key.json vertex-ai-config.json
```

## 📊 Custos e Limites

### **Preços Estimados**
- **Gemini Pro**: $0.0005 / 1K input tokens, $0.0015 / 1K output tokens
- **Conversa típica**: ~$0.001-0.005
- **Uso mensal estimado**: $5-50 (dependendo do volume)

### **Limites**
- **Rate Limit**: 60 requests/minuto por projeto
- **Token Limit**: 30K tokens por request
- **Concurrent Requests**: 100 por projeto

## 🚀 Próximos Passos

Após executar o script:

1. **Teste localmente**:
   ```bash
   npm run dev
   ```

2. **Verifique o chat** (apenas em produção):
   - O botão de chat aparece apenas quando `NODE_ENV=production`

3. **Deploy**:
   ```bash
   npm run build:firebase
   firebase deploy
   ```

4. **Monitoramento**:
   - Configure alertas no Google Cloud Console
   - Monitore logs regularmente
   - Acompanhe custos

## 📚 Documentação Relacionada

- [VERTEX-AI-SETUP.md](../docs/VERTEX-AI-SETUP.md) - Guia manual detalhado
- [VERTEX-AI-IMPROVEMENTS.md](../docs/VERTEX-AI-IMPROVEMENTS.md) - Melhorias implementadas
- [Google Cloud Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)

---

**Nota**: Este script é idempotente - pode ser executado múltiplas vezes sem problemas. Ele verifica se os recursos já existem antes de criá-los. 