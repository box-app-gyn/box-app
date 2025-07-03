// /functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

import { criarInscricaoTime } from './pedidos';
import { validaAudiovisual, criarInscricaoAudiovisual } from './audiovisual';
import { enviaEmailConfirmacao, enviaEmailBoasVindas } from './emails';
import { 
  enviarConviteTime, 
  responderConviteTime, 
  listarConvitesUsuario, 
  cancelarConviteTime 
} from './teams';
import { logger, createRequestContext } from './utils/logger';

// Chat Functions
import { sendMessage, getChatHistory, saveFeedback, createSession, pollMessages } from './chat';

// Cloud Functions exportadas
export const criarInscricaoTimeFunction = criarInscricaoTime;
export const validaAudiovisualFunction = validaAudiovisual;
export const criarInscricaoAudiovisualFunction = criarInscricaoAudiovisual;
export const enviaEmailConfirmacaoFunction = enviaEmailConfirmacao;

// Funções de Times
export const enviarConviteTimeFunction = enviarConviteTime;
export const responderConviteTimeFunction = responderConviteTime;
export const listarConvitesUsuarioFunction = listarConvitesUsuario;
export const cancelarConviteTimeFunction = cancelarConviteTime;

// Chat Functions
export const sendMessageFunction = sendMessage;
export const getChatHistoryFunction = getChatHistory;
export const saveFeedbackFunction = saveFeedback;
export const createSessionFunction = createSession;
export const pollMessagesFunction = pollMessages;

// Rate limiting para webhooks
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_RATE_LIMIT_ENTRIES = 1000; // Limite máximo de IPs em cache
const CLEANUP_INTERVAL = 300000; // Limpeza a cada 5 minutos

const webhookRateLimit = new Map<string, { count: number; resetTime: number }>();

// Função para limpar entradas expiradas
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  for (const [key, value] of webhookRateLimit.entries()) {
    if (now > value.resetTime) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => webhookRateLimit.delete(key));
  
  // Se ainda estiver muito grande, remover entradas mais antigas
  if (webhookRateLimit.size > MAX_RATE_LIMIT_ENTRIES) {
    const entries = Array.from(webhookRateLimit.entries());
    entries.sort((a, b) => a[1].resetTime - b[1].resetTime);
    
    const toRemove = entries.slice(0, webhookRateLimit.size - MAX_RATE_LIMIT_ENTRIES);
    toRemove.forEach(([key]) => webhookRateLimit.delete(key));
  }
}

// Configurar limpeza automática
setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = webhookRateLimit.get(ip);
  
  if (!clientData || now > clientData.resetTime) {
    // Limpar entradas expiradas antes de adicionar nova
    if (webhookRateLimit.size >= MAX_RATE_LIMIT_ENTRIES) {
      cleanupExpiredEntries();
    }
    
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
export const flowpayWebhook = functions.https.onRequest(async (req: functions.https.Request, res: functions.Response) => {
  const context = createRequestContext(req);
  
  try {
    // Rate limiting
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(clientIp)) {
      logger.security('Rate limit excedido no webhook', { ip: clientIp }, context);
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    // Verificar método HTTP
    if (req.method !== 'POST') {
      logger.security('Método HTTP inválido no webhook', { method: req.method }, context);
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Verificar headers de segurança
    const headers = req.headers;
    const signature = headers['x-flowpay-signature'];
    const timestamp = headers['x-flowpay-timestamp'];

    if (!signature || !timestamp) {
      logger.security('Headers de segurança ausentes no webhook', { headers: Object.keys(headers) }, context);
      res.status(401).json({ error: 'Missing security headers' });
      return;
    }

    // Verificar timestamp (prevenir replay attacks)
    const requestTime = parseInt(timestamp as string, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeWindow = 300; // 5 minutos

    if (Math.abs(currentTime - requestTime) > timeWindow) {
      logger.security('Timestamp expirado no webhook', { requestTime, currentTime }, context);
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
    } catch (signatureError) {
      const errorMessage = signatureError instanceof Error ? signatureError.message : 'Erro desconhecido';
      logger.security('Assinatura inválida no webhook', { error: errorMessage }, context);
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Processar payload
    const body = req.body;
    if (!body || typeof body !== 'object') {
      logger.warn('Payload inválido no webhook', { body }, context);
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    const { orderId, status, paymentData } = body;
    if (!orderId || !status || !paymentData) {
      logger.warn('Estrutura de payload inválida no webhook', { orderId, status }, context);
      res.status(400).json({ error: 'Invalid payload structure' });
      return;
    }

    // Validar status
    const validStatuses = ['paid', 'pending', 'failed', 'expired'];
    if (!validStatuses.includes(status)) {
      logger.warn('Status inválido no webhook', { status, orderId }, context);
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Processar webhook do FlowPay
    const { tipo, categoria, lote } = body.metadata || {};
    
    if (tipo === 'inscricao_time') {
      // Atualizar inscrição de time
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
        categoria, 
        lote 
      }, context);
      
    } else if (tipo === 'audiovisual') {
      // Atualizar inscrição de audiovisual
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
        area: body.metadata?.area 
      }, context);
    }

    res.status(200).json({ success: true, orderId, status });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao processar webhook', { error: errorMessage }, context);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger quando usuário é criado
export const onUserCreated = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  const context = createRequestContext();
  
  try {
    const { uid, email, displayName, photoURL } = user;
    
    // Criar documento do usuário no Firestore
    const userData = {
      uid,
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || '',
      role: 'publico' as const,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // 🎯 GAMIFICAÇÃO CAMADA 1
      gamification: {
        points: 10, // Pontos iniciais por cadastro
        level: 'iniciante',
        totalActions: 1,
        lastActionAt: admin.firestore.FieldValue.serverTimestamp(),
        achievements: ['first_blood'], // Primeira conquista
        rewards: [],
        streakDays: 1,
        lastLoginStreak: admin.firestore.FieldValue.serverTimestamp(),
        referralCode: `REF${uid.substring(0, 8).toUpperCase()}`,
        referrals: [],
        referralPoints: 0
      }
    };

    await admin.firestore().collection('users').doc(uid).set(userData);
    
    logger.business('Novo usuário criado', { email, displayName }, { ...context, userId: uid });
    
    // Enviar email de boas-vindas
    if (email) {
      await enviaEmailBoasVindas({
        userEmail: email,
        userName: displayName || 'Usuário',
        tipo: 'admin',
        dadosAdicionais: { message: 'Bem-vindo ao Interbox 2025!' },
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao criar usuário', { error: errorMessage, userId: user.uid }, context);
  }
}); 