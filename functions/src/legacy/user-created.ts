// /functions/src/user-created.ts
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Trigger quando usuário é criado
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
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