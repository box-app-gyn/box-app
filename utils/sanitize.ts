import DOMPurify from 'isomorphic-dompurify';

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
  allowDataAttributes?: boolean;
  allowUnknownProtocols?: boolean;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'mark',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'td', 'th',
    'div', 'span'
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'div': ['class', 'id'],
    'span': ['class', 'id'],
    'p': ['class'],
    'h1': ['class'], 'h2': ['class'], 'h3': ['class'],
    'h4': ['class'], 'h5': ['class'], 'h6': ['class'],
    'ul': ['class'], 'ol': ['class'], 'li': ['class'],
    'table': ['class'], 'thead': ['class'], 'tbody': ['class'],
    'tr': ['class'], 'td': ['class'], 'th': ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowDataAttributes: false,
  allowUnknownProtocols: false
};

export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: config.allowedTags,
    ALLOWED_ATTR: config.allowedAttributes,
    ALLOWED_URI_REGEXP: new RegExp(
      `^(${config.allowedSchemes?.join('|')}):`,
      'i'
    ),
    ALLOW_DATA_ATTR: config.allowDataAttributes,
    ALLOW_UNKNOWN_PROTOCOLS: config.allowUnknownProtocols,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    RETURN_TRUSTED_TYPE: false
  });
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const cleanUrl = url.trim();
  
  if (!cleanUrl.match(/^https?:\/\//) && !cleanUrl.match(/^mailto:/) && !cleanUrl.match(/^tel:/)) {
    return '';
  }

  try {
    const urlObj = new URL(cleanUrl);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol)) {
      return '';
    }
    return cleanUrl;
  } catch {
    return '';
  }
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(cleanEmail) ? cleanEmail : '';
}

export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  return phone.replace(/[^\d+\-\(\)\s]/g, '').trim();
}

export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .replace(/[<>]/g, '')
    .replace(/[^\w\sÀ-ÿ]/g, '')
    .trim()
    .substring(0, 100);
}

export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export function validateAndSanitizeInput(input: any, type: 'text' | 'email' | 'url' | 'phone' | 'name' | 'html'): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  switch (type) {
    case 'email':
      return sanitizeEmail(input);
    case 'url':
      return sanitizeUrl(input);
    case 'phone':
      return sanitizePhone(input);
    case 'name':
      return sanitizeName(input);
    case 'html':
      return sanitizeHtml(input);
    case 'text':
    default:
      return sanitizeText(input);
  }
} 