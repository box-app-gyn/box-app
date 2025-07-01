import { ChatService } from '../services/ChatService';
import { logger } from '../utils/logger';

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  context: string;
  status: 'active' | 'ended';
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  messageId: string;
  metadata?: any;
}

export interface FeedbackData {
  sessionId: string;
  messageId: string;
  userId: string;
  rating: number;
  feedback?: string;
}

export class ChatController {
  constructor(private chatService: ChatService) {}

  async processMessage({ message, context, userId, sessionId }: {
    message: string;
    context?: string;
    userId: string;
    sessionId?: string;
  }): Promise<ChatResponse> {
    try {
      logger.info('Processando mensagem', { userId, sessionId, messageLength: message.length });

      const response = await this.chatService.processMessage({
        message,
        context,
        userId,
        sessionId
      });

      logger.info('Mensagem processada com sucesso', {
        sessionId: response.sessionId,
        messageId: response.messageId
      });

      return response;

    } catch (error) {
      logger.error('Erro no controller ao processar mensagem:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string, userId: string): Promise<ChatMessage[]> {
    try {
      logger.info('Buscando histórico', { sessionId, userId });

      const history = await this.chatService.getChatHistory(sessionId, userId);

      logger.info('Histórico recuperado', {
        sessionId,
        messageCount: history.length
      });

      return history;

    } catch (error) {
      logger.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  async createSession(userId: string, context?: string): Promise<ChatSession> {
    try {
      logger.info('Criando nova sessão', { userId, context });

      const session = await this.chatService.createSession(userId, context);

      logger.info('Sessão criada', { sessionId: session.id, userId });

      return session;

    } catch (error) {
      logger.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  async saveFeedback(feedbackData: FeedbackData): Promise<void> {
    try {
      logger.info('Salvando feedback', {
        sessionId: feedbackData.sessionId,
        messageId: feedbackData.messageId,
        rating: feedbackData.rating
      });

      await this.chatService.saveFeedback(feedbackData);

      logger.info('Feedback salvo com sucesso');

    } catch (error) {
      logger.error('Erro ao salvar feedback:', error);
      throw error;
    }
  }

  async pollNewMessages(sessionId: string, userId: string, lastMessageId?: string): Promise<ChatMessage[]> {
    try {
      logger.info('Polling mensagens', { sessionId, userId, lastMessageId });

      const newMessages = await this.chatService.pollNewMessages(sessionId, userId, lastMessageId);

      logger.info('Novas mensagens encontradas', {
        sessionId,
        count: newMessages.length
      });

      return newMessages;

    } catch (error) {
      logger.error('Erro no polling:', error);
      throw error;
    }
  }

  async endSession(sessionId: string, userId: string): Promise<void> {
    try {
      logger.info('Encerrando sessão', { sessionId, userId });

      await this.chatService.endSession(sessionId, userId);

      logger.info('Sessão encerrada', { sessionId });

    } catch (error) {
      logger.error('Erro ao encerrar sessão:', error);
      throw error;
    }
  }
} 