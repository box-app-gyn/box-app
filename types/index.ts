// Tipos robustos com validação para o Cerrado App

// Tipos base com validação
export type ValidatedString<T extends string> = T;
export type ValidatedNumber<T extends number> = T;
export type ValidatedEmail = string & { readonly __brand: 'Email' };
export type ValidatedUrl = string & { readonly __brand: 'Url' };

// Constantes de validação
export const VALIDATION_LIMITS = {
  MAX_USERNAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 254,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_URL_LENGTH: 2048,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_QUANTIDADE: 10,
  MAX_VALOR_UNITARIO: 1000,
  MAX_VALOR_TOTAL: 5000,
} as const;

// Tipos de usuário
export type UserRole = 'user' | 'admin' | 'fotografo' | 'videomaker';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  email: ValidatedEmail;
  displayName: string;
  photoURL?: ValidatedUrl;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    allowContact: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

// Tipos de pedido
export type PedidoTipo = 'ingresso' | 'kit' | 'premium';
export type PedidoStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'refunded';

export interface Pedido {
  id: string;
  userId: string;
  userEmail: ValidatedEmail;
  userName: string;
  tipo: PedidoTipo;
  quantidade: ValidatedNumber<number>;
  valorUnitario: ValidatedNumber<number>;
  valorTotal: ValidatedNumber<number>;
  status: PedidoStatus;
  flowpayOrderId?: string;
  pixCode?: string;
  pixExpiration?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  ipAddress: string;
  paymentData?: PaymentData;
}

export interface PaymentData {
  method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
  provider: 'FlowPay' | 'Stripe' | 'PayPal';
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
}

// Tipos de fotógrafo/videomaker
export type FotografoTipo = 'fotografo' | 'videomaker';
export type FotografoStatus = 'pending' | 'approved' | 'rejected';

export interface Fotografo {
  id: string;
  userId: string;
  userEmail: ValidatedEmail;
  nome: string;
  tipo: FotografoTipo;
  status: FotografoStatus;
  portfolio?: ValidatedUrl[];
  experiencia: string;
  equipamentos: string[];
  redesSociais?: {
    instagram?: ValidatedUrl;
    facebook?: ValidatedUrl;
    linkedin?: ValidatedUrl;
    website?: ValidatedUrl;
  };
  aprovadoPor?: string;
  aprovadoEm?: Date;
  rejeitadoPor?: string;
  rejeitadoEm?: Date;
  motivoRejeicao?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de evento
export interface Evento {
  id: string;
  nome: string;
  descricao: string;
  dataInicio: Date;
  dataFim: Date;
  local: string;
  capacidade: number;
  ingressosVendidos: number;
  precoIngresso: ValidatedNumber<number>;
  precoKit: ValidatedNumber<number>;
  precoPremium: ValidatedNumber<number>;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  imagemUrl?: ValidatedUrl;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de log
export type LogAcao = 
  | 'criacao_pedido'
  | 'aprovacao_fotografo'
  | 'rejeicao_fotografo'
  | 'aprovacao_videomaker'
  | 'rejeicao_videomaker'
  | 'pagamento_confirmado'
  | 'pagamento_cancelado'
  | 'usuario_criado'
  | 'usuario_suspenso'
  | 'admin_login'
  | 'security_violation';

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: ValidatedEmail;
  acao: LogAcao;
  targetId?: string;
  targetType?: string;
  detalhes: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
}

// Tipos de configuração
export interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  flowpay: {
    apiKey: string;
    webhookSecret: string;
    baseUrl: string;
  };
  email: {
    user: string;
    password: string;
    from: string;
  };
  security: {
    jwtSecret: string;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
}

// Tipos de resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationRule<T> {
  validate: (value: T) => ValidationResult;
  message: string;
}

// Funções de validação
export function validateEmail(email: string): email is ValidatedEmail {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= VALIDATION_LIMITS.MAX_EMAIL_LENGTH;
}

export function validateUrl(url: string): url is ValidatedUrl {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && url.length <= VALIDATION_LIMITS.MAX_URL_LENGTH;
  } catch {
    return false;
  }
}

export function validateString(value: string, maxLength: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof value !== 'string') {
    errors.push('Valor deve ser uma string');
  } else if (value.trim().length === 0) {
    errors.push('String não pode estar vazia');
  } else if (value.length > maxLength) {
    errors.push(`String não pode ter mais de ${maxLength} caracteres`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateNumber(value: number, min: number, max: number): ValidationResult {
  const errors: string[] = [];
  
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push('Valor deve ser um número válido');
  } else if (value < min) {
    errors.push(`Número deve ser maior ou igual a ${min}`);
  } else if (value > max) {
    errors.push(`Número deve ser menor ou igual a ${max}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Tipos de erro
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    public errors: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Usuário não autenticado') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Acesso negado') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

// Tipos de contexto de request
export interface RequestContext {
  userId?: string;
  requestId: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  method: string;
  url: string;
  headers: Record<string, string>;
}

// Tipos de cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
}

// Tipos de monitoramento
export interface Metrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
  };
  security: {
    blockedRequests: number;
    suspiciousActivities: number;
    rateLimitExceeded: number;
  };
  business: {
    ordersCreated: number;
    paymentsProcessed: number;
    usersRegistered: number;
  };
} 