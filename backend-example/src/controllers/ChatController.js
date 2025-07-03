const { VertexAIService } = require('../services/VertexAIService');
const { ChatSession } = require('../models/ChatSession');
const { ChatMessage } = require('../models/ChatMessage');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  constructor() {
    this.vertexAI = new VertexAIService();
    this.sessions = new Map(); // Cache de sessões ativas
  }

  async processMessage({ message, context, userId, sessionId }) {
    try {
      // Buscar ou criar sessão
      let session = await this.getOrCreateSession(sessionId, userId, context);
      
      // Salvar mensagem do usuário
      const userMessage = await ChatMessage.create({
        sessionId: session.id,
        userId,
        content: message,
        role: 'user',
        timestamp: new Date()
      });

      // Preparar contexto para IA
      const conversationContext = await this.buildContext(session, message);
      
      // Processar com Vertex AI
      const aiResponse = await this.vertexAI.generateResponse({
        message,
        context: conversationContext,
        temperature: 0.7,
        maxTokens: 1000
      });

      // Salvar resposta da IA
      const aiMessage = await ChatMessage.create({
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
      await session.update({
        lastActivity: new Date(),
        messageCount: session.messageCount + 2
      });

      // Log da interação
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

  async processMessageStream({ message, context, userId, sessionId, onChunk, onComplete, onError }) {
    try {
      // Buscar ou criar sessão
      let session = await this.getOrCreateSession(sessionId, userId, context);
      
      // Salvar mensagem do usuário
      const userMessage = await ChatMessage.create({
        sessionId: session.id,
        userId,
        content: message,
        role: 'user',
        timestamp: new Date()
      });

      // Preparar contexto
      const conversationContext = await this.buildContext(session, message);
      
      let fullResponse = '';
      let messageId = null;

      // Processar com streaming
      await this.vertexAI.generateResponseStream({
        message,
        context: conversationContext,
        temperature: 0.7,
        maxTokens: 1000,
        onChunk: (chunk) => {
          fullResponse += chunk;
          onChunk(chunk);
        },
        onComplete: async (metadata) => {
          // Salvar resposta completa
          const aiMessage = await ChatMessage.create({
            sessionId: session.id,
            userId: 'ai',
            content: fullResponse,
            role: 'assistant',
            timestamp: new Date(),
            metadata: {
              model: metadata.model,
              tokens: metadata.tokens,
              processingTime: metadata.processingTime
            }
          });

          messageId = aiMessage.id;

          // Atualizar sessão
          await session.update({
            lastActivity: new Date(),
            messageCount: session.messageCount + 2
          });

          onComplete({
            content: fullResponse,
            messageId: aiMessage.id,
            metadata
          });
        },
        onError: (error) => {
          logger.error('Erro no streaming:', error);
          onError(error);
        }
      });

    } catch (error) {
      logger.error('Erro no processamento streaming:', error);
      onError(error);
    }
  }

  async getOrCreateSession(sessionId, userId, context) {
    if (sessionId) {
      // Buscar sessão existente
      const session = await ChatSession.findOne({
        where: { id: sessionId, userId }
      });
      
      if (session) {
        return session;
      }
    }

    // Criar nova sessão
    const newSession = await ChatSession.create({
      id: uuidv4(),
      userId,
      context: context || 'general',
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0
    });

    logger.info('Nova sessão criada', {
      sessionId: newSession.id,
      userId,
      context
    });

    return newSession;
  }

  async buildContext(session, currentMessage) {
    // Buscar últimas mensagens da conversa
    const recentMessages = await ChatMessage.findAll({
      where: { sessionId: session.id },
      order: [['timestamp', 'ASC']],
      limit: 10 // Últimas 10 mensagens
    });

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

  async getChatHistory(sessionId, userId) {
    const messages = await ChatMessage.findAll({
      where: { sessionId, userId },
      order: [['timestamp', 'ASC']],
      include: [{
        model: ChatSession,
        where: { userId }
      }]
    });

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      metadata: msg.metadata
    }));
  }

  async createSession(userId, context) {
    const session = await ChatSession.create({
      id: uuidv4(),
      userId,
      context: context || 'general',
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0
    });

    logger.info('Sessão criada manualmente', {
      sessionId: session.id,
      userId,
      context
    });

    return session;
  }

  async endSession(sessionId, userId) {
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId }
    });

    if (session) {
      await session.update({
        status: 'ended',
        endedAt: new Date()
      });

      logger.info('Sessão encerrada', {
        sessionId,
        userId,
        messageCount: session.messageCount
      });
    }
  }

  async saveFeedback({ sessionId, messageId, userId, rating, feedback }) {
    // Implementar salvamento de feedback
    logger.info('Feedback recebido', {
      sessionId,
      messageId,
      userId,
      rating,
      feedback
    });

    // Aqui você pode salvar em uma tabela de feedback
    // ou enviar para análise
  }
}

module.exports = { ChatController }; 