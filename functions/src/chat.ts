import * as functions from 'firebase-functions';
import { ChatService } from './services/ChatService';
import { ChatController } from './controllers/ChatController';
import { ChatRepository } from './repositories/ChatRepository';
import { VertexAIService } from './services/VertexAIService';
import { validateChatRequest } from './middleware/validation';
import { authenticateUser } from './middleware/auth';
import { logger } from './utils/logger';

// Instâncias dos serviços (modular para fácil migração)
const chatRepository = new ChatRepository();
const vertexAIService = new VertexAIService();
const chatService = new ChatService(chatRepository, vertexAIService);
const chatController = new ChatController(chatService);

// POST /api/chat/message - Enviar mensagem para IA
export const sendMessage = functions.https.onRequest(async (req, res) => {
  try {
    // Configurar CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    // Validar requisição
    const validation = validateChatRequest(req.body);
    if (!validation.isValid) {
      res.status(400).json({ error: 'Dados inválidos', details: validation.errors });
      return;
    }

    // Autenticar usuário (opcional para chat público)
    const user = await authenticateUser(req);
    const userId = user?.uid || req.body.userId || 'anonymous';

    const { message, context, sessionId } = req.body;

    logger.info('Nova mensagem recebida', {
      userId,
      sessionId,
      messageLength: message.length
    });

    // Processar mensagem
    const response = await chatController.processMessage({
      message,
      context,
      userId,
      sessionId
    });

    res.json(response);

  } catch (error) {
    logger.error('Erro ao processar mensagem:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/chat/history/:sessionId - Histórico de conversa
export const getChatHistory = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { sessionId } = req.params;
    const user = await authenticateUser(req);
    const userId = user?.uid || (req.query.userId as string) || 'anonymous';

    const history = await chatController.getChatHistory(sessionId, userId);
    res.json({ history });

  } catch (error) {
    logger.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/chat/feedback - Avaliar resposta da IA
export const saveFeedback = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { sessionId, messageId, rating, feedback } = req.body;
    const user = await authenticateUser(req);
    const userId = user?.uid || req.body.userId || 'anonymous';

    await chatController.saveFeedback({
      sessionId,
      messageId,
      userId,
      rating,
      feedback
    });

    res.json({ message: 'Feedback salvo com sucesso' });

  } catch (error) {
    logger.error('Erro ao salvar feedback:', error);
    res.status(500).json({
      error: 'Erro ao salvar feedback',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// POST /api/chat/session - Criar nova sessão
export const createSession = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { context } = req.body;
    const user = await authenticateUser(req);
    const userId = user?.uid || req.body.userId || 'anonymous';

    const session = await chatController.createSession(userId, context);
    res.json({ session });

  } catch (error) {
    logger.error('Erro ao criar sessão:', error);
    res.status(500).json({
      error: 'Erro ao criar sessão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// GET /api/chat/poll/:sessionId - Polling para novas mensagens
export const pollMessages = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }

    const { sessionId } = req.params;
    const { lastMessageId } = req.query;
    const user = await authenticateUser(req);
    const userId = user?.uid || (req.query.userId as string) || 'anonymous';

    const newMessages = await chatController.pollNewMessages(
      sessionId, 
      userId, 
      lastMessageId as string
    );

    res.json({ messages: newMessages });

  } catch (error) {
    logger.error('Erro no polling:', error);
    res.status(500).json({
      error: 'Erro no polling',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}); 