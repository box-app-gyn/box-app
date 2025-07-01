import { ChatRepository } from '../repositories/ChatRepository';
import { VertexAIService } from './VertexAIService';
import { ChatMessage, ChatSession, ChatResponse, FeedbackData } from '../controllers/ChatController';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private vertexAIService: VertexAIService
  ) {}

  async processMessage({ message, context, userId, sessionId }: {
    message: string;
    context?: string;
    userId: string;
    sessionId?: string;
  }): Promise<ChatResponse> {
    try {
      // Buscar ou criar sessão
      let session = await this.getOrCreateSession(sessionId, userId, context);
      
      // Salvar mensagem do usuário
      await this.chatRepository.saveMessage({
        id: uuidv4(),
        sessionId: session.id,
        userId,
        content: message,
        role: 'user',
        timestamp: new Date()
      });

      // Preparar contexto para IA
      const conversationContext = await this.buildContext(session, message);
      
      // Processar com Vertex AI
      const aiResponse = await this.vertexAIService.generateResponse({
        message,
        context: conversationContext,
        temperature: 0.7,
        maxTokens: 1000
      });

      // Salvar resposta da IA
      const aiMessage = await this.chatRepository.saveMessage({
        id: uuidv4(),
        sessionId: session.id,
        userId: 'ai',
        content: aiResponse.content,
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          model: aiResponse.model,
          tokens: aiResponse.tokens,
          processingTime: aiResponse.processingTime
        }
      });

      // Atualizar sessão
      await this.chatRepository.updateSession(session.id, {
        lastActivity: new Date(),
        messageCount: session.messageCount + 2
      });

      logger.info('Mensagem processada com sucesso', {
        sessionId: session.id,
        userId,
        messageLength: message.length,
        responseLength: aiResponse.content.length,
        processingTime: aiResponse.processingTime
      });

      return {
        success: true,
        response: aiResponse.content,
        sessionId: session.id,
        messageId: aiMessage.id,
        metadata: {
          model: aiResponse.model,
          tokens: aiResponse.tokens,
          processingTime: aiResponse.processingTime
        }
      };

    } catch (error) {
      logger.error('Erro ao processar mensagem:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId: string, userId: string): Promise<ChatMessage[]> {
    try {
      const messages = await this.chatRepository.getMessages(sessionId, userId);
      return messages;
    } catch (error) {
      logger.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  async createSession(userId: string, context?: string): Promise<ChatSession> {
    try {
      const session = await this.chatRepository.createSession({
        id: uuidv4(),
        userId,
        context: context || 'general',
        status: 'active',
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: 0
      });

      logger.info('Sessão criada', { sessionId: session.id, userId, context });
      return session;
    } catch (error) {
      logger.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  async saveFeedback(feedbackData: FeedbackData): Promise<void> {
    try {
      await this.chatRepository.saveFeedback(feedbackData);
      logger.info('Feedback salvo', feedbackData);
    } catch (error) {
      logger.error('Erro ao salvar feedback:', error);
      throw error;
    }
  }

  async pollNewMessages(sessionId: string, userId: string, lastMessageId?: string): Promise<ChatMessage[]> {
    try {
      const newMessages = await this.chatRepository.getNewMessages(sessionId, userId, lastMessageId);
      return newMessages;
    } catch (error) {
      logger.error('Erro no polling:', error);
      throw error;
    }
  }

  async endSession(sessionId: string, userId: string): Promise<void> {
    try {
      await this.chatRepository.updateSession(sessionId, {
        status: 'ended',
        lastActivity: new Date()
      });
      logger.info('Sessão encerrada', { sessionId, userId });
    } catch (error) {
      logger.error('Erro ao encerrar sessão:', error);
      throw error;
    }
  }

  private async getOrCreateSession(sessionId: string | undefined, userId: string, context?: string): Promise<ChatSession> {
    if (sessionId) {
      const session = await this.chatRepository.getSession(sessionId, userId);
      if (session) {
        return session;
      }
    }

    return await this.createSession(userId, context);
  }

  private async buildContext(session: ChatSession, currentMessage: string) {
    // Buscar últimas mensagens da conversa
    const recentMessages = await this.chatRepository.getMessages(session.id, session.userId, 10);

    // Construir contexto do CERRADØ INTERBOX
    const baseContext = `
      Você é o assistente virtual do CERRADØ INTERBOX 2025, o maior evento de times da América Latina.
      
      Informações do evento:
      - Data: 24, 25 e 26 de outubro de 2025
      - Local: Praça Cívica, Goiânia - GO
      - Alcance: Raio de 200km (Goiânia, DF, MG, TO, BA)
      - Formato: Competição de times (4 atletas por time)
      - Categorias: Iniciante, Scale, Amador, Master 145+, Rx
      
      Você pode ajudar com:
      - Informações sobre inscrições e times
      - Dúvidas sobre o evento e localização
      - Informações sobre audiovisual e creators
      - Suporte geral sobre o CERRADØ INTERBOX
      
      Sempre seja cordial, informativo e mantenha o tom da marca.
    `;

    // Histórico da conversa
    const conversationHistory = recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    return {
      baseContext,
      conversationHistory,
      currentMessage,
      sessionContext: session.context
    };
  }
} 