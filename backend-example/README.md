# CERRADØ AI Backend

Backend para IA de atendimento do CERRADØ INTERBOX 2025.

## 🚀 Features

- **Chat com Vertex AI** - Integração com Google Vertex AI
- **Streaming de respostas** - Respostas em tempo real
- **Sessões persistentes** - Histórico de conversas
- **Rate limiting** - Proteção contra spam
- **WebSocket** - Chat em tempo real
- **Analytics** - Métricas de uso
- **Logs detalhados** - Monitoramento completo

## 📋 Pré-requisitos

- Node.js 18+
- MongoDB Atlas (gratuito)
- Google Cloud Project com Vertex AI habilitado
- Service Account Key do Google Cloud

## 🛠️ Setup

### 1. Clone e instale dependências
```bash
cd backend-example
npm install
```

### 2. Configure as variáveis de ambiente
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configure o Google Cloud
```bash
# Baixe sua service account key
# Coloque em ./vertex-ai-sa-key.json
```

### 4. Configure o MongoDB
- Crie uma conta no MongoDB Atlas
- Crie um cluster gratuito
- Copie a URI de conexão
- Adicione no .env

### 5. Teste a conexão
```bash
npm run dev
# Acesse http://localhost:3001/health
```

## 🚀 Deploy

### Railway (Recomendado)
```bash
# Instale Railway CLI
npm i -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

### Render
```bash
# Conecte seu repositório no Render
# Configure as variáveis de ambiente
# Deploy automático
```

### Vercel
```bash
# Instale Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📡 APIs

### Chat
- `POST /api/chat/message` - Enviar mensagem
- `POST /api/chat/stream` - Chat com streaming
- `GET /api/chat/history/:sessionId` - Histórico
- `POST /api/chat/session` - Criar sessão
- `DELETE /api/chat/session/:sessionId` - Encerrar sessão
- `POST /api/chat/feedback` - Avaliar resposta

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Perfil do usuário

### Analytics
- `GET /api/analytics/usage` - Métricas de uso
- `GET /api/analytics/sessions` - Sessões ativas

## 🔧 Configuração

### Vertex AI
```javascript
// Configurar modelo
const model = 'gemini-1.5-flash-001';
const temperature = 0.7;
const maxTokens = 1000;
```

### Rate Limiting
```javascript
// Limites por IP
const windowMs = 15 * 60 * 1000; // 15 minutos
const maxRequests = 100; // 100 requests por janela
```

### Logging
```javascript
// Níveis de log
LOG_LEVEL=info // debug, info, warn, error
```

## 📊 Monitoramento

### Health Check
```bash
curl https://your-backend.railway.app/health
```

### Logs
```bash
# Railway
railway logs

# Render
# Disponível no dashboard
```

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **CORS** - Configurado para domínio específico
- **Rate Limiting** - Proteção contra spam
- **JWT** - Autenticação segura
- **Input Validation** - Validação de dados

## 🧪 Testes

```bash
npm test
```

## 📈 Performance

- **Caching** - Sessões em memória
- **Connection Pooling** - MongoDB otimizado
- **Streaming** - Respostas em tempo real
- **Compression** - Gzip habilitado

## 🔄 Integração com Frontend

```javascript
// Exemplo de uso no frontend
const response = await fetch('https://your-backend.railway.app/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Olá, como faço para me inscrever?',
    sessionId: 'session-123'
  })
});

const data = await response.json();
console.log(data.response);
```

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte os logs do servidor
- Verifique a documentação da API

## 📄 Licença

MIT License 