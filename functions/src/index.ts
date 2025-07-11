// Firebase Functions - CERRADØ INTERBOX 2025
import admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/auth';

import { authenticateUser } from './legacy/middleware/auth';
import { criarInscricaoTime } from './legacy/pedidos';
import { validaAudiovisual, criarInscricaoAudiovisual } from './legacy/audiovisual';
import { enviaEmailConfirmacao } from './legacy/emails';
import { 
  enviarConviteTime, 
  responderConviteTime, 
  listarConvitesUsuario, 
  cancelarConviteTime 
} from './legacy/teams';


import { nextjsServer } from './nextjs-server';

import * as functionsV1 from 'firebase-functions/v1';

if (!admin.apps.length) {
  admin.initializeApp();
}

// =====================================
// EXPORTAÇÕES DE CLOUD FUNCTIONS
// =====================================

// Funções de autenticação
export { authenticateUser };

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



// Exportar servidor Next.js
export { nextjsServer };

// Trigger quando usuário é criado
export const onUserCreated = functionsV1.auth.user().onCreate(async (user: UserRecord) => {
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
      cidade: '',
      box: '',
      whatsapp: '',
      telefone: '',
      categoria: 'atleta',
      mensagem: '',
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

    console.log('✅ Usuário criado com sucesso:', { uid, email, displayName });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao criar usuário:', errorMessage);
  }
}); 