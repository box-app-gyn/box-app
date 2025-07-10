// Firebase Functions - CERRADØ INTERBOX 2025
import * as functions from 'firebase-functions';
import { authenticateUser } from './legacy/middleware/auth';

import { nextjsServer } from './nextjs-server';

// Exportar funções existentes
export { authenticateUser };

// Exportar servidor Next.js
export { nextjsServer };

// Função temporária para testar deploy
export const testFunction = functions.https.onRequest((req, res) => {
  res.json({ message: 'Função temporária funcionando!' });
}); 