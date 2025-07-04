import admin from 'firebase-admin';
import { ChatMessage, ChatSession, FeedbackData } from '../controllers/ChatController';
import { logger } from '../utils/logger';

export class ChatRepository {
  private db: admin.firestore.Firestore;
  private chatMessagesCollection = 'chat_messages';
  private chatSessionsCollection = 'chat_sessions';
  private feedbackCollection = 'chat_feedback';

  constructor() {
    // Inicializar Firebase Admin se não estiver inicializado
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    this.db = admin.firestore();
  }

  // Métodos para mensagens
  async saveMessage(message: ChatMessage): Promise<ChatMessage> {
    try {
      const docRef = this.db.collection(this.chatMessagesCollection).doc(message.id);
      
      const messageData: any = {
        id: message.id,
        sessionId: message.sessionId,
        userId: message.userId,
        content: message.content,
        role: message.role,
        timestamp: new Date()
      };
      
      // Só adicionar metadata se não for undefined
      if (message.metadata !== undefined) {
        messageData.metadata = message.metadata;
      }
      
      await docRef.set(messageData);

      logger.info('Mensagem salva', { messageId: message.id, sessionId: message.sessionId });
      return message;
    } catch (error) {
      logger.error('Erro ao salvar mensagem:', error);
      throw error;
    }
  }

