import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

const db = admin.firestore();

interface CriarPedidoPIXData {
  userId: string;
  userEmail: string;
  userName: string;
  tipo: 'ingresso' | 'kit' | 'premium';
  quantidade: number;
  valorUnitario: number;
}

// Constantes de validação
const VALIDATION_LIMITS = {
  MAX_QUANTIDADE: 10,
  MAX_VALOR_UNITARIO: 1000,
  MAX_VALOR_TOTAL: 5000,
  MIN_VALOR_UNITARIO: 1,
  MAX_USERNAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254
} as const;

// Função para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= VALIDATION_LIMITS.MAX_EMAIL_LENGTH;
}

// Função para sanitizar string
function sanitizeString(str: string, maxLength: number): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength).replace(/[<>]/g, '');
}

// Função para validar dados do pedido
function validatePedidoData(data: CriarPedidoPIXData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar userId
  if (!data.userId || typeof data.userId !== 'string' || data.userId.length < 3) {
    errors.push('userId inválido');
  }

  // Validar userEmail
  if (!data.userEmail || !isValidEmail(data.userEmail)) {
    errors.push('userEmail inválido');
  }

  // Validar userName
  if (!data.userName || typeof data.userName !== 'string') {
    errors.push('userName inválido');
  } else {
    const sanitizedUserName = sanitizeString(data.userName, VALIDATION_LIMITS.MAX_USERNAME_LENGTH);
    if (sanitizedUserName.length < 2) {
      errors.push('userName muito curto');
    }
  }

  // Validar tipo
  const validTypes = ['ingresso', 'kit', 'premium'];
  if (!data.tipo || !validTypes.includes(data.tipo)) {
    errors.push('tipo inválido');
  }

  // Validar quantidade
  if (!Number.isInteger(data.quantidade) || data.quantidade <= 0 || data.quantidade > VALIDATION_LIMITS.MAX_QUANTIDADE) {
    errors.push(`quantidade deve ser entre 1 e ${VALIDATION_LIMITS.MAX_QUANTIDADE}`);
  }

  // Validar valorUnitario
  if (typeof data.valorUnitario !== 'number' || 
      data.valorUnitario < VALIDATION_LIMITS.MIN_VALOR_UNITARIO || 
      data.valorUnitario > VALIDATION_LIMITS.MAX_VALOR_UNITARIO) {
    errors.push(`valorUnitario deve ser entre R$ ${VALIDATION_LIMITS.MIN_VALOR_UNITARIO} e R$ ${VALIDATION_LIMITS.MAX_VALOR_UNITARIO}`);
  }

  // Validar valor total
  const valorTotal = data.quantidade * data.valorUnitario;
  if (valorTotal > VALIDATION_LIMITS.MAX_VALOR_TOTAL) {
    errors.push(`valor total não pode exceder R$ ${VALIDATION_LIMITS.MAX_VALOR_TOTAL}`);
  }

  return { isValid: errors.length === 0, errors };
}

// Função para verificar se usuário já tem pedido pendente
async function checkPendingOrder(userId: string): Promise<boolean> {
  try {
    const pendingOrders = await db.collection('pedidos')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    
    return !pendingOrders.empty;
  } catch (error) {
    console.error('Erro ao verificar pedidos pendentes:', error);
    return false;
  }
}

export const criarPedidoPIX = functions.https.onCall(async (data: CriarPedidoPIXData, context: functions.https.CallableContext) => {
  try {
    // Verificar autenticação
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
    }

    // Verificar se o usuário está criando pedido para si mesmo
    if (data.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Não autorizado a criar pedido para outro usuário');
    }

    // Sanitizar dados
    const sanitizedData: CriarPedidoPIXData = {
      userId: data.userId,
      userEmail: data.userEmail.toLowerCase().trim(),
      userName: sanitizeString(data.userName, VALIDATION_LIMITS.MAX_USERNAME_LENGTH),
      tipo: data.tipo,
      quantidade: Math.floor(data.quantidade),
      valorUnitario: Math.round(data.valorUnitario * 100) / 100 // Arredondar para 2 casas decimais
    };

    // Validar dados
    const validation = validatePedidoData(sanitizedData);
    if (!validation.isValid) {
      throw new functions.https.HttpsError('invalid-argument', `Dados inválidos: ${validation.errors.join(', ')}`);
    }

    // Verificar se usuário já tem pedido pendente
    const hasPendingOrder = await checkPendingOrder(sanitizedData.userId);
    if (hasPendingOrder) {
      throw new functions.https.HttpsError('already-exists', 'Usuário já possui pedido pendente');
    }

    const valorTotal = sanitizedData.quantidade * sanitizedData.valorUnitario;

    // Criar pedido no Firestore com transação
    const result = await db.runTransaction(async (transaction) => {
      const pedidoRef = db.collection('pedidos').doc();
      
      const pedidoData = {
        userId: sanitizedData.userId,
        userEmail: sanitizedData.userEmail,
        userName: sanitizedData.userName,
        tipo: sanitizedData.tipo,
        quantidade: sanitizedData.quantidade,
        valorUnitario: sanitizedData.valorUnitario,
        valorTotal,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: context.auth!.uid,
        ipAddress: context.rawRequest?.ip || 'unknown'
      };

      transaction.set(pedidoRef, pedidoData);
      return { pedidoRef, pedidoData };
    });

    // Integração com FlowPay
    const flowpayData = {
      externalId: result.pedidoRef.id,
      amount: Math.round(valorTotal * 100), // FlowPay usa centavos
      customer: {
        name: sanitizedData.userName,
        email: sanitizedData.userEmail,
      },
      items: [
        {
          name: `${sanitizedData.tipo.toUpperCase()} - Interbox 2025`,
          quantity: sanitizedData.quantidade,
          unitAmount: Math.round(sanitizedData.valorUnitario * 100),
        }
      ],
      paymentMethod: 'PIX',
      expiresIn: 3600, // 1 hora
    };

    // Chamar API do FlowPay com timeout
    const flowpayResponse = await axios.post(
      'https://api.flowpay.com.br/v1/orders',
      flowpayData,
      {
        headers: {
          'Authorization': `Bearer ${functions.config().flowpay.api_key}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 segundos timeout
      }
    );

    const { id: flowpayOrderId, pixQrCode, pixQrCodeText } = flowpayResponse.data;

    // Atualizar pedido com dados do FlowPay
    await result.pedidoRef.update({
      flowpayOrderId,
      pixCode: pixQrCodeText,
      pixExpiration: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 3600 * 1000)
      ),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log administrativo
    await db.collection('adminLogs').add({
      adminId: context.auth.uid,
      adminEmail: context.auth.token.email || '',
      acao: 'criacao_pedido',
      targetId: result.pedidoRef.id,
      targetType: 'pedido',
      detalhes: {
        tipo: sanitizedData.tipo,
        quantidade: sanitizedData.quantidade,
        valorTotal,
        flowpayOrderId,
        ipAddress: context.rawRequest?.ip || 'unknown'
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      pedidoId: result.pedidoRef.id,
      flowpayOrderId,
      pixQrCode,
      pixQrCodeText,
      valorTotal,
      expiresIn: 3600,
    };

  } catch (error) {
    console.error('Erro ao criar pedido PIX:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Log de erro para debugging
    if (error instanceof Error) {
      console.error('Erro detalhado:', {
        message: error.message,
        stack: error.stack,
        userId: data?.userId,
        tipo: data?.tipo
      });
    }
    
    throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
  }
}); 