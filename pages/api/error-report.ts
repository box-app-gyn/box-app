import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { errors, totalErrors, lastError } = req.body;

    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({ error: 'Invalid error data' });
    }

    const errorReport = {
      timestamp: new Date().toISOString(),
      totalErrors,
      lastError,
      errors: errors.slice(0, 10), // Limitar a 10 erros por relatório
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      url: req.headers.referer
    };

    // Log do erro para monitoramento
    logger.error('Error report received:', errorReport);

    // Em produção, você pode enviar para serviços como:
    // - Sentry
    // - LogRocket
    // - Firebase Crashlytics
    // - Custom monitoring service

    // Por enquanto, apenas logamos e retornamos sucesso
    console.error('=== ERROR REPORT ===');
    console.error('Total Errors:', totalErrors);
    console.error('Last Error:', lastError);
    console.error('User Agent:', req.headers['user-agent']);
    console.error('IP:', req.headers['x-forwarded-for'] || req.socket.remoteAddress);
    console.error('===================');

    res.status(200).json({ 
      success: true, 
      message: 'Error report received',
      reportedErrors: errors.length
    });

  } catch (error) {
    logger.error('Error processing error report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 