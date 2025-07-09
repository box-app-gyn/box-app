"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = authenticateUser;
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const logger_1 = require("../utils/logger");
// Cache para tokens verificados (evita verificações repetidas)
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const AUTH_TIMEOUT = 10000; // 10 segundos
// Função para limpar cache expirado
function cleanupTokenCache() {
    const now = Date.now();
    for (const [token, data] of tokenCache.entries()) {
        if (now > data.expires) {
            tokenCache.delete(token);
        }
    }
}
// Limpar cache a cada 5 minutos
setInterval(cleanupTokenCache, CACHE_TTL);
async function authenticateUser(req) {
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
            logger_1.logger.info('Token encontrado no cache', {
                uid: cached.user.uid,
                email: cached.user.email
            });
            return cached.user;
        }
        // Verificar token com timeout
        const decodedToken = await Promise.race([
            firebase_admin_1.default.auth().verifyIdToken(token),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout na verificação do token')), AUTH_TIMEOUT))
        ]);
        // Armazenar no cache
        tokenCache.set(token, {
            user: decodedToken,
            expires: Date.now() + CACHE_TTL
        });
        logger_1.logger.info('Usuário autenticado', {
            uid: decodedToken.uid,
            email: decodedToken.email
        });
        return decodedToken;
    }
    catch (error) {
        logger_1.logger.warn('Erro na autenticação:', error);
        return null;
    }
}
function requireAuth(req, res, next) {
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
        logger_1.logger.error('Erro na autenticação:', error);
        res.status(500).json({
            error: 'Erro interno na autenticação',
            message: error.message
        });
    });
}
function optionalAuth(req, res, next) {
    authenticateUser(req)
        .then(user => {
        req.user = user;
        next();
    })
        .catch(error => {
        logger_1.logger.error('Erro na autenticação opcional:', error);
        req.user = null;
        next();
    });
}
//# sourceMappingURL=auth.js.map