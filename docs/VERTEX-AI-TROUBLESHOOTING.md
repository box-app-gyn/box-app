# 🛠️ Troubleshooting - Vertex AI CERRADØ INTERBOX

## 🚨 Problemas Comuns e Soluções

### 1. **Erro: "project display name contains invalid characters"**

**Problema**: O Google Cloud não aceita caracteres especiais no nome do projeto.

**Solução**: Use apenas caracteres ASCII básicos.

```bash
# ❌ Não funciona
PROJECT_NAME="CERRADØ INTERBOX"

# ✅ Funciona
PROJECT_NAME="CERRADO INTERBOX"
```

**Status**: ✅ **Corrigido** - Scripts atualizados para usar "CERRADO INTERBOX"

### 2. **Erro: "does not have permission to access projects"**

**Problema**: Usuário não tem permissão para acessar o projeto.

**Soluções**:

```bash
# Verificar conta ativa
gcloud auth list

# Fazer login novamente
gcloud auth login

# Verificar permissões
gcloud projects get-iam-policy interbox-app-8d400
```

### 3. **Erro: "Billing not enabled"**

**Problema**: Projeto sem billing habilitado.

**Solução**:
1. Acesse: https://console.cloud.google.com/billing/projects/interbox-app-8d400
2. Habilite billing para o projeto
3. Execute script novamente

### 4. **Erro: "API not enabled"**

**Problema**: APIs necessárias não estão habilitadas.

**Solução**:
```bash
gcloud services enable aiplatform.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 5. **Erro: "Service account not found"**

**Problema**: Service account não existe ou foi deletado.

**Solução**:
```bash
# Recriar service account
gcloud iam service-accounts create vertex-ai-sa --display-name="Vertex AI Service Account"

# Conceder permissões
gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="serviceAccount:vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### 6. **Erro: "Invalid credentials"**

**Problema**: Chave JSON inválida ou corrompida.

**Solução**:
```bash
# Gerar nova chave
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com

# Testar autenticação
gcloud auth activate-service-account --key-file=vertex-ai-key.json
```

### 7. **Erro: "Rate limit exceeded"**

**Problema**: Muitas requisições em pouco tempo.

**Soluções**:
- Implementar cache de respostas
- Adicionar delays entre requests
- Usar rate limiting no código

### 8. **Erro: "Token limit exceeded"**

**Problema**: Mensagem muito longa para o modelo.

**Solução**:
- Limitar tamanho das mensagens (máx 500 caracteres)
- Otimizar contexto do AI
- Usar resumos para histórico longo

## 🔧 Comandos de Diagnóstico

### **Verificar Status Geral**
```bash
# Status do projeto
gcloud config get-value project

# Conta ativa
gcloud auth list

# APIs habilitadas
gcloud services list --enabled

# Service accounts
gcloud iam service-accounts list

# Billing
gcloud billing projects describe interbox-app-8d400
```

### **Verificar Vertex AI**
```bash
# Status das APIs
npm run vertex-ai:status

# Logs recentes
npm run vertex-ai:logs

# Testar projeto
npm run setup:vertex-ai:check
```

### **Verificar Configuração Local**
```bash
# Verificar arquivos
ls -la vertex-ai-key.json
ls -la .env.local
ls -la vertex-ai-config.json

# Verificar variáveis de ambiente
cat .env.local | grep GOOGLE
```

## 🚀 Soluções Rápidas

### **Reset Completo**
```bash
# Remover arquivos locais
rm -f vertex-ai-key.json vertex-ai-config.json

# Remover service account
gcloud iam service-accounts delete vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com

# Executar setup novamente
npm run setup:vertex-ai
```

### **Setup Manual Rápido**
```bash
# 1. Criar projeto
gcloud projects create interbox-app-8d400 --name="CERRADO INTERBOX"
gcloud config set project interbox-app-8d400

# 2. Habilitar APIs
gcloud services enable aiplatform.googleapis.com

# 3. Criar service account
gcloud iam service-accounts create vertex-ai-sa --display-name="Vertex AI Service Account"

# 4. Conceder permissões
gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="serviceAccount:vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 5. Gerar chave
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-sa@interbox-app-8d400.iam.gserviceaccount.com

# 6. Configurar .env.local
echo "GOOGLE_CLOUD_PROJECT_ID=interbox-app-8d400" >> .env.local
echo "GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json" >> .env.local
```

## 📊 Monitoramento e Logs

### **Logs Importantes**
```bash
# Logs do Vertex AI
gcloud logging read "resource.type=aiplatform.googleapis.com/Model" --limit=20

# Logs de erro
gcloud logging read "severity>=ERROR" --limit=10

# Logs de uso
gcloud logging read "resource.type=aiplatform.googleapis.com/Model" \
  --format="table(timestamp,textPayload)" --limit=50
```

### **Métricas de Performance**
- **Response Time**: <3 segundos
- **Success Rate**: >95%
- **Error Rate**: <5%
- **Cost per Request**: <$0.01

## 🎯 Checklist de Verificação

### **Antes do Setup**
- [ ] Google Cloud CLI instalado
- [ ] Usuário logado no Google Cloud
- [ ] Billing habilitado
- [ ] Permissões adequadas

### **Após o Setup**
- [ ] Projeto criado
- [ ] APIs habilitadas
- [ ] Service account criado
- [ ] Chave JSON gerada
- [ ] Variáveis de ambiente configuradas
- [ ] Dependências instaladas
- [ ] Teste de autenticação passou

### **Para Produção**
- [ ] Deploy realizado
- [ ] Chat funcionando
- [ ] Analytics configurado
- [ ] Monitoramento ativo
- [ ] Alertas configurados

## 📞 Suporte

Se ainda tiver problemas:

1. **Verificar logs**: `npm run vertex-ai:logs`
2. **Consultar documentação**: `docs/VERTEX-AI-SETUP.md`
3. **Google Cloud Console**: https://console.cloud.google.com/vertex-ai
4. **Google Cloud Support**: https://cloud.google.com/support

---

**💡 Dica**: O script automatizado detecta e corrige a maioria dos problemas automaticamente. Se algo der errado, ele fornece instruções específicas para resolver. 