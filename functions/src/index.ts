// /functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';


if (!admin.apps.length) {
  admin.initializeApp();
}

import { criarInscricaoTime } from './pedidos';
import { validaAudiovisual, criarInscricaoAudiovisual } from './audiovisual';
import { enviaEmailConfirmacao } from './emails';
import { 
  enviarConviteTime, 
  responderConviteTime, 
  listarConvitesUsuario, 
  cancelarConviteTime 
} from './teams';
import { logger, createRequestContext } from './utils/logger';

// Chat Functions
import { sendMessage, getChatHistory, saveFeedback, createSession, pollMessages } from './chat';

// =====================================
// EXPORTAÇÕES DE CLOUD FUNCTIONS
// =====================================

// Funções de Inscrições
export const criarInscricaoTimeFunction = criarInscricaoTime;
export const validaAudiovisualFunction = validaAudiovisual;
export const criarInscricaoAudiovisualFunction = criarInscricaoAudiovisual;

// Funções de Email
export const enviaEmailConfirmacaoFunction = enviaEmailConfirmacao;

// Funções de Times
export const enviarConviteTimeFunction = enviarConviteTime;
export const responderConviteTimeFunction = responderConviteTime;
export const listarConvitesUsuarioFunction = listarConvitesUsuario;
export const cancelarConviteTimeFunction = cancelarConviteTime;

// Funções de Chat
export const sendMessageFunction = sendMessage;
export const getChatHistoryFunction = getChatHistory;
export const saveFeedbackFunction = saveFeedback;
export const createSessionFunction = createSession;
export const pollMessagesFunction = pollMessages;

// Funções de Usuário
export { onUserCreated } from './user-created';

// =====================================
// SERVIÇO DE RATE LIMITING
// =====================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto
  private static readonly MAX_REQUESTS_PER_WINDOW = 10;
  private static readonly MAX_RATE_LIMIT_ENTRIES = 1000;
  private static readonly CLEANUP_INTERVAL = 300000; // 5 minutos

  private rateLimitMap = new Map<string, RateLimitEntry>();

  constructor() {
    // Configurar limpeza automática
    setInterval(() => this.cleanupExpiredEntries(), RateLimitService.CLEANUP_INTERVAL);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
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

  public checkRateLimit(ip: string): boolean {
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

// =====================================
// WEBHOOK SERVICE
// =====================================

class WebhookService {
  private static readonly VALID_STATUSES = ['paid', 'pending', 'failed', 'expired'];
  private static readonly TIME_WINDOW = 300; // 5 minutos

  constructor(private rateLimitService: RateLimitService) {}

  private validateMethod(method: string): boolean {
    return method === 'POST';
  }

  private validateHeaders(headers: any): { signature?: string; timestamp?: string } {
    const signature = headers['x-flowpay-signature'];
    const timestamp = headers['x-flowpay-timestamp'];
    return { signature, timestamp };
  }

  private validateTimestamp(timestamp: string): boolean {
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.abs(currentTime - requestTime) <= WebhookService.TIME_WINDOW;
  }

  private validateSignature(body: any, signature: string): boolean {
    try {
      // TODO: Implementar verificação de assinatura
      // const webhookSecret = functions.config().flowpay.webhook_secret;
      // return verifySignature(body, signature, webhookSecret);
      return true; // Temporário
    } catch (error) {
      logger.error('Erro ao validar assinatura', { error });
      return false;
    }
  }

  private validatePayload(body: any): { orderId?: string; status?: string; paymentData?: any } {
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

  private async processInscricaoTime(orderId: string, status: string, metadata: any): Promise<void> {
    const inscricaoRef = admin.firestore().collection('inscricoes_times').doc(orderId);
    await inscricaoRef.update({
      status: 'confirmed',
      paidAt: new Date(),
      updatedAt: new Date(),
      flowpayStatus: status
    });

    logger.business('Inscrição de time confirmada', { 
      orderId, 
      status, 
      categoria: metadata?.categoria, 
      lote: metadata?.lote 
    });
  }

  private async processAudiovisual(orderId: string, status: string, metadata: any): Promise<void> {
    const audiovisualRef = admin.firestore().collection('audiovisual').doc(orderId);
    await audiovisualRef.update({
      status: 'confirmed',
      paidAt: new Date(),
      updatedAt: new Date(),
      flowpayStatus: status
    });

    logger.business('Inscrição audiovisual confirmada', { 
      orderId, 
      status, 
      area: metadata?.area 
    });
  }

  private async processPayment(orderId: string, status: string, metadata: any): Promise<void> {
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

  public async handleWebhook(req: any, res: any): Promise<void> {
    const context = createRequestContext(req);
    
    try {
      // Rate limiting
      const clientIp = req.ip || 'unknown';
      if (!this.rateLimitService.checkRateLimit(clientIp)) {
        logger.security('Rate limit excedido no webhook', { ip: clientIp }, context);
        res.status(429).json({ error: 'Too many requests' });
        return;
      }

      // Validar método HTTP
      if (!this.validateMethod(req.method)) {
        logger.security('Método HTTP inválido no webhook', { method: req.method }, context);
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Validar headers de segurança
      const { signature, timestamp } = this.validateHeaders(req.headers);
      if (!signature || !timestamp) {
        logger.security('Headers de segurança ausentes no webhook', { 
          headers: Object.keys(req.headers) 
        }, context);
        res.status(401).json({ error: 'Missing security headers' });
        return;
      }

      // Validar timestamp
      if (!this.validateTimestamp(timestamp)) {
        logger.security('Timestamp expirado no webhook', { timestamp }, context);
        res.status(401).json({ error: 'Request timestamp expired' });
        return;
      }

      // Validar assinatura
      if (!this.validateSignature(req.body, signature)) {
        logger.security('Assinatura inválida no webhook', {}, context);
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao processar webhook', { error: errorMessage }, context);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// =====================================
// INSTÂNCIAS DOS SERVIÇOS
// =====================================

const rateLimitService = new RateLimitService();
const webhookService = new WebhookService(rateLimitService);

// =====================================
// EXPORTAÇÃO DO WEBHOOK
// =====================================

export const flowpayWebhook = functions.https.onRequest(async (req, res) => {
  await webhookService.handleWebhook(req, res);
}); 