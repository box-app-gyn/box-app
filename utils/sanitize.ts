import { SECURITY_UTILS } from '../constants/security';

// Tipos para melhor tipagem
type SanitizedObject = Record<string, unknown>;
type FormDataValue = string | number | boolean | unknown[] | Record<string, unknown> | null;

// Função principal de sanitização
export const sanitizeInput = (input: string, maxLength: number = 100): string => {
  if (typeof input !== 'string') return '';
  
  return SECURITY_UTILS.sanitizeString(input, maxLength);
};

// Sanitização específica para HTML
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/import\s+url/gi, '')
    .replace(/@import/gi, '');
};

// Sanitização para URLs
export const sanitizeUrl = (url: string): string => {
  if (typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  // Permitir apenas URLs HTTPS ou relativas
  if (trimmed.startsWith('http://')) {
    return '';
  }
  
  if (trimmed.startsWith('https://')) {
    try {
      const urlObj = new URL(trimmed);
      // Verificar domínios permitidos
      const allowedDomains = [
        'interbox.com.br',
        'flowpay.com.br',
        'firebaseapp.com',
        'googleapis.com',
        'chat.whatsapp.com',
        'www.google-analytics.com',
        'www.googletagmanager.com'
      ];
      
      if (allowedDomains.some(domain => urlObj.hostname.endsWith(domain))) {
        return trimmed;
      }
    } catch {
      return '';
    }
  }
  
  // Permitir URLs relativas ou âncoras
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  
  return '';
};

// Sanitização para emails
export const sanitizeEmail = (email: string): string => {
  if (typeof email !== 'string') return '';
  
  const trimmed = email.trim().toLowerCase();
  
  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return '';
  }
  
  // Verificar tamanho máximo
  if (trimmed.length > 254) {
    return '';
  }
  
  // Verificar padrões suspeitos
  if (SECURITY_UTILS.containsSuspiciousPattern(trimmed)) {
    return '';
  }
  
  return trimmed;
};

// Sanitização para números
export const sanitizeNumber = (value: unknown, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }
  
  return Math.max(min, Math.min(max, num));
};

// Sanitização para objetos
export const sanitizeObject = (obj: unknown, maxDepth: number = 3): unknown => {
  if (maxDepth <= 0) return null;
  
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (typeof obj !== 'object') {
    return sanitizeInput(String(obj));
  }
  
  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  const sanitized: SanitizedObject = {};
  const keys = Object.keys(obj as Record<string, unknown>).slice(0, 50); // Limitar número de propriedades
  
  for (const key of keys) {
    const sanitizedKey = sanitizeInput(key, 50);
    if (sanitizedKey) {
      sanitized[sanitizedKey] = sanitizeObject((obj as Record<string, unknown>)[key], maxDepth - 1);
    }
  }
  
  return sanitized;
};

// Sanitização para JSON
export const sanitizeJson = (jsonString: string): unknown => {
  if (typeof jsonString !== 'string') return null;
  
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch {
    return null;
  }
};

// Validação de senha
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  return SECURITY_UTILS.isValidPassword(password);
};

// Sanitização para nomes de usuário
export const sanitizeUsername = (username: string): string => {
  if (typeof username !== 'string') return '';
  
  return username
    .trim()
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9_-]/g, '') // Apenas letras, números, underscore e hífen
    .toLowerCase();
};

// Sanitização para telefones
export const sanitizePhone = (phone: string): string => {
  if (typeof phone !== 'string') return '';
  
  return phone
    .replace(/\D/g, '') // Apenas números
    .slice(0, 15); // Máximo 15 dígitos
};

// Função para validar e sanitizar dados de formulário
export const sanitizeFormData = (data: Record<string, FormDataValue>): Record<string, FormDataValue> => {
  const sanitized: Record<string, FormDataValue> = {};
  
  for (const [key, value] of Object.entries(data)) {
    const sanitizedKey = sanitizeInput(key, 50);
    
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeInput(value, 1000);
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumber(value);
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = Boolean(value);
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.slice(0, 10).map(item => 
        typeof item === 'string' ? sanitizeInput(item, 100) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeObject(value, 2) as FormDataValue;
    } else {
      sanitized[sanitizedKey] = value;
    }
  }
  
  return sanitized;
}; 