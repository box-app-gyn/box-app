// /functions/src/user-created.ts
import * as functions from 'firebase-functions/v1';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Trigger quando usuário é criado
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
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