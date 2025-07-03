#!/bin/bash

# 🚀 Script de Setup Alternativo - Vertex AI para CERRADØ INTERBOX
# Este script cria um novo projeto se o original não estiver acessível

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Gerar ID único para o projeto
TIMESTAMP=$(date +%s)
PROJECT_ID="interbox-app-${TIMESTAMP}"
PROJECT_NAME="CERRADO INTERBOX"
SA_NAME="vertex-ai-sa"
SA_DISPLAY_NAME="Vertex AI Service Account"
LOCATION="us-central1"

echo "🤖 ========================================="
echo "   SETUP ALTERNATIVO - VERTEX AI"
echo "   CERRADØ INTERBOX 2025"
echo "========================================="
echo ""

warn "O projeto original 'interbox-app-8d400' não está acessível."
log "Criando novo projeto com ID único: $PROJECT_ID"
echo ""

# Verificar se gcloud está instalado
step "Verificando Google Cloud CLI..."
if ! command -v gcloud &> /dev/null; then
    error "Google Cloud CLI não está instalado!"
    echo "Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
log "✅ Google Cloud CLI encontrado"

# Verificar se está logado
step "Verificando autenticação..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    warn "Você não está logado no Google Cloud"
    log "Fazendo login..."
    gcloud auth login
else
    log "✅ Já está logado no Google Cloud"
fi

# Criar novo projeto
step "Criando novo projeto..."
log "Criando projeto $PROJECT_ID..."
gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
log "✅ Projeto criado com sucesso"

# Definir projeto como padrão
step "Configurando projeto padrão..."
gcloud config set project $PROJECT_ID
log "✅ Projeto $PROJECT_ID definido como padrão"

# Habilitar APIs necessárias
step "Habilitando APIs..."
log "Habilitando Vertex AI API..."
gcloud services enable aiplatform.googleapis.com

log "Habilitando Cloud Functions API..."
gcloud services enable cloudfunctions.googleapis.com

log "Habilitando Cloud Build API..."
gcloud services enable cloudbuild.googleapis.com

log "✅ APIs habilitadas"

# Verificar billing
step "Verificando billing..."
if ! gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)" | grep -q "True"; then
    warn "Billing não está habilitado para o projeto!"
    echo "Habilite o billing em: https://console.cloud.google.com/billing/projects/$PROJECT_ID"
    echo "Ou execute: gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT"
    read -p "Pressione Enter após habilitar o billing..."
else
    log "✅ Billing habilitado"
fi

# Criar service account
step "Criando Service Account..."
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

log "Criando service account $SA_NAME..."
gcloud iam service-accounts create $SA_NAME --display-name="$SA_DISPLAY_NAME"
log "✅ Service account criado"

# Conceder permissões
step "Concedendo permissões..."
log "Adicionando permissão aiplatform.user..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/aiplatform.user"

log "Adicionando permissão aiplatform.developer..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/aiplatform.developer"

log "Adicionando permissão cloudfunctions.developer..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudfunctions.developer"

log "✅ Permissões concedidas"

# Criar chave JSON
step "Criando chave de autenticação..."
KEY_FILE="vertex-ai-key.json"
if [ -f "$KEY_FILE" ]; then
    warn "Arquivo $KEY_FILE já existe. Fazendo backup..."
    mv "$KEY_FILE" "${KEY_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

log "Criando nova chave JSON..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SA_EMAIL

log "✅ Chave JSON criada: $KEY_FILE"

# Configurar variáveis de ambiente
step "Configurando variáveis de ambiente..."
ENV_FILE=".env.local"

# Verificar se .env.local existe
if [ ! -f "$ENV_FILE" ]; then
    log "Criando arquivo $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Adicionar configurações do Vertex AI
log "Adicionando configurações do Vertex AI ao $ENV_FILE..."

# Remover configurações antigas se existirem
sed -i.bak '/GOOGLE_CLOUD_PROJECT_ID/d' "$ENV_FILE"
sed -i.bak '/GOOGLE_APPLICATION_CREDENTIALS/d' "$ENV_FILE"

