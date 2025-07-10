import * as functions from 'firebase-functions/v2';
import admin from 'firebase-admin';
import { logger } from './utils/logger';
import axios from 'axios';

const db = admin.firestore();

interface ValidaAudiovisualData {
  audiovisualId: string;
  adminId: string;
  aprovado: boolean;
  motivoRejeicao?: string;
}

interface AudiovisualData {
  nome: string;
  email: string;
  telefone: string;
  area: 'fotografia' | 'video' | 'drone' | 'podcast' | 'midia';
  experiencia: string;
  portfolio?: string;
}

export const validaAudiovisual = functions.https.onCall(async (request) => {
  const data = request.data as ValidaAudiovisualData;
  const auth = request.auth;
  const contextData = { functionName: 'validaAudiovisual', userId: auth?.uid };
  
    try {
      // Verificar autenticação
      if (!auth) {
        logger.security('Tentativa de acesso não autenticado', {}, contextData);
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
      }

      const { audiovisualId, adminId, aprovado, motivoRejeicao } = data;

      // Verificar se é admin
      const adminUser = await db.collection('users').doc(adminId).get();
      if (!adminUser.exists || adminUser.data()?.role !== 'admin') {
        logger.security('Tentativa de validação por não-admin', { adminId }, contextData);
        throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem validar profissionais audiovisuais');
      }

      // Buscar profissional audiovisual
      const audiovisualRef = db.collection('audiovisual').doc(audiovisualId);
      const audiovisualDoc = await audiovisualRef.get();

      if (!audiovisualDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Profissional audiovisual não encontrado');
      }

      const audiovisualData = audiovisualDoc.data();
      const tipo = audiovisualData?.tipo || 'fotografo';

      // Atualizar status do profissional audiovisual
      const updateData: any = {
        status: aprovado ? 'approved' : 'rejected',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (aprovado) {
        updateData.aprovadoPor = adminId;
        updateData.aprovadoEm = admin.firestore.FieldValue.serverTimestamp();
      } else {
        updateData.rejeitadoPor = adminId;
        updateData.rejeitadoEm = admin.firestore.FieldValue.serverTimestamp();
        updateData.motivoRejeicao = motivoRejeicao || 'Não especificado';
      }

      await audiovisualRef.update(updateData);

      // Atualizar role do usuário se aprovado
      if (aprovado) {
        await db.collection('users').doc(audiovisualData?.userId).update({
          role: tipo, // 'fotografo', 'videomaker', 'editor', etc.
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Log da ação
      const logData = {
        adminId,
        adminEmail: adminUser.data()?.email,
        acao: aprovado ? 'aprovacao_audiovisual' : 'rejeicao_audiovisual',
        targetId: audiovisualId,
        targetType: 'audiovisual',
        detalhes: {
          tipo,
          aprovado,
          motivoRejeicao: motivoRejeicao || null,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('adminLogs').add(logData);

      logger.business('Profissional audiovisual validado', { audiovisualId, aprovado, tipo }, contextData);

      return { success: true, audiovisualId, aprovado };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('Erro ao validar profissional audiovisual', { error: errorMessage, audiovisualId: data.audiovisualId }, contextData);
      throw error;
    }
  }
);

// Função para validar dados do audiovisual
function validateAudiovisualData(data: AudiovisualData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar nome
  if (!data.nome || typeof data.nome !== 'string' || data.nome.length < 2) {
    errors.push('nome inválido');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('email inválido');
  }

  // Validar telefone
  if (!data.telefone || typeof data.telefone !== 'string' || data.telefone.length < 10) {
    errors.push('telefone inválido');
  }

  // Validar área
  const validAreas = ['fotografia', 'video', 'drone', 'podcast', 'midia'];
  if (!data.area || !validAreas.includes(data.area)) {
    errors.push('área inválida');
  }

  // Validar experiência
  if (!data.experiencia || typeof data.experiencia !== 'string' || data.experiencia.length < 10) {
    errors.push('experiência muito curta');
  }

  return { isValid: errors.length === 0, errors };
}

// Função para verificar se já existe inscrição
async function checkExistingAudiovisual(email: string): Promise<boolean> {
  try {
    const existing = await db.collection('audiovisual')
      .where('email', '==', email.toLowerCase())
      .where('status', 'in', ['pending', 'paid', 'confirmed'])
      .limit(1)
      .get();
    
    return !existing.empty;
  } catch (error) {
    console.error('Erro ao verificar inscrição existente:', error);
    return false;
  }
}

export const criarInscricaoAudiovisual = functions.https.onCall(async (request) => {
  const data = request.data as AudiovisualData;
  const auth = request.auth;
    try {
      // Verificar autenticação
      if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
      }

      // Validar dados
      const validation = validateAudiovisualData(data);
      if (!validation.isValid) {
        throw new functions.https.HttpsError('invalid-argument', `Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // Verificar se já existe inscrição
      const hasExisting = await checkExistingAudiovisual(data.email);
      if (hasExisting) {
        throw new functions.https.HttpsError('already-exists', 'Email já possui inscrição');
      }

      const valor = 29.90;

      // Criar inscrição no Firestore com transação
      const result = await db.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
        const inscricaoRef = db.collection('audiovisual').doc();
        
        const inscricaoData = {
          nome: data.nome.trim(),
          email: data.email.toLowerCase().trim(),
          telefone: data.telefone.trim(),
          area: data.area,
          experiencia: data.experiencia.trim(),
          portfolio: data.portfolio?.trim() || '',
          valor,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: auth!.uid,
          ipAddress: request.rawRequest?.ip || 'unknown'
        };

        transaction.set(inscricaoRef, inscricaoData);
        return { inscricaoRef, inscricaoData };
      });

      // Integração com FlowPay
      const flowpayData = {
        externalId: result.inscricaoRef.id,
        amount: Math.round(valor * 100), // FlowPay usa centavos
        customer: {
          name: data.nome,
          email: data.email,
        },
        items: [
          {
            name: 'Inscrição Audiovisual - CERRADØ INTERBOX 2025',
            quantity: 1,
            unitAmount: Math.round(valor * 100),
          }
        ],
        paymentMethod: 'PIX',
        expiresIn: 3600, // 1 hora
        metadata: {
          tipo: 'audiovisual',
          area: data.area,
          inscricaoId: result.inscricaoRef.id
        }
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

      // Atualizar inscrição com dados do FlowPay
      await result.inscricaoRef.update({
        flowpayOrderId,
        pixCode: pixQrCodeText,
        pixExpiration: new Date(Date.now() + 3600 * 1000),
        updatedAt: new Date(),
      });

      // Log administrativo
      await db.collection('adminLogs').add({
        adminId: context.auth.uid,
        adminEmail: context.auth.token.email || '',
        acao: 'criacao_inscricao_audiovisual',
        targetId: result.inscricaoRef.id,
        targetType: 'audiovisual',
        detalhes: {
          nome: data.nome,
          area: data.area,
          valor,
          ipAddress: context.rawRequest?.ip || 'unknown'
        },
        createdAt: new Date(),
      });

      return {
        success: true,
        inscricaoId: result.inscricaoRef.id,
        flowpayOrderId,
        pixQrCode,
        pixQrCodeText,
        valor,
        expiresIn: 3600,
      };

    } catch (error) {
      console.error('Erro ao criar inscrição audiovisual:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Log de erro para debugging
      if (error instanceof Error) {
        console.error('Erro detalhado:', {
          message: error.message,
          stack: error.stack,
          email: data?.email,
          area: data?.area
        });
      }
      
      throw new functions.https.HttpsError('internal', 'Erro interno do servidor');
    }
  }
); 