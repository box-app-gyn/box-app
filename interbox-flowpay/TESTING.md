# 🧪 Guia de Testes - Backend Interbox FlowPay

## 🚀 Início Rápido

### 1. Iniciar Emulador Local

```bash
cd interbox-flowpay
npm run dev:local
```

### 2. Executar Testes Automáticos

```bash
# Em nova aba/terminal
npm run test:local
```

## 📋 Endpoints Disponíveis

### 🔍 Endpoints de Informação

- `GET /health` - Status do sistema
- `GET /info` - Informações do backend
- `GET /test/data` - Listar dados de teste

### 💳 Endpoints de Pagamento

- `POST /flowpay/webhook` - Webhook principal
- `POST /test/charge` - Criar cobrança de teste
- `GET /test/status/:id` - Verificar status de cobrança

### 🧪 Endpoints de Teste

- `POST /test/webhook-simulate` - Simular webhook
- `DELETE /test/cleanup` - Limpar dados de teste

## 🛠️ Testes Manuais

### 1. Health Check

```bash
curl http://localhost:5001/interbox-app-8d400/us-central1/api/health
```

### 2. Criar Cobrança

```bash
curl -X POST http://localhost:5001/interbox-app-8d400/us-central1/api/test/charge \
  -H "Content-Type: application/json" \
  -d '{
    "correlationID": "test-team-123",
    "value": 2990,
    "comment": "Teste de cobrança"
  }'
```

### 3. Simular Webhook

```bash
curl -X POST http://localhost:5001/interbox-app-8d400/us-central1/api/test/webhook-simulate \
  -H "Content-Type: application/json" \
  -d '{
    "correlationID": "test-team-123",
    "status": "COMPLETED"
  }'
```

### 4. Verificar Dados

```bash
curl http://localhost:5001/interbox-app-8d400/us-central1/api/test/data
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente (opcional)

```bash
export OPENPIX_API_KEY="sua_chave_aqui"
export OPENPIX_BASE_URL="https://api.openpix.com.br"
export NODE_ENV="development"
```

### URLs de Teste

- **Local:** `http://localhost:5001/interbox-app-8d400/us-central1/api`
- **Produção:** `https://us-central1-interbox-app-8d400.cloudfunctions.net/api`

## 📊 Monitoramento

### Logs do Emulador

```bash
firebase emulators:start --only functions --debug
```

### Logs de Produção

```bash
firebase functions:log --only api
```

## 🎯 Cenários de Teste

### 1. Pagamento de Time

1. Criar cobrança para time
2. Simular webhook de pagamento
3. Verificar atualização no Firestore

### 2. Pagamento Audiovisual

1. Criar cobrança para audiovisual
2. Simular webhook de pagamento
3. Verificar atualização no Firestore

### 3. Teste de Erro

1. Enviar payload inválido
2. Verificar tratamento de erro
3. Verificar logs

## 🔒 Segurança

### CORS Liberado
- ✅ Todas as origens permitidas
- ✅ Todos os métodos HTTP
- ✅ Headers customizados

### Autenticação
- ❌ Sem autenticação (apenas para testes)
- ⚠️ **NÃO usar em produção**

## 🚨 Limpeza

### Limpar Dados de Teste
```bash
curl -X DELETE http://localhost:5001/interbox-app-8d400/us-central1/api/test/cleanup \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "teams",
    "id": "test-team-123"
  }'
```

## 📝 Notas

- Todos os endpoints retornam JSON
- Logs detalhados no console
- CORS liberado para desenvolvimento
- Webhooks simulados para testes
- Dados de teste isolados

## 🆘 Troubleshooting

### Erro de Conexão
```bash
# Verificar se emulador está rodando
firebase emulators:start --only functions
```

### Erro de Build
```bash
# Limpar e rebuildar
npm run build
```

### Erro de Deploy
```bash
# Verificar configuração
firebase use interbox-app-8d400
firebase deploy --only functions
``` 