"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const logger_1 = require("../utils/logger");
class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async processMessage({ message, context, userId, sessionId }) {
        try {
            logger_1.logger.info('Processando mensagem', { userId, sessionId, messageLength: message.length });
            const response = await this.chatService.processMessage({
                message,
                context,
                userId,
                sessionId
            });
            logger_1.logger.info('Mensagem processada com sucesso', {
                sessionId: response.sessionId,
                messageId: response.messageId
            });
            return response;
        }
        catch (error) {
            logger_1.logger.error('Erro no controller ao processar mensagem:', error);
            throw error;
        }
    }
    async getChatHistory(sessionId, userId) {
        try {
            logger_1.logger.info('Buscando histórico', { sessionId, userId });
            const history = await this.chatService.getChatHistory(sessionId, userId);
            logger_1.logger.info('Histórico recuperado', {
                sessionId,
                messageCount: history.length
            });
            return history;
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar histórico:', error);
            throw error;
        }
    }
    async createSession(userId, context) {
        try {
            logger_1.logger.info('Criando nova sessão', { userId, context });
            const session = await this.chatService.createSession(userId, context);
            logger_1.logger.info('Sessão criada', { sessionId: session.id, userId });
            return session;
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar sessão:', error);
            throw error;
        }
    }
    async saveFeedback(feedbackData) {
        try {
            logger_1.logger.info('Salvando feedback', {
                sessionId: feedbackData.sessionId,
                messageId: feedbackData.messageId,
                rating: feedbackData.rating
            });
            await this.chatService.saveFeedback(feedbackData);
            logger_1.logger.info('Feedback salvo com sucesso');
        }
        catch (error) {
            logger_1.logger.error('Erro ao salvar feedback:', error);
            throw error;
        }
    }
    async pollNewMessages(sessionId, userId, lastMessageId) {
        try {
            logger_1.logger.info('Polling mensagens', { sessionId, userId, lastMessageId });
            const newMessages = await this.chatService.pollNewMessages(sessionId, userId, lastMessageId);
            logger_1.logger.info('Novas mensagens encontradas', {
                sessionId,
                count: newMessages.length
            });
            return newMessages;
        }
        catch (error) {
            logger_1.logger.error('Erro no polling:', error);
            throw error;
        }
    }
    async endSession(sessionId, userId) {
        try {
            logger_1.logger.info('Encerrando sessão', { sessionId, userId });
            await this.chatService.endSession(sessionId, userId);
            logger_1.logger.info('Sessão encerrada', { sessionId });
        }
        catch (error) {
            logger_1.logger.error('Erro ao encerrar sessão:', error);
            throw error;
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=ChatController.js.map