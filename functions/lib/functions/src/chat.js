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
exports.pollMessages = exports.createSession = exports.saveFeedback = exports.getChatHistory = exports.sendMessage = void 0;
const functions = __importStar(require("firebase-functions"));
const ChatService_1 = require("./services/ChatService");
const ChatController_1 = require("./controllers/ChatController");
const ChatRepository_1 = require("./repositories/ChatRepository");
const VertexAIService_1 = require("./services/VertexAIService");
const validation_1 = require("./middleware/validation");
const auth_1 = require("./middleware/auth");
const logger_1 = require("./utils/logger");
// Instâncias dos serviços (modular para fácil migração)
const chatRepository = new ChatRepository_1.ChatRepository();
const vertexAIService = new VertexAIService_1.VertexAIService();
const chatService = new ChatService_1.ChatService(chatRepository, vertexAIService);
const chatController = new ChatController_1.ChatController(chatService);
// POST /api/chat/message - Enviar mensagem para IA
exports.sendMessage = functions.https.onRequest(async (req, res) => {
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
        const validation = (0, validation_1.validateChatRequest)(req.body);
        if (!validation.isValid) {
            res.status(400).json({ error: 'Dados inválidos', details: validation.errors });
            return;
        }
        // Autenticar usuário (opcional para chat público)
        const user = await (0, auth_1.authenticateUser)(req);
        const userId = (user === null || user === void 0 ? void 0 : user.uid) || req.body.userId || 'anonymous';
        const { message, context, sessionId } = req.body;
        logger_1.logger.info('Nova mensagem recebida', {
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
    }
    catch (error) {
        logger_1.logger.error('Erro ao processar mensagem:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// GET /api/chat/history/:sessionId - Histórico de conversa
exports.getChatHistory = functions.https.onRequest(async (req, res) => {
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
        const user = await (0, auth_1.authenticateUser)(req);
        const userId = (user === null || user === void 0 ? void 0 : user.uid) || req.query.userId || 'anonymous';
        const history = await chatController.getChatHistory(sessionId, userId);
        res.json({ history });
    }
    catch (error) {
        logger_1.logger.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            error: 'Erro ao buscar histórico',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// POST /api/chat/feedback - Avaliar resposta da IA
exports.saveFeedback = functions.https.onRequest(async (req, res) => {
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
        const user = await (0, auth_1.authenticateUser)(req);
        const userId = (user === null || user === void 0 ? void 0 : user.uid) || req.body.userId || 'anonymous';
        await chatController.saveFeedback({
            sessionId,
            messageId,
            userId,
            rating,
            feedback
        });
        res.json({ message: 'Feedback salvo com sucesso' });
    }
    catch (error) {
        logger_1.logger.error('Erro ao salvar feedback:', error);
        res.status(500).json({
            error: 'Erro ao salvar feedback',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// POST /api/chat/session - Criar nova sessão
exports.createSession = functions.https.onRequest(async (req, res) => {
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
        const user = await (0, auth_1.authenticateUser)(req);
        const userId = (user === null || user === void 0 ? void 0 : user.uid) || req.body.userId || 'anonymous';
        const session = await chatController.createSession(userId, context);
        res.json({ session });
    }
    catch (error) {
        logger_1.logger.error('Erro ao criar sessão:', error);
        res.status(500).json({
            error: 'Erro ao criar sessão',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
// GET /api/chat/poll/:sessionId - Polling para novas mensagens
exports.pollMessages = functions.https.onRequest(async (req, res) => {
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
        const user = await (0, auth_1.authenticateUser)(req);
        const userId = (user === null || user === void 0 ? void 0 : user.uid) || req.query.userId || 'anonymous';
        const newMessages = await chatController.pollNewMessages(sessionId, userId, lastMessageId);
        res.json({ messages: newMessages });
    }
    catch (error) {
        logger_1.logger.error('Erro no polling:', error);
        res.status(500).json({
            error: 'Erro no polling',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
//# sourceMappingURL=chat.js.map