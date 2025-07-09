import { onRequest } from 'firebase-functions/v2/https';
import { NextRequest, NextResponse } from 'next/server';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: '.next' } });
const handle = app.getRequestHandler();

export const nextjsServer = onRequest(async (req, res) => {
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
    
    // Preparar o app Next.js
    await app.prepare();
    
    // Criar request/response compatíveis com Next.js
    const nextReq = new NextRequest(req.url || '', {
      method: req.method,
      headers: req.headers as any,
      body: req.body
    });
    
    // Processar com Next.js
    const nextRes = await handle(nextReq, {
      statusCode: 200,
      headers: new Headers(),
      body: null
    });
    
    // Copiar headers da resposta Next.js
    nextRes.headers.forEach((value, key) => {
      res.set(key, value);
    });
    
    // Enviar resposta
    res.status(nextRes.status).send(nextRes.body);
    
  } catch (error) {
    console.error('[NextJS Server] Erro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}); 