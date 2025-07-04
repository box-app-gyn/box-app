import { SECURITY_UTILS } from '../../../constants/security';

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  sanitizedData?: any;
}

// Função para sanitizar e validar string
function sanitizeAndValidateString(value: any, fieldName: string, maxLength: number = 1000): { isValid: boolean; error?: string; sanitized?: string } {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} é obrigatório e deve ser uma string` };
  }
  
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: `${fieldName} não pode estar vazio` };
  }
  
  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} muito longo (máximo ${maxLength} caracteres)` };
  }
  
  // Verificar padrões suspeitos
  if (SECURITY_UTILS.containsSuspiciousPattern(trimmed)) {
    return { isValid: false, error: `${fieldName} contém conteúdo suspeito` };
  }
  
  // Sanitizar string
  const sanitized = SECURITY_UTILS.sanitizeString(trimmed, maxLength);
  
  return { isValid: true, sanitized };
}

export function validateChatRequest(body: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validar mensagem
  const messageValidation = sanitizeAndValidateString(body.message, 'Mensagem', 500);
  if (!messageValidation.isValid) {
    errors.push(messageValidation.error!);
  } else {
    sanitizedData.message = messageValidation.sanitized;
  }

  // Validar userId (opcional, pode ser anonymous)
  if (body.userId) {
    const userIdValidation = sanitizeAndValidateString(body.userId, 'userId', 100);
    if (!userIdValidation.isValid) {
      errors.push(userIdValidation.error!);
    } else {
      sanitizedData.userId = userIdValidation.sanitized;
    }
  } else {
    sanitizedData.userId = 'anonymous';
  }

  // Validar sessionId (opcional)
  if (body.sessionId) {
    const sessionIdValidation = sanitizeAndValidateString(body.sessionId, 'sessionId', 100);
    if (!sessionIdValidation.isValid) {
      errors.push(sessionIdValidation.error!);
    } else {
      sanitizedData.sessionId = sessionIdValidation.sanitized;
    }
  }

  // Validar context (opcional)
  if (body.context) {
    if (typeof body.context === 'string') {
      const contextValidation = sanitizeAndValidateString(body.context, 'context', 2000);
      if (!contextValidation.isValid) {
        errors.push(contextValidation.error!);
      } else {
        sanitizedData.context = contextValidation.sanitized;
      }
    } else if (typeof body.context === 'object') {
      // Validar objeto de contexto
      try {
        const contextStr = JSON.stringify(body.context);
        if (contextStr.length > 2000) {
          errors.push('context muito longo (máximo 2000 caracteres)');
        } else {
          sanitizedData.context = body.context;
        }
      } catch {
        errors.push('context deve ser um objeto válido');
      }
    } else {
      errors.push('context deve ser uma string ou objeto');
    }
  }

  // Validar rate limiting adicional
  if (body.message && body.message.length > 100) {
    // Mensagens longas têm rate limit mais restritivo
    // Esta validação será feita no controller
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

export function validateFeedbackRequest(body: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validar sessionId
  const sessionIdValidation = sanitizeAndValidateString(body.sessionId, 'sessionId', 100);
  if (!sessionIdValidation.isValid) {
    errors.push(sessionIdValidation.error!);
  } else {
    sanitizedData.sessionId = sessionIdValidation.sanitized;
  }

  // Validar messageId
  const messageIdValidation = sanitizeAndValidateString(body.messageId, 'messageId', 100);
  if (!messageIdValidation.isValid) {
    errors.push(messageIdValidation.error!);
  } else {
    sanitizedData.messageId = messageIdValidation.sanitized;
  }

  // Validar rating
  if (!body.rating || typeof body.rating !== 'number') {
    errors.push('rating é obrigatório e deve ser um número');
  } else if (body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating)) {
    errors.push('rating deve ser um número inteiro entre 1 e 5');
  } else {
    sanitizedData.rating = body.rating;
  }

  // Validar feedback (opcional)
  if (body.feedback) {
    const feedbackValidation = sanitizeAndValidateString(body.feedback, 'feedback', 500);
    if (!feedbackValidation.isValid) {
      errors.push(feedbackValidation.error!);
    } else {
      sanitizedData.feedback = feedbackValidation.sanitized;
    }
  }

  // Validar userId (opcional)
  if (body.userId) {
    const userIdValidation = sanitizeAndValidateString(body.userId, 'userId', 100);
    if (!userIdValidation.isValid) {
      errors.push(userIdValidation.error!);
    } else {
      sanitizedData.userId = userIdValidation.sanitized;
    }
  } else {
    sanitizedData.userId = 'anonymous';
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

export function validateSessionRequest(body: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validar context (opcional)
  if (body.context) {
    if (typeof body.context === 'string') {
      const contextValidation = sanitizeAndValidateString(body.context, 'context', 2000);
      if (!contextValidation.isValid) {
        errors.push(contextValidation.error!);
      } else {
        sanitizedData.context = contextValidation.sanitized;
      }
    } else if (typeof body.context === 'object') {
      try {
        const contextStr = JSON.stringify(body.context);
        if (contextStr.length > 2000) {
          errors.push('context muito longo (máximo 2000 caracteres)');
        } else {
          sanitizedData.context = body.context;
        }
      } catch {
        errors.push('context deve ser um objeto válido');
      }
    } else {
      errors.push('context deve ser uma string ou objeto');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
} 