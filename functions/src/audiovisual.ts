import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { logger } from './utils/logger';

const db = admin.firestore();

interface ValidaAudiovisualData {
  audiovisualId: string;
  adminId: string;
  aprovado: boolean;
  motivoRejeicao?: string;
}

export const validaAudiovisual = functions.https.onCall(async (data: ValidaAudiovisualData, context: functions.https.CallableContext) => {
  const contextData = { functionName: 'validaAudiovisual', userId: context.auth?.uid };
  
  try {
    // Verificar autenticação
    if (!context.auth) {
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
}); 