"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const admin = __importStar(require("firebase-admin"));
const logger_1 = require("../utils/logger");
class ChatRepository {
    constructor() {
        this.chatMessagesCollection = 'chat_messages';
        this.chatSessionsCollection = 'chat_sessions';
        this.feedbackCollection = 'chat_feedback';
        // Inicializar Firebase Admin se não estiver inicializado
        if (!admin.apps.length) {
            admin.initializeApp();
        }
        this.db = admin.firestore();
    }
    // Métodos para mensagens
    async saveMessage(message) {
        try {
            const docRef = this.db.collection(this.chatMessagesCollection).doc(message.id);
            const messageData = {
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
            logger_1.logger.info('Mensagem salva', { messageId: message.id, sessionId: message.sessionId });
            return message;
        }
        catch (error) {
            logger_1.logger.error('Erro ao salvar mensagem:', error);
            throw error;
        }
    }
    async getMessages(sessionId, userId, limit) {
        try {
            let query = this.db.collection(this.chatMessagesCollection)
                .where('sessionId', '==', sessionId);
            if (limit) {
                query = query.limit(limit);
            }
            const snapshot = await query.get();
            const messages = [];
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
            logger_1.logger.info('Mensagens recuperadas', { sessionId, count: messages.length });
            return messages;
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar mensagens:', error);
            throw error;
        }
    }
    async getNewMessages(sessionId, userId, lastMessageId) {
        try {
            let query = this.db.collection(this.chatMessagesCollection)
                .where('sessionId', '==', sessionId)
                .limit(10);
            const snapshot = await query.get();
            const messages = [];
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
            logger_1.logger.info('Novas mensagens encontradas', { sessionId, count: filteredMessages.length });
            return filteredMessages;
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar novas mensagens:', error);
            throw error;
        }
    }
    // Métodos para sessões
    async createSession(session) {
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
            logger_1.logger.info('Sessão criada', { sessionId: session.id, userId: session.userId });
            return session;
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar sessão:', error);
            throw error;
        }
    }
    async getSession(sessionId, userId) {
        var _a, _b;
        try {
            const doc = await this.db.collection(this.chatSessionsCollection).doc(sessionId).get();
            if (!doc.exists) {
                return null;
            }
            const data = doc.data();
            // Verificar se o usuário tem acesso à sessão
            if (data.userId !== userId) {
                logger_1.logger.warn('Tentativa de acesso não autorizado à sessão', { sessionId, userId, ownerId: data.userId });
                return null;
            }
            const session = {
                id: doc.id,
                userId: data.userId,
                context: data.context,
                status: data.status,
                createdAt: ((_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? data.createdAt.toDate() : new Date(data.createdAt),
                lastActivity: ((_b = data.lastActivity) === null || _b === void 0 ? void 0 : _b.toDate) ? data.lastActivity.toDate() : new Date(data.lastActivity),
                messageCount: data.messageCount
            };
            logger_1.logger.info('Sessão recuperada', { sessionId, userId });
            return session;
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar sessão:', error);
            throw error;
        }
    }
    async updateSession(sessionId, updates) {
        try {
            const updateData = Object.assign({}, updates);
            if (updates.lastActivity) {
                updateData.lastActivity = updates.lastActivity;
            }
            await this.db.collection(this.chatSessionsCollection).doc(sessionId).update(updateData);
            logger_1.logger.info('Sessão atualizada', { sessionId, updates: Object.keys(updates) });
        }
        catch (error) {
            logger_1.logger.error('Erro ao atualizar sessão:', error);
            throw error;
        }
    }
    async getUserSessions(userId) {
        try {
            const snapshot = await this.db.collection(this.chatSessionsCollection)
                .where('userId', '==', userId)
                .orderBy('lastActivity', 'desc')
                .limit(20)
                .get();
            const sessions = [];
            snapshot.forEach(doc => {
                var _a, _b;
                const data = doc.data();
                sessions.push({
                    id: doc.id,
                    userId: data.userId,
                    context: data.context,
                    status: data.status,
                    createdAt: ((_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) ? data.createdAt.toDate() : new Date(data.createdAt),
                    lastActivity: ((_b = data.lastActivity) === null || _b === void 0 ? void 0 : _b.toDate) ? data.lastActivity.toDate() : new Date(data.lastActivity),
                    messageCount: data.messageCount
                });
            });
            logger_1.logger.info('Sessões do usuário recuperadas', { userId, count: sessions.length });
            return sessions;
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar sessões do usuário:', error);
            throw error;
        }
    }
    // Métodos para feedback
    async saveFeedback(feedbackData) {
        try {
            const docRef = this.db.collection(this.feedbackCollection).doc();
            const feedbackDoc = {
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
            logger_1.logger.info('Feedback salvo', {
                sessionId: feedbackData.sessionId,
                messageId: feedbackData.messageId,
                rating: feedbackData.rating
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao salvar feedback:', error);
            throw error;
        }
    }
    async getFeedbackStats(sessionId) {
        try {
            let query = this.db.collection(this.feedbackCollection);
            if (sessionId) {
                query = query.where('sessionId', '==', sessionId);
            }
            const snapshot = await query.get();
            const feedbacks = snapshot.docs.map((doc) => doc.data());
            const stats = {
                total: feedbacks.length,
                averageRating: 0,
                ratings: {
                    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                }
            };
            if (feedbacks.length > 0) {
                const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
                stats.averageRating = totalRating / feedbacks.length;
                feedbacks.forEach((feedback) => {
                    const rating = feedback.rating;
                    stats.ratings[rating]++;
                });
            }
            logger_1.logger.info('Estatísticas de feedback calculadas', stats);
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Erro ao calcular estatísticas de feedback:', error);
            throw error;
        }
    }
    // Métodos de limpeza
    async cleanupOldSessions(daysOld = 30) {
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
            logger_1.logger.info('Sessões antigas removidas', { deletedCount, daysOld });
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Erro ao limpar sessões antigas:', error);
            throw error;
        }
    }
}
exports.ChatRepository = ChatRepository;
//# sourceMappingURL=ChatRepository.js.map