# 🤖 Configuração do Vertex AI - CERRADØ INTERBOX

Este guia explica como configurar o Vertex AI para o agente inteligente do site.

## 📋 Pré-requisitos

1. **Conta Google Cloud Platform** ativa
2. **Projeto GCP** criado
3. **Billing** habilitado no projeto
4. **Vertex AI API** habilitada

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud

```bash
# Instalar Google Cloud CLI
# 

# Fazer login
gcloud auth login

# Criar projeto (se não existir)
gcloud projects create interbox-app-8d400 --name="CERRADØ INTERBOX"

# Definir projeto como padrão
gcloud config set project interbox-app-8d400
```

### 2. Habilitar APIs Necessárias

```bash
# Habilitar Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Habilitar Cloud Functions (se necessário)
gcloud services enable cloudfunctions.googleapis.com

# Verificar APIs habilitadas
gcloud services list --enabled
```

### 3. Configurar Service Account

```bash
# Criar service account
gcloud iam service-accounts create vertex-ai-sa \
  --display-name="Vertex AI Service Account"

# Obter email da service account
SA_EMAIL=$(gcloud iam service-accounts list \
  --filter="displayName:Vertex AI Service Account" \
  --format="value(email)")

# Conceder permissões necessárias
gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/aiplatform.developer"

# Criar chave JSON
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=$SA_EMAIL
```

### 4. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env.local`:

```env
# Vertex AI (Google Cloud)
GOOGLE_CLOUD_PROJECT_ID=interbox-app-8d400
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
```

### 5. Configurar Firebase Functions (Opcional)

Se quiser usar o Vertex AI nas Cloud Functions:

```bash
# No diretório functions/
cd functions

# Instalar dependência
npm install @google-cloud/vertexai

# Configurar variáveis de ambiente no Firebase
firebase functions:config:set vertexai.project_id="interbox-app-8d400"
```

### 6. Testar Configuração

```bash
# Testar localmente
npm run dev

# Verificar se o chat funciona
# Abrir http://localhost:3000 e clicar no botão de chat
```

## 🔧 Configurações Avançadas

### Personalizar Contexto do AI

Edite o arquivo `lib/vertex-ai.ts` para modificar:

- **Contexto do evento**: Informações específicas do CERRADØ
- **Tom de voz**: Profissional, amigável, técnico
- **Sugestões**: Perguntas frequentes
- **Fallbacks**: Respostas quando não souber algo

### Configurar Rate Limiting

Para produção, implemente rate limiting:

```typescript
// Em pages/api/chat.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
```

### Monitoramento e Logs

```bash
# Ver logs do Vertex AI
gcloud logging read "resource.type=aiplatform.googleapis.com/Model" --limit=50

# Configurar alertas
gcloud monitoring channels create --display-name="Vertex AI Errors" \
  --type="email" --channel-labels="email_address=seu@email.com"
```

## 💰 Custos e Limites

### Preços (Janeiro 2024)
- **Gemini Pro**: $0.0005 / 1K input tokens, $0.0015 / 1K output tokens
- **Requests**: ~$0.001-0.005 por conversa típica

### Limites
- **Rate Limit**: 60 requests/minuto por projeto
- **Token Limit**: 30K tokens por request
- **Concurrent Requests**: 100 por projeto

### Otimizações de Custo

1. **Cache de respostas** para perguntas frequentes
2. **Contexto otimizado** para reduzir tokens
3. **Fallbacks** para evitar chamadas desnecessárias
4. **Monitoramento** de uso

## 🛠️ Troubleshooting

### Erro: "API not enabled"
```bash
gcloud services enable aiplatform.googleapis.com
```

### Erro: "Permission denied"
```bash
# Verificar permissões
gcloud projects get-iam-policy interbox-app-8d400

# Adicionar permissão
gcloud projects add-iam-policy-binding interbox-app-8d400 \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/aiplatform.user"
```

### Erro: "Invalid credentials"
```bash
# Verificar arquivo de credenciais
cat vertex-ai-key.json

# Testar autenticação
gcloud auth activate-service-account --key-file=vertex-ai-key.json
```

### Erro: "Rate limit exceeded"
- Implementar rate limiting
- Adicionar delays entre requests
- Usar cache para respostas

## 📊 Analytics e Métricas

### Tracking Implementado

O sistema já inclui tracking para:

- **Chat opens**: Quando usuário abre o chat
- **Chat messages**: Mensagens enviadas
- **Profile analysis**: Análises de perfil audiovisual
- **Error tracking**: Erros e fallbacks

### Métricas Importantes

- **Engagement rate**: % de usuários que usam o chat
- **Response time**: Tempo médio de resposta
- **Success rate**: % de respostas bem-sucedidas
- **Cost per interaction**: Custo por interação

## 🔒 Segurança

### Boas Práticas

1. **Nunca exponha credenciais** no frontend
2. **Use API routes** para todas as chamadas
3. **Valide inputs** antes de enviar para IA
4. **Implemente rate limiting**
5. **Monitore logs** regularmente

### Validações Implementadas

- Tamanho máximo de mensagem: 500 caracteres
- Rate limiting básico por IP
- Sanitização de inputs
- Fallbacks para erros

## 🚀 Deploy

### Firebase Hosting

```bash
# Build para produção
npm run build:firebase

# Deploy
firebase deploy

# Verificar se funciona
# Acessar o site e testar o chat
```

### Variáveis de Ambiente em Produção

```bash
# Configurar no Firebase
firebase functions:config:set vertexai.project_id="interbox-app-8d400"

# Ou usar .env em produção
# Adicionar GOOGLE_APPLICATION_CREDENTIALS como variável de ambiente
```

## 📞 Suporte

Se encontrar problemas:

1. **Verificar logs**: `firebase functions:log`
2. **Testar localmente**: `npm run dev`
3. **Verificar credenciais**: Arquivo JSON válido
4. **Consultar documentação**: [Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)

---

**Nota**: Este sistema está configurado para funcionar apenas em produção (`NODE_ENV === 'production'`) para evitar custos desnecessários durante desenvolvimento. 