"use strict";
// Sistema de logging para Cloud Functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createRequestContext = createRequestContext;
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4,
};
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production'
    ? LOG_LEVELS.INFO
    : LOG_LEVELS.DEBUG;
class Logger {
    formatMessage(entry) {
        const { timestamp, level, message, userId, requestId, ip } = entry;
        let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        if (userId)
            formatted += ` | User: ${userId}`;
        if (requestId)
            formatted += ` | Request: ${requestId}`;
        if (ip)
            formatted += ` | IP: ${ip}`;
        return formatted;
    }
    shouldLog(level) {
        return LOG_LEVELS[level] >= CURRENT_LOG_LEVEL;
    }
    log(level, message, data, context) {
        if (!this.shouldLog(level))
            return;
        const entry = Object.assign({ timestamp: new Date().toISOString(), level,
            message,
            data }, context);
        const formattedMessage = this.formatMessage(entry);
        switch (level) {
            case 'DEBUG':
                if (process.env.NODE_ENV !== 'production') {
                    console.debug(formattedMessage, data || '');
                }
                break;
            case 'INFO':
                console.info(formattedMessage, data || '');
                break;
            case 'WARN':
                console.warn(formattedMessage, data || '');
                break;
            case 'ERROR':
            case 'FATAL':
                console.error(formattedMessage, data || '');
                break;
        }
        // Em produção, enviar logs críticos para serviço externo
        if (process.env.NODE_ENV === 'production' && level === 'FATAL') {
            this.sendToExternalService(entry);
        }
    }
    async sendToExternalService(entry) {
        // Implementar integração com serviço de logging externo
        // Ex: Sentry, LogRocket, etc.
        try {
            // await externalLoggingService.send(entry);
        }
        catch (error) {
            console.error('Falha ao enviar log para serviço externo:', error);
        }
    }
    debug(message, data, context) {
        this.log('DEBUG', message, data, context);
    }
    info(message, data, context) {
        this.log('INFO', message, data, context);
    }
    warn(message, data, context) {
        this.log('WARN', message, data, context);
    }
    error(message, error, context) {
        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack, name: error.name }
            : error;
        this.log('ERROR', message, errorData, context);
    }
    fatal(message, error, context) {
        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack, name: error.name }
            : error;
        this.log('FATAL', message, errorData, context);
    }
    // Método para logging de operações de negócio
    business(operation, details, context) {
        this.info(`Business Operation: ${operation}`, details, context);
    }
    // Método para logging de segurança
    security(event, details, context) {
        this.warn(`Security Event: ${event}`, details, context);
    }
}
exports.logger = new Logger();
// Função helper para criar contexto de request
function createRequestContext(req) {
    var _a, _b, _c;
    return {
        userId: (_a = req === null || req === void 0 ? void 0 : req.auth) === null || _a === void 0 ? void 0 : _a.uid,
        requestId: ((_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b['x-request-id']) || Math.random().toString(36).substr(2, 9),
        ip: (req === null || req === void 0 ? void 0 : req.ip) || ((_c = req === null || req === void 0 ? void 0 : req.connection) === null || _c === void 0 ? void 0 : _c.remoteAddress),
    };
}
//# sourceMappingURL=logger.js.map