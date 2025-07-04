import { onRequest } from 'firebase-functions/v2/https';
import { ChatRepository } from './repositories/ChatRepository';
import { ChatService } from './services/ChatService';

// Instâncias dos serviços
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);

// POST /api/chat/message - Enviar mensagem para IA
export const sendMessageFunction = onRequest(async (req, res) => {
  try {
    const { sessionId, message, userId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Mensagem é obrigatória' });
      return;
    }

    const result = await chatService.sendMessage(sessionId, message, userId);
    res.json(result);

  } catch (error) {
    console.error('Erro na função sendMessage:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}); 