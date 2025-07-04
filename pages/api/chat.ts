import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(501).json({ error: 'Chat desativado. Vertex AI não está mais disponível.' });
}

/*
// CÓDIGO ORIGINAL COMENTADO
import { chatWithCerradoAI, analyzeAudiovisualProfile } from '@/lib/vertex-ai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, message, chatHistory, profile } = req.body;

    // Rate limiting básico
    // Aqui você pode implementar rate limiting com Redis ou similar
    // Por enquanto, vamos apenas validar os dados

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    switch (action) {
      case 'chat':
        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        // Validação de tamanho da mensagem
        if (message.length > 500) {
          return res.status(400).json({ error: 'Message too long' });
        }

        const chatResponse = await chatWithCerradoAI(message, chatHistory || []);
        
        return res.status(200).json({
          success: true,
          data: chatResponse,
        });

      case 'analyze_profile':
        if (!profile) {
          return res.status(400).json({ error: 'Profile is required' });
        }

        const analysisResponse = await analyzeAudiovisualProfile(profile);
        
        return res.status(200).json({
          success: true,
          data: analysisResponse,
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Desculpe, estou com dificuldades técnicas. Por favor, tente novamente ou entre em contato via WhatsApp.',
    });
  }
}
*/ 