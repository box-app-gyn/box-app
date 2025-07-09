import admin from 'firebase-admin';
import { logger } from '../utils/logger';

// Cache para tokens verificados (evita verificações repetidas)
const tokenCache = new Map<string, { user: admin.auth.DecodedIdToken; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const AUTH_TIMEOUT = 10000; // 10 segundos

// Função para limpar cache expirado
function cleanupTokenCache(): void {
  const now = Date.now();
  for (const [token, data] of tokenCache.entries()) {
    if (now > data.expires) {
      tokenCache.delete(token);
    }
  }
}

// Limpar cache a cada 5 minutos
setInterval(cleanupTokenCache, CACHE_TTL);

export async function authenticateUser(req: any): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return null;
    }

    // Verificar cache primeiro
    const cached = tokenCache.get(token);
    if (cached && Date.now() < cached.expires) {
      logger.info('Token encontrado no cache', { 
        uid: cached.user.uid, 
        email: cached.user.email 
      });
      return cached.user;
    }

    // Verificar token com timeout
    const decodedToken = await Promise.race([
      admin.auth().verifyIdToken(token),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout na verificação do token')), AUTH_TIMEOUT)
      )
    ]);
    
    // Armazenar no cache
    tokenCache.set(token, {
      user: decodedToken,
      expires: Date.now() + CACHE_TTL
    });
    
    logger.info('Usuário autenticado', { 
      uid: decodedToken.uid, 
      email: decodedToken.email 
    });

    return decodedToken;

  } catch (error) {
    logger.warn('Erro na autenticação:', error);
    return null;
  }
}

export function requireAuth(req: any, res: any, next: any): void {
  authenticateUser(req)
    .then(user => {
      if (!user) {
        res.status(401).json({ 
          error: 'Não autorizado',
          message: 'Token de autenticação inválido ou ausente'
        });
        return;
      }
      
      req.user = user;
      next();
    })
    .catch(error => {
      logger.error('Erro na autenticação:', error);
      res.status(500).json({ 
        error: 'Erro interno na autenticação',
        message: error.message
      });
    });
}

export function optionalAuth(req: any, res: any, next: any): void {
  authenticateUser(req)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      logger.error('Erro na autenticação opcional:', error);
      req.user = null;
      next();
    });
} 