  async getMessages(sessionId: string, userId: string, limit?: number): Promise<ChatMessage[]> {
    try {
      let query = this.db.collection(this.chatMessagesCollection)
        .where('sessionId', '==', sessionId);

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const messages: ChatMessage[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          sessionId: data.sessionId,
          userId: data.userId,
          content: data.content,
          role: data.role,
          timestamp: data.timestamp ? new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp) : new Date(),
          metadata: data.metadata
        });
      });

      // Ordenar por timestamp no JavaScript
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      logger.info('Mensagens recuperadas', { sessionId, count: messages.length });
      return messages;
    } catch (error) {
      logger.error('Erro ao buscar mensagens:', error);
      throw error;
    }
  }

  async getNewMessages(sessionId: string, userId: string, lastMessageId?: string): Promise<ChatMessage[]> {
    try {
      let query = this.db.collection(this.chatMessagesCollection)
        .where('sessionId', '==', sessionId)
        .limit(10);

      const snapshot = await query.get();
      const messages: ChatMessage[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          sessionId: data.sessionId,
          userId: data.userId,
          content: data.content,
          role: data.role,
          timestamp: data.timestamp ? new Date(data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp) : new Date(),
          metadata: data.metadata
        });
      });

      // Filtrar mensagens mais recentes que lastMessageId
      let filteredMessages = messages;
      if (lastMessageId) {
        const lastMessageIndex = messages.findIndex(msg => msg.id === lastMessageId);
        if (lastMessageIndex !== -1) {
          filteredMessages = messages.slice(lastMessageIndex + 1);
        }
      }

      // Ordenar por timestamp crescente
      filteredMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      logger.info('Novas mensagens encontradas', { sessionId, count: filteredMessages.length });
      return filteredMessages;
    } catch (error) {
      logger.error('Erro ao buscar novas mensagens:', error);
      throw error;
    }
  }

  // Métodos para sessões
  async createSession(session: ChatSession): Promise<ChatSession> {
    try {
      const docRef = this.db.collection(this.chatSessionsCollection).doc(session.id);
      
      // Versão simplificada para emulador
      const sessionData = {
        id: session.id,
        userId: session.userId,
        context: session.context,
        status: session.status,
        createdAt: new Date(),
        lastActivity: new Date(),
        messageCount: session.messageCount
      };
      
      await docRef.set(sessionData);

      logger.info('Sessão criada', { sessionId: session.id, userId: session.userId });
      return session;
    } catch (error) {
      logger.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    try {
      const doc = await this.db.collection(this.chatSessionsCollection).doc(sessionId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data()!;
      
      // Verificar se o usuário tem acesso à sessão
      if (data.userId !== userId) {
        logger.warn('Tentativa de acesso não autorizado à sessão', { sessionId, userId, ownerId: data.userId });
        return null;
      }

      const session: ChatSession = {
        id: doc.id,
        userId: data.userId,
        context: data.context,
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity),
        messageCount: data.messageCount
      };

      logger.info('Sessão recuperada', { sessionId, userId });
      return session;
    } catch (error) {
      logger.error('Erro ao buscar sessão:', error);
      throw error;
    }
  }

  async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<void> {
    try {
      const updateData: any = { ...updates };
      
      if (updates.lastActivity) {
        updateData.lastActivity = updates.lastActivity;
      }

      await this.db.collection(this.chatSessionsCollection).doc(sessionId).update(updateData);
      
      logger.info('Sessão atualizada', { sessionId, updates: Object.keys(updates) });
    } catch (error) {
      logger.error('Erro ao atualizar sessão:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      const snapshot = await this.db.collection(this.chatSessionsCollection)
        .where('userId', '==', userId)
        .orderBy('lastActivity', 'desc')
        .limit(20)
        .get();

      const sessions: ChatSession[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          userId: data.userId,
          context: data.context,
          status: data.status,
                  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        lastActivity: data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity),
          messageCount: data.messageCount
        });
      });

      logger.info('Sessões do usuário recuperadas', { userId, count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('Erro ao buscar sessões do usuário:', error);
      throw error;
    }
  }

  // Métodos para feedback
  async saveFeedback(feedbackData: FeedbackData): Promise<void> {
    try {
      const docRef = this.db.collection(this.feedbackCollection).doc();
      
      const feedbackDoc: any = {
        sessionId: feedbackData.sessionId,
        messageId: feedbackData.messageId,
        userId: feedbackData.userId,
        rating: feedbackData.rating,
        createdAt: new Date()
      };
      
      // Só adicionar feedback se não for undefined
      if (feedbackData.feedback !== undefined) {
        feedbackDoc.feedback = feedbackData.feedback;
      }
      
      await docRef.set(feedbackDoc);

      logger.info('Feedback salvo', { 
        sessionId: feedbackData.sessionId, 
        messageId: feedbackData.messageId,
        rating: feedbackData.rating 
      });
    } catch (error) {
      logger.error('Erro ao salvar feedback:', error);
      throw error;
    }
  }

  async getFeedbackStats(sessionId?: string): Promise<any> {
    try {
      let query = this.db.collection(this.feedbackCollection) as any;
      
      if (sessionId) {
        query = query.where('sessionId', '==', sessionId);
      }

      const snapshot = await query.get();
      const feedbacks = snapshot.docs.map((doc: any) => doc.data());

      const stats = {
        total: feedbacks.length,
        averageRating: 0,
        ratings: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      };

      if (feedbacks.length > 0) {
        const totalRating = feedbacks.reduce((sum: number, feedback: any) => sum + feedback.rating, 0);
        stats.averageRating = totalRating / feedbacks.length;

        feedbacks.forEach((feedback: any) => {
          const rating = feedback.rating as keyof typeof stats.ratings;
          stats.ratings[rating]++;
        });
      }

      logger.info('Estatísticas de feedback calculadas', stats);
      return stats;
    } catch (error) {
      logger.error('Erro ao calcular estatísticas de feedback:', error);
      throw error;
    }
  }

  // Métodos de limpeza
  async cleanupOldSessions(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const snapshot = await this.db.collection(this.chatSessionsCollection)
        .where('lastActivity', '<', cutoffDate)
        .where('status', '==', 'ended')
        .get();

      const batch = this.db.batch();
      let deletedCount = 0;

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      await batch.commit();

      logger.info('Sessões antigas removidas', { deletedCount, daysOld });
      return deletedCount;
    } catch (error) {
      logger.error('Erro ao limpar sessões antigas:', error);
      throw error;
    }
  }
} 