# Adicionar novas configurações
echo "" >> "$ENV_FILE"
echo "# Vertex AI (Google Cloud)" >> "$ENV_FILE"
echo "GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID" >> "$ENV_FILE"
echo "GOOGLE_APPLICATION_CREDENTIALS=./$KEY_FILE" >> "$ENV_FILE"
log "✅ Configurações adicionadas ao $ENV_FILE"

# Testar configuração
step "Testando configuração..."
log "Testando autenticação da service account..."
gcloud auth activate-service-account --key-file=$KEY_FILE

log "Verificando APIs habilitadas..."
gcloud services list --enabled --filter="name:aiplatform.googleapis.com"

log "✅ Configuração testada com sucesso"

# Instalar dependências se necessário
step "Verificando dependências..."
if [ -f "package.json" ]; then
    log "Instalando dependência @google-cloud/vertexai..."
    npm install @google-cloud/vertexai
    log "✅ Dependência instalada"
fi

# Configurar Firebase Functions (se existir)
if [ -d "functions" ]; then
    step "Configurando Firebase Functions..."
    cd functions
    
    if [ -f "package.json" ]; then
        log "Instalando dependência nas functions..."
        npm install @google-cloud/vertexai
    fi
    
    cd ..
    
    log "Configurando variáveis do Firebase..."
    firebase functions:config:set vertexai.project_id="$PROJECT_ID"
    
    log "✅ Firebase Functions configurado"
fi

# Criar arquivo de configuração para produção
step "Criando configuração para produção..."
PROD_CONFIG="vertex-ai-config.json"
cat > "$PROD_CONFIG" << EOF
{
  "project_id": "$PROJECT_ID",
  "location": "$LOCATION",
  "service_account_email": "$SA_EMAIL",
  "key_file": "$KEY_FILE",
  "apis_enabled": [
    "aiplatform.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com"
  ],
  "setup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "ready",
  "note": "Projeto criado automaticamente devido a conflito de permissões"
}
EOF

log "✅ Configuração salva em $PROD_CONFIG"

# Resumo final
echo ""
echo "🎉 ========================================="
echo "   SETUP ALTERNATIVO CONCLUÍDO!"
echo "========================================="
echo ""
echo "📋 Resumo da configuração:"
echo "   • Projeto: $PROJECT_ID (NOVO)"
echo "   • Service Account: $SA_EMAIL"
echo "   • Chave JSON: $KEY_FILE"
echo "   • Localização: $LOCATION"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Este é um projeto NOVO criado automaticamente"
echo "   • O projeto original 'interbox-app-8d400' não estava acessível"
echo "   • Todas as configurações foram atualizadas para o novo projeto"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Teste localmente: npm run dev"
echo "   2. Verifique se o chat funciona"
echo "   3. Deploy: npm run build:firebase && firebase deploy"
echo ""
echo "📊 Monitoramento:"
echo "   • Console: https://console.cloud.google.com/vertex-ai?project=$PROJECT_ID"
echo "   • Logs: gcloud logging read 'resource.type=aiplatform.googleapis.com/Model' --project=$PROJECT_ID"
echo ""
echo "💰 Custos estimados:"
echo "   • ~$0.001-0.005 por conversa"
echo "   • Monitoramento recomendado"
echo ""

# Verificar se tudo está funcionando
step "Verificação final..."
if [ -f "$KEY_FILE" ] && [ -f "$ENV_FILE" ] && [ -f "$PROD_CONFIG" ]; then
    log "✅ Todos os arquivos de configuração foram criados"
    log "✅ Setup alternativo completo! O Vertex AI está pronto para uso."
else
    error "❌ Alguns arquivos de configuração estão faltando"
    exit 1
fi

echo ""
echo "🚀 Para testar, execute: npm run dev"
echo "🤖 O chat estará disponível apenas em produção (NODE_ENV=production)"
echo ""
echo "💡 Dica: Se quiser usar o projeto original, peça acesso ao proprietário"
echo "   do projeto 'interbox-app-8d400' ou use este novo projeto." 