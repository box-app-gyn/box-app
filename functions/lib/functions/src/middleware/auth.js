"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = authenticateUser;
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const admin = __importStar(require("firebase-admin"));
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
            admin.auth().verifyIdToken(token),
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