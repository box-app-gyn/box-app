import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { nome, email, valor, descricao } = JSON.parse(req.body);
    if (!nome || !email || !valor) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }

    const correlationID = uuidv4();
    const response = await fetch('https://api.openpix.com.br/api/openpix/charge', {
      method: 'POST',
      headers: {
        'Authorization': `App ${process.env.OPENPIX_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correlationID,
        value: valor,
        comment: descricao || 'Pagamento Cerrado Interbox',
        buyer: {
          name: nome,
          email: email
        },
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://interbox-app-8d400.web.app'}/api/openpix-webhook`
      })
    });

    const result = await response.json();
    if (!result.chargeUrl) {
      return res.status(500).json({ error: 'Erro ao criar cobrança', details: result });
    }
    res.status(200).json({ url: result.chargeUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno', details: error instanceof Error ? error.message : error });
  }
} 