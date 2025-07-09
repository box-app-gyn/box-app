import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { logger } from './utils/logger';

const db = admin.firestore();

interface ConviteTimeData {
  teamId: string;
  teamName: string;
  captainId: string;
  captainName: string;
  invitedEmail: string;
  invitedName?: string;
}

interface RespostaConviteData {
  conviteId: string;
  resposta: 'aceito' | 'recusado';
  userId: string;
  userName: string;
}

// Função para enviar convite para time
export const enviarConviteTime = functions.https.onCall(async (request) => {
  const data = request.data;
  const context = request;
  const contextData = { userId: context.auth?.uid };
  
  try {
    // Validar dados
    if (!data.teamId || !data.teamName || !data.captainId || !data.captainName || !data.invitedEmail) {
      throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios ausentes');
    }

    // Verificar se o usuário é o capitão do time
    if (context.auth?.uid !== data.captainId) {
      throw new functions.https.HttpsError('permission-denied', 'Apenas o capitão pode enviar convites');
    }

    // Verificar se o time existe
    const teamRef = db.collection('teams').doc(data.teamId);
    const teamDoc = await teamRef.get();
    
    if (!teamDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Time não encontrado');
    }

    const teamData = teamDoc.data();
    if (!teamData) {
      throw new functions.https.HttpsError('internal', 'Dados do time inválidos');
    }

    // Verificar se o time não está completo
    if (teamData.atletas && teamData.atletas.length >= 4) {
      throw new functions.https.HttpsError('failed-precondition', 'Time já está completo');
    }

    // Verificar se já existe convite pendente para este email
    const conviteExistente = await db.collection('convites_times')
      .where('teamId', '==', data.teamId)
      .where('invitedEmail', '==', data.invitedEmail)
      .where('status', '==', 'pendente')
      .limit(1)
      .get();

    if (!conviteExistente.empty) {
      throw new functions.https.HttpsError('already-exists', 'Convite já enviado para este email');
    }

    // Criar convite
    const conviteRef = await db.collection('convites_times').add({
      teamId: data.teamId,
      teamName: data.teamName,
      captainId: data.captainId,
      captainName: data.captainName,
      captainEmail: context.auth?.token.email || '',
      invitedEmail: data.invitedEmail,
      invitedName: data.invitedName || '',
      status: 'pendente',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      createdBy: context.auth?.uid,
      ipAddress: context.rawRequest?.ip || 'unknown'
    });

    // Enviar email de convite
    await enviarEmailConvite({
      conviteId: conviteRef.id,
      teamName: data.teamName,
      captainName: data.captainName,
      invitedEmail: data.invitedEmail,
      invitedName: data.invitedName || 'Atleta'
    });

    logger.business('Convite de time enviado', {
      conviteId: conviteRef.id,
      teamId: data.teamId,
      invitedEmail: data.invitedEmail
    }, contextData);

    return {
      success: true,
      conviteId: conviteRef.id,
      message: 'Convite enviado com sucesso'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar convite de time', { error: errorMessage }, contextData);
    throw error;
  }
});

// Função para responder a convite
export const responderConviteTime = functions.https.onCall(async (request) => {
  const data = request.data;
  const context = request;
  const contextData = { userId: context.auth?.uid };
  
  try {
    // Validar dados
    if (!data.conviteId || !data.resposta || !data.userId || !data.userName) {
      throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios ausentes');
    }

    // Verificar se o usuário é o convidado
    if (context.auth?.uid !== data.userId) {
      throw new functions.https.HttpsError('permission-denied', 'Apenas o convidado pode responder ao convite');
    }

    // Buscar convite
    const conviteRef = db.collection('convites_times').doc(data.conviteId);
    const conviteDoc = await conviteRef.get();

    if (!conviteDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Convite não encontrado');
    }

    const conviteData = conviteDoc.data();
    if (!conviteData) {
      throw new functions.https.HttpsError('internal', 'Dados do convite inválidos');
    }

    // Verificar se o convite ainda é válido
    if (conviteData.status !== 'pendente') {
      throw new functions.https.HttpsError('failed-precondition', 'Convite já foi respondido');
    }

    if (conviteData.expiresAt && (conviteData.expiresAt?.toDate ? conviteData.expiresAt.toDate() : new Date(conviteData.expiresAt)) < new Date()) {
      throw new functions.https.HttpsError('failed-precondition', 'Convite expirado');
    }

    // Atualizar status do convite
    await conviteRef.update({
      status: data.resposta,
      respondedAt: admin.firestore.FieldValue.serverTimestamp(),
      respondedBy: context.auth?.uid
    });

    if (data.resposta === 'aceito') {
      // Adicionar usuário ao time
      const teamRef = db.collection('teams').doc(conviteData.teamId);
      await teamRef.update({
        atletas: admin.firestore.FieldValue.arrayUnion(data.userId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Enviar email de confirmação para o capitão
      await enviarEmailConfirmacaoConvite({
        teamName: conviteData.teamName,
        captainEmail: conviteData.captainEmail,
        captainName: conviteData.captainName,
        invitedName: data.userName,
        resposta: 'aceito'
      });
    } else {
      // Enviar email de recusa para o capitão
      await enviarEmailConfirmacaoConvite({
        teamName: conviteData.teamName,
        captainEmail: conviteData.captainEmail,
        captainName: conviteData.captainName,
        invitedName: data.userName,
        resposta: 'recusado'
      });
    }

    logger.business('Convite de time respondido', {
      conviteId: data.conviteId,
      resposta: data.resposta,
      teamId: conviteData.teamId
    }, contextData);

    return {
      success: true,
      message: `Convite ${data.resposta === 'aceito' ? 'aceito' : 'recusado'} com sucesso`
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao responder convite de time', { error: errorMessage }, contextData);
    throw error;
  }
});

// Função para listar convites do usuário
export const listarConvitesUsuario = functions.https.onCall(async (request) => {
  const data = request.data;
  const context = request;
  const contextData = { userId: context.auth?.uid };
  
  try {
    if (!data.userId) {
      throw new functions.https.HttpsError('invalid-argument', 'UserId obrigatório');
    }

    // Verificar se o usuário está consultando seus próprios convites
    if (context.auth?.uid !== data.userId) {
      throw new functions.https.HttpsError('permission-denied', 'Apenas o próprio usuário pode consultar seus convites');
    }

    // Buscar convites pendentes para o usuário
    const convitesSnapshot = await db.collection('convites_times')
      .where('invitedEmail', '==', context.auth?.token.email)
      .where('status', '==', 'pendente')
      .orderBy('createdAt', 'desc')
      .get();

    const convites = convitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    logger.business('Convites do usuário consultados', {
      userId: data.userId,
      quantidade: convites.length
    }, contextData);

    return {
      success: true,
      convites
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao listar convites do usuário', { error: errorMessage }, contextData);
    throw error;
  }
});

// Função para cancelar convite (apenas capitão)
export const cancelarConviteTime = functions.https.onCall(async (request) => {
  const data = request.data;
  const context = request;
  const contextData = { userId: context.auth?.uid };
  
  try {
    if (!data.conviteId) {
      throw new functions.https.HttpsError('invalid-argument', 'ConviteId obrigatório');
    }

    // Buscar convite
    const conviteRef = db.collection('convites_times').doc(data.conviteId);
    const conviteDoc = await conviteRef.get();

    if (!conviteDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Convite não encontrado');
    }

    const conviteData = conviteDoc.data();
    if (!conviteData) {
      throw new functions.https.HttpsError('internal', 'Dados do convite inválidos');
    }

    // Verificar se o usuário é o capitão
    if (context.auth?.uid !== conviteData.captainId) {
      throw new functions.https.HttpsError('permission-denied', 'Apenas o capitão pode cancelar o convite');
    }

    // Verificar se o convite ainda está pendente
    if (conviteData.status !== 'pendente') {
      throw new functions.https.HttpsError('failed-precondition', 'Convite já foi respondido');
    }

    // Cancelar convite
    await conviteRef.update({
      status: 'cancelado',
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      canceledBy: context.auth?.uid
    });

    logger.business('Convite de time cancelado', {
      conviteId: data.conviteId,
      teamId: conviteData.teamId
    }, contextData);

    return {
      success: true,
      message: 'Convite cancelado com sucesso'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao cancelar convite de time', { error: errorMessage }, contextData);
    throw error;
  }
});

// Função para enviar email de convite
async function enviarEmailConvite(data: {
  conviteId: string;
  teamName: string;
  captainName: string;
  invitedEmail: string;
  invitedName: string;
}) {
  const contextData = { userId: undefined };
  
  try {
    const subject = `Convite para Time - ${data.teamName} | Interbox 2025`;
    // (HTML do email gerado, mas não usado enquanto não houver envio real)
    logger.business('Email de convite de time gerado', {
      conviteId: data.conviteId,
      invitedEmail: data.invitedEmail,
      subject
    }, contextData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de convite', { error: errorMessage }, contextData);
  }
}

// Função para enviar email de confirmação de convite
async function enviarEmailConfirmacaoConvite(data: {
  teamName: string;
  captainEmail: string;
  captainName: string;
  invitedName: string;
  resposta: 'aceito' | 'recusado';
}) {
  const contextData = { userId: undefined };
  
  try {
    const subject = `Resposta ao Convite - ${data.teamName} | Interbox 2025`;
    // (HTML do email gerado, mas não usado enquanto não houver envio real)
    logger.business('Email de confirmação de convite gerado', {
      captainEmail: data.captainEmail,
      resposta: data.resposta,
      subject
    }, contextData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de confirmação de convite', { error: errorMessage }, contextData);
  }
} 