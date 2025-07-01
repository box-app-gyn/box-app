"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChatRequest = validateChatRequest;
exports.validateFeedbackRequest = validateFeedbackRequest;
exports.validateSessionRequest = validateSessionRequest;
function validateChatRequest(body) {
    const errors = [];
    // Validar mensagem
    if (!body.message || typeof body.message !== 'string') {
        errors.push('Mensagem é obrigatória e deve ser uma string');
    }
    else if (body.message.trim().length === 0) {
        errors.push('Mensagem não pode estar vazia');
    }
    else if (body.message.length > 1000) {
        errors.push('Mensagem muito longa (máximo 1000 caracteres)');
    }
    // Validar userId (opcional, pode ser anonymous)
    if (body.userId && typeof body.userId !== 'string') {
        errors.push('userId deve ser uma string');
    }
    // Validar sessionId (opcional)
    if (body.sessionId && typeof body.sessionId !== 'string') {
        errors.push('sessionId deve ser uma string');
    }
    // Validar context (opcional)
    if (body.context && typeof body.context !== 'string') {
        errors.push('context deve ser uma string');
    }
    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
}
function validateFeedbackRequest(body) {
    const errors = [];
    // Validar sessionId
    if (!body.sessionId || typeof body.sessionId !== 'string') {
        errors.push('sessionId é obrigatório e deve ser uma string');
    }
    // Validar messageId
    if (!body.messageId || typeof body.messageId !== 'string') {
        errors.push('messageId é obrigatório e deve ser uma string');
    }
    // Validar rating
    if (!body.rating || typeof body.rating !== 'number') {
        errors.push('rating é obrigatório e deve ser um número');
    }
    else if (body.rating < 1 || body.rating > 5) {
        errors.push('rating deve estar entre 1 e 5');
    }
    // Validar feedback (opcional)
    if (body.feedback && typeof body.feedback !== 'string') {
        errors.push('feedback deve ser uma string');
    }
    else if (body.feedback && body.feedback.length > 500) {
        errors.push('feedback muito longo (máximo 500 caracteres)');
    }
    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
}
function validateSessionRequest(body) {
    const errors = [];
    // Validar context (opcional)
    if (body.context && typeof body.context !== 'string') {
        errors.push('context deve ser uma string');
    }
    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
    };
}
//# sourceMappingURL=validation.js.map