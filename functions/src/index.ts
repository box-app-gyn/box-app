// Firebase Functions - CERRADØ INTERBOX 2025
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { sendMessageFunction } from './legacy/chat';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Exportar apenas a função de chat que existe
export { sendMessageFunction };

// Função temporária para testar deploy
export const testFunction = functions.https.onRequest((req, res) => {
  res.json({ message: 'Função temporária funcionando!' });
}); 