import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import { processFlowPayWebhook } from './flowpay/webhook';

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(express.json());

app.post('/flowpay/webhook', async (req, res) => {
  try {
    await processFlowPayWebhook(req, res, db);
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).send('Erro interno');
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

exports.api = functions.https.onRequest(app); 