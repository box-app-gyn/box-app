import { NextApiRequest, NextApiResponse } from 'next';
import { FlowPayAPI } from '../../../../interbox-flowpay/backend/functions/src/flowpay/api';

const config = {
  apiKey: process.env.OPENPIX_API_KEY || '',
  baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID é obrigatório' });
    }

    if (!config.apiKey) {
      return res.status(500).json({ error: 'OPENPIX_API_KEY não configurada' });
    }

    const api = new FlowPayAPI(config);
    const status = await api.getChargeStatus(id);

    return res.status(200).json(status);
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
} 