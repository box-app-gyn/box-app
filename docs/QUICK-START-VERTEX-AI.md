# 🚀 Início Rápido - Vertex AI para CERRADØ INTERBOX

## ⚡ Setup em 3 Passos

### 1. **Instalar Google Cloud CLI**
```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Baixe de: https://cloud.google.com/sdk/docs/install
```

### 2. **Executar Setup Automatizado**
```bash
# Setup completo (recomendado)
npm run setup:vertex-ai

# Ou executar diretamente
./scripts/setup-vertex-ai.sh
```

### 3. **Testar e Deploy**
```bash
# Teste local
npm run dev

# Deploy para produção
npm run build:firebase
firebase deploy
```

## 🎯 O que Você Ganha

### ✅ **Chat Inteligente**
- Responde dúvidas sobre o evento
- Sugestões contextuais dinâmicas
- Tom acolhedor e profissional
- Disponível 24/7

### ✅ **Análise de Perfil Audiovisual**
- Score de adequação (0-100)
- Feedback personalizado
- Recomendações específicas
- Formulário especializado

### ✅ **Jornada Estratégica**
- Guia usuários por 7 etapas diferentes
- Sugestões baseadas no interesse
- Conversão otimizada
- Experiência personalizada

## 📊 Comandos Úteis

```bash
# Verificar status
npm run setup:vertex-ai:check

# Ver logs
npm run vertex-ai:logs

# Verificar APIs
npm run vertex-ai:status

# Setup manual (se necessário)
gcloud auth login
gcloud projects create interbox-app-8d400
gcloud config set project interbox-app-8d400
gcloud services enable aiplatform.googleapis.com
```

## 💰 Custos Estimados

- **Por conversa**: ~$0.001-0.005
- **Mensal (1000 conversas)**: ~$5-10
- **Mensal (10000 conversas)**: ~$50-100

## 🔧 Configuração Manual (Se Necessário)

Se o script automatizado não funcionar:

### 1. **Criar Projeto**
```bash
gcloud projects create interbox-app-8d400 --name="CERRADØ INTERBOX"
gcloud config set project interbox-app-8d400
```

### 2. **Habilitar APIs**
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
```

### 3. **Criar Service Account**
```bash
gcloud iam service-accounts create vertex-ai-sa --display-name="Vertex AI Service Account"
gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="serviceAccount:vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 4. **Gerar Chave**
```bash
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com
```

### 5. **Configurar .env.local**
```env
GOOGLE_CLOUD_PROJECT_ID=interbox-app-8d400
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
```

## 🚨 Troubleshooting Rápido

### **"Permission denied"**
```bash
# Verificar conta ativa
gcloud auth list

# Fazer login novamente
gcloud auth login
```

### **"Billing not enabled"**
1. Acesse: https://console.cloud.google.com/billing/projects/interbox-app-8d400
2. Habilite billing
3. Execute script novamente

### **"API not enabled"**
```bash
gcloud services enable aiplatform.googleapis.com
```

### **"Service account not found"**
```bash
# Recriar service account
gcloud iam service-accounts create vertex-ai-sa --display-name="Vertex AI Service Account"
```

## 📱 Como Usar

### **Para Usuários**
1. Acesse o site do CERRADØ INTERBOX
2. Clique no botão 🤖 (chat)
3. Faça perguntas sobre o evento
4. Siga as sugestões para mais informações

### **Para Administradores**
1. Monitore logs: `npm run vertex-ai:logs`
2. Verifique status: `npm run vertex-ai:status`
3. Acompanhe custos no Google Cloud Console
4. Otimize baseado nos dados coletados

## 🎉 Resultado Final

Após a configuração, você terá:

- ✅ **Chat inteligente** funcionando 24/7
- ✅ **Análise de perfil** audiovisual
- ✅ **Jornada estratégica** para usuários
- ✅ **Tracking completo** de analytics
- ✅ **Monitoramento** de custos e performance
- ✅ **Escalabilidade** automática

---

**🎯 Meta**: Converter mais visitantes em participantes do CERRADØ INTERBOX através de um atendimento inteligente e personalizado! 