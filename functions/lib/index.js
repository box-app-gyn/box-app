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
exports.onUserCreated = exports.flowpayWebhook = exports.pollMessagesFunction = exports.createSessionFunction = exports.saveFeedbackFunction = exports.getChatHistoryFunction = exports.sendMessageFunction = exports.cancelarConviteTimeFunction = exports.listarConvitesUsuarioFunction = exports.responderConviteTimeFunction = exports.enviarConviteTimeFunction = exports.enviaEmailConfirmacaoFunction = exports.validaAudiovisualFunction = exports.criarPedidoPIXFunction = void 0;
// /functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const pedidos_1 = require("./pedidos");
const audiovisual_1 = require("./audiovisual");
const emails_1 = require("./emails");
const teams_1 = require("./teams");
const logger_1 = require("./utils/logger");
// Chat Functions
const chat_1 = require("./chat");
// Cloud Functions exportadas
exports.criarPedidoPIXFunction = pedidos_1.criarPedidoPIX;
exports.validaAudiovisualFunction = audiovisual_1.validaAudiovisual;
exports.enviaEmailConfirmacaoFunction = emails_1.enviaEmailConfirmacao;
// Funções de Times
exports.enviarConviteTimeFunction = teams_1.enviarConviteTime;
exports.responderConviteTimeFunction = teams_1.responderConviteTime;
exports.listarConvitesUsuarioFunction = teams_1.listarConvitesUsuario;
exports.cancelarConviteTimeFunction = teams_1.cancelarConviteTime;
// Chat Functions
exports.sendMessageFunction = chat_1.sendMessage;
exports.getChatHistoryFunction = chat_1.getChatHistory;
exports.saveFeedbackFunction = chat_1.saveFeedback;
exports.createSessionFunction = chat_1.createSession;
exports.pollMessagesFunction = chat_1.pollMessages;
// Rate limiting para webhooks
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10;
const webhookRateLimit = new Map();
function checkRateLimit(ip) {
    const now = Date.now();
    const clientData = webhookRateLimit.get(ip);
    if (!clientData || now > clientData.resetTime) {
        webhookRateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }
    clientData.count++;
    return true;
}
// Webhook para FlowPay
exports.flowpayWebhook = functions.https.onRequest(async (req, res) => {
    const context = (0, logger_1.createRequestContext)(req);
    try {
        // Rate limiting
        const clientIp = req.ip || 'unknown';
        if (!checkRateLimit(clientIp)) {
            logger_1.logger.security('Rate limit excedido no webhook', { ip: clientIp }, context);
            res.status(429).json({ error: 'Too many requests' });
            return;
        }
        // Verificar método HTTP
        if (req.method !== 'POST') {
            logger_1.logger.security('Método HTTP inválido no webhook', { method: req.method }, context);
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        // Verificar headers de segurança
        const headers = req.headers;
        const signature = headers['x-flowpay-signature'];
        const timestamp = headers['x-flowpay-timestamp'];
        if (!signature || !timestamp) {
            logger_1.logger.security('Headers de segurança ausentes no webhook', { headers: Object.keys(headers) }, context);
            res.status(401).json({ error: 'Missing security headers' });
            return;
        }
        // Verificar timestamp (prevenir replay attacks)
        const requestTime = parseInt(timestamp, 10);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeWindow = 300; // 5 minutos
        if (Math.abs(currentTime - requestTime) > timeWindow) {
            logger_1.logger.security('Timestamp expirado no webhook', { requestTime, currentTime }, context);
            res.status(401).json({ error: 'Request timestamp expired' });
            return;
        }
        // Verificar assinatura (implementar conforme documentação do FlowPay)
        try {
            // TODO: Implementar verificação de assinatura
            // const webhookSecret = functions.config().flowpay.webhook_secret;
            // const isValidSignature = verifySignature(req.body, signature, webhookSecret);
            // if (!isValidSignature) {
            //   throw new Error('Invalid signature');
            // }
        }
        catch (signatureError) {
            const errorMessage = signatureError instanceof Error ? signatureError.message : 'Erro desconhecido';
            logger_1.logger.security('Assinatura inválida no webhook', { error: errorMessage }, context);
            res.status(401).json({ error: 'Invalid signature' });
            return;
        }
        // Processar payload
        const body = req.body;
        if (!body || typeof body !== 'object') {
            logger_1.logger.warn('Payload inválido no webhook', { body }, context);
            res.status(400).json({ error: 'Invalid payload' });
            return;
        }
        const { orderId, status, paymentData } = body;
        if (!orderId || !status || !paymentData) {
            logger_1.logger.warn('Estrutura de payload inválida no webhook', { orderId, status }, context);
            res.status(400).json({ error: 'Invalid payload structure' });
            return;
        }
        // Validar status
        const validStatuses = ['paid', 'pending', 'failed', 'expired'];
        if (!validStatuses.includes(status)) {
            logger_1.logger.warn('Status inválido no webhook', { status, orderId }, context);
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        // Processar webhook do FlowPay
        // TODO: Implementar lógica de atualização do pedido no Firestore
        logger_1.logger.business('Webhook processado com sucesso', { orderId, status }, context);
        res.status(200).json({ success: true, orderId, status });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao processar webhook', { error: errorMessage }, context);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Trigger quando usuário é criado
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const context = (0, logger_1.createRequestContext)();
    try {
        const { uid, email, displayName, photoURL } = user;
        // Criar documento do usuário no Firestore
        const userData = {
            uid,
            email: email || '',
            displayName: displayName || '',
            photoURL: photoURL || '',
            role: 'publico',
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await admin.firestore().collection('users').doc(uid).set(userData);
        logger_1.logger.business('Novo usuário criado', { email, displayName }, Object.assign(Object.assign({}, context), { userId: uid }));
        // Enviar email de boas-vindas
        if (email) {
            await (0, emails_1.enviaEmailBoasVindas)({
                userEmail: email,
                userName: displayName || 'Usuário',
                tipo: 'admin',
                dadosAdicionais: { message: 'Bem-vindo ao Interbox 2025!' },
            });
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao criar usuário', { error: errorMessage, userId: user.uid }, context);
    }
});
//# sourceMappingURL=index.js.map