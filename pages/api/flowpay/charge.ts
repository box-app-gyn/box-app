import { NextApiRequest, NextApiResponse } from 'next';
import { FlowPayAPI } from '../../../interbox-flowpay/backend/functions/src/flowpay/api';

const config = {
  apiKey: process.env.OPENPIX_API_KEY || '',
  baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { correlationID, value, comment } = req.body;

    if (!correlationID || !value) {
      return res.status(400).json({ error: 'correlationID e value são obrigatórios' });
    }

    if (!config.apiKey) {
      return res.status(500).json({ error: 'OPENPIX_API_KEY não configurada' });
    }

    const api = new FlowPayAPI(config);
    const charge = await api.createCharge({
      correlationID,
      value,
      comment
    });

    return res.status(200).json(charge);
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 