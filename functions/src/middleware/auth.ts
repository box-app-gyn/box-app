import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

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

    const decodedToken = await admin.auth().verifyIdToken(token);
    
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
  authenticateUser(req).then(user => {
    if (!user) {
      res.status(401).json({ 
        error: 'Não autorizado',
        message: 'Token de autenticação inválido ou ausente'
      });
      return;
    }
    
    req.user = user;
    next();
  }).catch(error => {
    logger.error('Erro na autenticação:', error);
    res.status(500).json({ 
      error: 'Erro interno na autenticação',
      message: error.message
    });
  });
}

export function optionalAuth(req: any, res: any, next: any): void {
  authenticateUser(req).then(user => {
    req.user = user;
    next();
  }).catch(error => {
    logger.error('Erro na autenticação opcional:', error);
    req.user = null;
    next();
  });
} 