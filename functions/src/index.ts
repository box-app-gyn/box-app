// Firebase Functions - CERRADØ INTERBOX 2025
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

// Importar functions do chat
import { sendMessage, getChatHistory, saveFeedback, createSession, pollMessages } from './legacy/chat';

if (!admin.apps.length) {
  admin.initializeApp();
}

// Exportar functions do chat com nomes corretos para o frontend
export const sendMessageFunction = sendMessage;
export const getChatHistoryFunction = getChatHistory;
export const saveFeedbackFunction = saveFeedback;
export const createSessionFunction = createSession;
export const pollMessagesFunction = pollMessages;

// Função temporária para testar deploy
export const testFunction = functions.https.onRequest((req, res) => {
  res.json({ message: 'Função temporária funcionando!' });
}); 