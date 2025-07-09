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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowpayWebhook = exports.onUserCreated = exports.pollMessagesFunction = exports.createSessionFunction = exports.saveFeedbackFunction = exports.getChatHistoryFunction = exports.sendMessageFunction = exports.cancelarConviteTimeFunction = exports.listarConvitesUsuarioFunction = exports.responderConviteTimeFunction = exports.enviarConviteTimeFunction = exports.enviaEmailConfirmacaoFunction = exports.criarInscricaoAudiovisualFunction = exports.validaAudiovisualFunction = exports.criarInscricaoTimeFunction = void 0;
// /functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp();
}
const pedidos_1 = require("./pedidos");
const audiovisual_1 = require("./audiovisual");
const emails_1 = require("./emails");
const teams_1 = require("./teams");
const logger_1 = require("./utils/logger");
// Chat Functions
const chat_1 = require("./chat");
// =====================================
// EXPORTAÇÕES DE CLOUD FUNCTIONS
// =====================================
// Funções de Inscrições
exports.criarInscricaoTimeFunction = pedidos_1.criarInscricaoTime;
exports.validaAudiovisualFunction = audiovisual_1.validaAudiovisual;
exports.criarInscricaoAudiovisualFunction = audiovisual_1.criarInscricaoAudiovisual;
// Funções de Email
exports.enviaEmailConfirmacaoFunction = emails_1.enviaEmailConfirmacao;
// Funções de Times
exports.enviarConviteTimeFunction = teams_1.enviarConviteTime;
exports.responderConviteTimeFunction = teams_1.responderConviteTime;
exports.listarConvitesUsuarioFunction = teams_1.listarConvitesUsuario;
exports.cancelarConviteTimeFunction = teams_1.cancelarConviteTime;
// Funções de Chat
exports.sendMessageFunction = chat_1.sendMessage;
exports.getChatHistoryFunction = chat_1.getChatHistory;
exports.saveFeedbackFunction = chat_1.saveFeedback;
exports.createSessionFunction = chat_1.createSession;
exports.pollMessagesFunction = chat_1.pollMessages;
// Funções de Usuário
var user_created_1 = require("./user-created");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return user_created_1.onUserCreated; } });
class RateLimitService {
    constructor() {
        this.rateLimitMap = new Map();
        // Configurar limpeza automática
        setInterval(() => this.cleanupExpiredEntries(), RateLimitService.CLEANUP_INTERVAL);
    }
    cleanupExpiredEntries() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, value] of this.rateLimitMap.entries()) {
            if (now > value.resetTime) {
                expiredKeys.push(key);
            }
        }
        expiredKeys.forEach(key => this.rateLimitMap.delete(key));
        // Se ainda estiver muito grande, remover entradas mais antigas
        if (this.rateLimitMap.size > RateLimitService.MAX_RATE_LIMIT_ENTRIES) {
            const entries = Array.from(this.rateLimitMap.entries());
            entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
            const toRemove = entries.slice(0, this.rateLimitMap.size - RateLimitService.MAX_RATE_LIMIT_ENTRIES);
            toRemove.forEach(([key]) => this.rateLimitMap.delete(key));
        }
    }
    checkRateLimit(ip) {
        const now = Date.now();
        const clientData = this.rateLimitMap.get(ip);
        if (!clientData || now > clientData.resetTime) {
            // Limpar entradas expiradas antes de adicionar nova
            if (this.rateLimitMap.size >= RateLimitService.MAX_RATE_LIMIT_ENTRIES) {
                this.cleanupExpiredEntries();
            }
            this.rateLimitMap.set(ip, {
                count: 1,
                resetTime: now + RateLimitService.RATE_LIMIT_WINDOW
            });
            return true;
        }
        if (clientData.count >= RateLimitService.MAX_REQUESTS_PER_WINDOW) {
            return false;
        }
        clientData.count++;
        return true;
    }
}
RateLimitService.RATE_LIMIT_WINDOW = 60000; // 1 minuto
RateLimitService.MAX_REQUESTS_PER_WINDOW = 10;
RateLimitService.MAX_RATE_LIMIT_ENTRIES = 1000;
RateLimitService.CLEANUP_INTERVAL = 300000; // 5 minutos
// =====================================
// WEBHOOK SERVICE
// =====================================
class WebhookService {
    constructor(rateLimitService) {
        this.rateLimitService = rateLimitService;
    }
    validateMethod(method) {
        return method === 'POST';
    }
    validateHeaders(headers) {
        const signature = headers['x-flowpay-signature'];
        const timestamp = headers['x-flowpay-timestamp'];
        return { signature, timestamp };
    }
    validateTimestamp(timestamp) {
        const requestTime = parseInt(timestamp, 10);
        const currentTime = Math.floor(Date.now() / 1000);
        return Math.abs(currentTime - requestTime) <= WebhookService.TIME_WINDOW;
    }
    validateSignature(body, signature) {
        try {
            // TODO: Implementar verificação de assinatura
            // const webhookSecret = functions.config().flowpay.webhook_secret;
            // return verifySignature(body, signature, webhookSecret);
            return true; // Temporário
        }
        catch (error) {
            logger_1.logger.error('Erro ao validar assinatura', { error });
            return false;
        }
    }
    validatePayload(body) {
        if (!body || typeof body !== 'object') {
            throw new Error('Payload inválido');
        }
        const { orderId, status, paymentData } = body;
        if (!orderId || !status || !paymentData) {
            throw new Error('Estrutura de payload inválida');
        }
        if (!WebhookService.VALID_STATUSES.includes(status)) {
            throw new Error(`Status inválido: ${status}`);
        }
        return { orderId, status, paymentData };
    }
    async processInscricaoTime(orderId, status, metadata) {
        const inscricaoRef = firebase_admin_1.default.firestore().collection('inscricoes_times').doc(orderId);
        await inscricaoRef.update({
            status: 'confirmed',
            paidAt: new Date(),
            updatedAt: new Date(),
            flowpayStatus: status
        });
        logger_1.logger.business('Inscrição de time confirmada', {
            orderId,
            status,
            categoria: metadata === null || metadata === void 0 ? void 0 : metadata.categoria,
            lote: metadata === null || metadata === void 0 ? void 0 : metadata.lote
        });
    }
    async processAudiovisual(orderId, status, metadata) {
        const audiovisualRef = firebase_admin_1.default.firestore().collection('audiovisual').doc(orderId);
        await audiovisualRef.update({
            status: 'confirmed',
            paidAt: new Date(),
            updatedAt: new Date(),
            flowpayStatus: status
        });
        logger_1.logger.business('Inscrição audiovisual confirmada', {
            orderId,
            status,
            area: metadata === null || metadata === void 0 ? void 0 : metadata.area
        });
    }
    async processPayment(orderId, status, metadata) {
        const { tipo } = metadata || {};
        switch (tipo) {
            case 'inscricao_time':
                await this.processInscricaoTime(orderId, status, metadata);
                break;
            case 'audiovisual':
                await this.processAudiovisual(orderId, status, metadata);
                break;
            default:
                throw new Error(`Tipo de pagamento não reconhecido: ${tipo}`);
        }
    }
    async handleWebhook(req, res) {
        const context = (0, logger_1.createRequestContext)(req);
        try {
            // Rate limiting
            const clientIp = req.ip || 'unknown';
            if (!this.rateLimitService.checkRateLimit(clientIp)) {
                logger_1.logger.security('Rate limit excedido no webhook', { ip: clientIp }, context);
                res.status(429).json({ error: 'Too many requests' });
                return;
            }
            // Validar método HTTP
            if (!this.validateMethod(req.method)) {
                logger_1.logger.security('Método HTTP inválido no webhook', { method: req.method }, context);
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }
            // Validar headers de segurança
            const { signature, timestamp } = this.validateHeaders(req.headers);
            if (!signature || !timestamp) {
                logger_1.logger.security('Headers de segurança ausentes no webhook', {
                    headers: Object.keys(req.headers)
                }, context);
                res.status(401).json({ error: 'Missing security headers' });
                return;
            }
            // Validar timestamp
            if (!this.validateTimestamp(timestamp)) {
                logger_1.logger.security('Timestamp expirado no webhook', { timestamp }, context);
                res.status(401).json({ error: 'Request timestamp expired' });
                return;
            }
            // Validar assinatura
            if (!this.validateSignature(req.body, signature)) {
                logger_1.logger.security('Assinatura inválida no webhook', {}, context);
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
            // Validar e processar payload
            const { orderId, status } = this.validatePayload(req.body);
            if (!orderId || !status) {
                res.status(400).json({ error: 'Invalid payload structure' });
                return;
            }
            // Processar pagamento
            await this.processPayment(orderId, status, req.body.metadata);
            res.status(200).json({ success: true, orderId, status });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            logger_1.logger.error('Erro ao processar webhook', { error: errorMessage }, context);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
WebhookService.VALID_STATUSES = ['paid', 'pending', 'failed', 'expired'];
WebhookService.TIME_WINDOW = 300; // 5 minutos
// =====================================
// INSTÂNCIAS DOS SERVIÇOS
// =====================================
const rateLimitService = new RateLimitService();
const webhookService = new WebhookService(rateLimitService);
// =====================================
// EXPORTAÇÃO DO WEBHOOK
// =====================================
exports.flowpayWebhook = functions.https.onRequest(async (req, res) => {
    await webhookService.handleWebhook(req, res);
});
//# sourceMappingURL=index-backup.js.map