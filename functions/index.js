import functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(express.json());

app.post('/flowpay/webhook', async (req, res) => {
  try {
    console.log('Payload recebido:', JSON.stringify(req.body, null, 2));

    // Tente pegar a referência do time (ajuste conforme o payload real)
    const ref =
      req.body?.charge?.reference ||
      req.body?.reference ||
      req.body?.custom_id ||
      null;

    if (!ref) {
      return res.status(400).send('Referência não encontrada no payload');
    }

    await db.collection('teams').doc(ref).update({
      statusPagamento: 'paid',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(200).send('OK');
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).send('Erro interno');
  }
});

exports.api = functions.https.onRequest(app);
