import { onRequest } from 'firebase-functions/v2/https';
import { parse } from 'url';
import next from 'next';

// Sempre usar modo produção no Cloud Run
const app = next({ dev: false, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

export const nextjsServer = onRequest(async (req: any, res: any) => {
  try {
    const parsedUrl = parse(req.url || '', true);
    
    // Log da requisição
    console.log(`[NextJS Server] ${req.method} ${parsedUrl.pathname}`);
    
    // Configurar headers CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).send('');
      return;
    }
    
    // Processar com Next.js
    await handle(req, res);
    
  } catch (error) {
    console.error('[NextJS Server] Erro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}); 