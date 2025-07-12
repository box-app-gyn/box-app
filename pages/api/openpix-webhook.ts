import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { status, correlationID } = req.body;
    if (!correlationID) {
      return res.status(400).json({ error: 'correlationID ausente' });
    }
    if (status === 'COMPLETED') {
      await setDoc(
        doc(db, 'pagamentos', correlationID),
        { status: 'pago', updatedAt: new Date() },
        { merge: true }
      );
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno', details: error instanceof Error ? error.message : error });
  }
} 