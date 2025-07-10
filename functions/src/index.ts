// Firebase Functions - CERRADØ INTERBOX 2025
import * as functions from 'firebase-functions/v2';
import admin from 'firebase-admin';

import { authenticateUser } from './legacy/middleware/auth';

import { nextjsServer } from './nextjs-server';
import { onUserCreated as onUserCreatedV2 } from 'firebase-functions/v2/identity';
import * as functionsV1 from 'firebase-functions/v1';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Exportar funções existentes
export { authenticateUser };

// Exportar servidor Next.js
export { nextjsServer };

// Função temporária para testar deploy
export const testFunction = functions.https.onRequest((request, response) => {
  response.json({ message: 'Função temporária funcionando!' });
});

// Trigger quando usuário é criado
export const onUserCreated = functionsV1.auth.user().onCreate(async (user) => {
  try {
    const { uid, email, displayName, photoURL } = user;
    await admin.firestore().collection('users').doc(uid).set({
      email,
      displayName,
      photoURL,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao criar usuário no Firestore:', error);
  }
}); 