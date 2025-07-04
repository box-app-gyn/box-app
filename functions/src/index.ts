// /functions/src/temp-index.ts
// Arquivo temporário para deploy sem a função onUserCreated

import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Função temporária para testar deploy
export const testFunction = functions.https.onRequest((req, res) => {
  res.json({ message: 'Função temporária funcionando!' });
}); 