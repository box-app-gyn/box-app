# API de Chat - CERRADØ INTERBOX 2025

## Visão Geral

API modular para chat com IA usando Firebase Functions + Firestore + Auth. Estrutura preparada para migração futura para backend próprio.

## Endpoints

### Base URL
- **Produção**: `https://us-central1-interbox-app-8d400.cloudfunctions.net`
- **Desenvolvimento**: `http://localhost:5001/interbox-app-8d400/us-central1`

### 1. Enviar Mensagem
**POST** `/sendMessageFunction`

Envia uma mensagem para a IA e recebe resposta.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (opcional)
```

**Body:**
```json
{
  "message": "Quando são as inscrições?",
  "context": "cerrado-interbox-2025",
  "sessionId": "session-123", // opcional
  "userId": "user-123" // opcional, usa 'anonymous' se não fornecido
}
```

**Response:**
```json
{
  "success": true,
  "response": "As inscrições ainda não abriram, mas você pode se preparar!...",
  "sessionId": "session-123",
  "messageId": "msg-456",
  "metadata": {
    "model": "gemini-1.5-flash-001",
    "tokens": 150,
    "processingTime": 1200
  }
}
```

### 2. Buscar Histórico
**GET** `/getChatHistoryFunction`

Recupera histórico de mensagens de uma sessão.

**Query Parameters:**
- `sessionId` (obrigatório)
- `userId` (opcional)

**Headers:**
```
Authorization: Bearer <token> (opcional)
```

**Response:**
```json
{
  "history": [
    {
      "id": "msg-123",
      "sessionId": "session-123",
      "userId": "user-123",
      "content": "Quando são as inscrições?",
      "role": "user",
      "timestamp": "2025-01-15T10:30:00Z",
      "metadata": null
    },
    {
      "id": "msg-456",
      "sessionId": "session-123",
      "userId": "ai",
      "content": "As inscrições ainda não abriram...",
      "role": "assistant",
      "timestamp": "2025-01-15T10:30:05Z",
      "metadata": {
        "model": "gemini-1.5-flash-001",
        "tokens": 150
      }
    }
  ]
}
```

### 3. Criar Sessão
**POST** `/createSessionFunction`

Cria uma nova sessão de chat.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (opcional)
```

**Body:**
```json
{
  "context": "cerrado-interbox-2025",
  "userId": "user-123" // opcional
}
```

**Response:**
```json
{
  "session": {
    "id": "session-123",
    "userId": "user-123",
    "context": "cerrado-interbox-2025",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00Z",
    "lastActivity": "2025-01-15T10:30:00Z",
    "messageCount": 0
  }
}
```

### 4. Salvar Feedback
**POST** `/saveFeedbackFunction`

Avalia uma resposta da IA.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token> (opcional)
```

**Body:**
```json
{
  "sessionId": "session-123",
  "messageId": "msg-456",
  "rating": 5,
  "feedback": "Resposta muito útil!",
  "userId": "user-123" // opcional
}
```

**Response:**
```json
{
  "message": "Feedback salvo com sucesso"
}
```

### 5. Polling de Mensagens
**GET** `/pollMessagesFunction`

Busca novas mensagens (para simular tempo real).

**Query Parameters:**
- `sessionId` (obrigatório)
- `userId` (opcional)
- `lastMessageId` (opcional)

**Headers:**
```
Authorization: Bearer <token> (opcional)
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg-789",
      "sessionId": "session-123",
      "userId": "ai",
      "content": "Nova resposta da IA...",
      "role": "assistant",
      "timestamp": "2025-01-15T10:35:00Z"
    }
  ]
}
```

## Estrutura de Dados

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}
```

### ChatSession
```typescript
interface ChatSession {
  id: string;
  userId: string;
  context: string;
  status: 'active' | 'ended';
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}
```

### FeedbackData
```typescript
interface FeedbackData {
  sessionId: string;
  messageId: string;
  userId: string;
  rating: number; // 1-5
  feedback?: string;
}
```

## Autenticação

A API suporta autenticação opcional via Firebase Auth:

1. **Com autenticação**: Envie o token JWT no header `Authorization: Bearer <token>`
2. **Sem autenticação**: Use `userId: 'anonymous'` ou omita o header

## Rate Limiting

- **Mensagens**: 10 por minuto por usuário
- **Sessões**: 5 por hora por usuário
- **Feedback**: 20 por hora por usuário

## Códigos de Erro

- `400`: Dados inválidos
- `401`: Não autorizado
- `405`: Método não permitido
- `429`: Rate limit excedido
- `500`: Erro interno do servidor

## Contexto da IA

A IA é especializada no CERRADØ INTERBOX 2025 com informações sobre:

- **Evento**: 24-26 outubro 2025, Praça Cívica, Goiânia
- **Alcance**: 200km (Goiânia, DF, MG, TO, BA)
- **Formato**: Times de 4 atletas (2H + 2M)
- **Categorias**: Iniciante, Scale, Amador, Master 145+, RX
- **Audiovisual**: Criadores e cobertura do evento

## Migração para Backend Próprio

A estrutura modular permite migração fácil:

1. **Repository**: Substitua `ChatRepository` por implementação com MongoDB/PostgreSQL
2. **Services**: Mantenha `ChatService` e `VertexAIService`
3. **Controllers**: Adapte para Express/Fastify
4. **Middleware**: Reutilize validação e autenticação

### Exemplo de Migração
```typescript
// Firebase Functions
export const sendMessage = functions.https.onRequest(async (req, res) => {
  // ... código atual
});

// Backend Próprio (Express)
app.post('/api/chat/message', async (req, res) => {
  // ... mesmo código, apenas adaptar para Express
});
```

## Desenvolvimento Local

1. **Instalar dependências:**
```bash
cd functions
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
# .env
GOOGLE_CLOUD_PROJECT=interbox-app-8d400
```

3. **Executar emulador:**
```bash
npm run serve
```

4. **Testar endpoints:**
```bash
curl -X POST http://localhost:5001/interbox-app-8d400/us-central1/sendMessageFunction \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!", "userId": "test"}'
```

## Deploy

```bash
cd functions
npm run deploy
```

## Monitoramento

- **Logs**: Firebase Functions Logs
- **Métricas**: Firebase Analytics
- **Performance**: Cloud Monitoring
- **Erros**: Error Reporting 