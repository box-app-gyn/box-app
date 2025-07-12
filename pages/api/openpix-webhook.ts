import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const db = getFirestore();
    console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));
    
    const { status, correlationID, charge } = req.body;
    
    if (!correlationID) {
      return res.status(400).json({ error: 'correlationID ausente' });
    }

    if (status === 'COMPLETED') {
      const teamRef = doc(db, 'teams', correlationID);
      const teamDoc = await getDoc(teamRef);
      const audiovisualRef = doc(db, 'audiovisual', correlationID);
      const audiovisualDoc = await getDoc(audiovisualRef);

      if (teamDoc.exists()) {
        await updateDoc(teamRef, {
          statusPagamento: 'paid',
          updatedAt: new Date(),
          paidAt: new Date(),
          paymentMethod: 'card'
        });
        console.log(`Pagamento confirmado para time: ${correlationID}`);
      } else if (audiovisualDoc.exists()) {
        await updateDoc(audiovisualRef, {
          statusPagamento: 'paid',
          updatedAt: new Date(),
          paidAt: new Date(),
          paymentMethod: 'card'
        });
        console.log(`Pagamento confirmado para audiovisual: ${correlationID}`);
      } else {
        await setDoc(
          doc(db, 'pagamentos', correlationID),
          {
            status: 'paid',
            updatedAt: new Date(),
            paidAt: new Date(),
            paymentMethod: 'card',
            correlationID,
            chargeData: charge
          },
          { merge: true }
        );
        console.log(`Pagamento genérico confirmado: ${correlationID}`);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno', details: error instanceof Error ? error.message : error });
  }
} 