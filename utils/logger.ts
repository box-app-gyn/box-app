// Sistema de logging robusto para produção
import { SECURITY_UTILS } from '../constants/security';

// Tipos para logging
export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  action?: string;
  eventType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: string;
  component?: string;
}

export interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  DEBUG: 3;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Configurações de logging
const LOG_CONFIG = {
  MAX_LOG_SIZE: 1000, // Máximo de logs em memória
  MAX_STRING_LENGTH: 500, // Máximo tamanho de string nos logs
  ENABLE_CONSOLE: process.env.NODE_ENV !== 'production',
  ENABLE_REMOTE: process.env.NODE_ENV === 'production',
  REMOTE_ENDPOINT: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
  BATCH_SIZE: 10,
  BATCH_TIMEOUT: 5000, // 5 segundos
};

// Buffer para logs remotos
let logBuffer: Array<{ level: string; message: string; data: any; context?: LogContext }> = [];
let batchTimeout: NodeJS.Timeout | null = null;

// Função para gerar ID único
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Função para sanitizar dados de log
function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    return SECURITY_UTILS.sanitizeString(data, LOG_CONFIG.MAX_STRING_LENGTH);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = SECURITY_UTILS.sanitizeString(key, 50);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return data;
}

// Função para truncar strings longas
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Função para enviar logs remotos
async function sendLogsToRemote(logs: Array<{ level: string; message: string; data: any; context?: LogContext }>): Promise<void> {
  if (!LOG_CONFIG.ENABLE_REMOTE || !LOG_CONFIG.REMOTE_ENDPOINT) {
    return;
  }

  try {
    const response = await fetch(LOG_CONFIG.REMOTE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': generateRequestId(),
      },
      body: JSON.stringify({
        logs,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      }),
    });

    if (!response.ok) {
      console.error('Falha ao enviar logs remotos:', response.status);
    }
  } catch (error) {
    console.error('Erro ao enviar logs remotos:', error);
  }
}

// Função para processar buffer de logs
function processLogBuffer(): void {
  if (logBuffer.length === 0) return;

  const logsToSend = logBuffer.splice(0, LOG_CONFIG.BATCH_SIZE);
  
  // Enviar logs em background
  sendLogsToRemote(logsToSend).catch(error => {
    console.error('Erro ao processar buffer de logs:', error);
  });

  // Agendar próximo processamento se ainda há logs
  if (logBuffer.length > 0) {
    batchTimeout = setTimeout(processLogBuffer, LOG_CONFIG.BATCH_TIMEOUT);
  }
}

// Função para adicionar log ao buffer
function addToBuffer(level: string, message: string, data: any, context?: LogContext): void {
  if (!LOG_CONFIG.ENABLE_REMOTE) return;

  logBuffer.push({ level, message, data, context });

  // Limitar tamanho do buffer
  if (logBuffer.length > LOG_CONFIG.MAX_LOG_SIZE) {
    logBuffer = logBuffer.slice(-LOG_CONFIG.MAX_LOG_SIZE);
  }

  // Processar buffer se atingiu o tamanho ou se é o primeiro log
  if (logBuffer.length >= LOG_CONFIG.BATCH_SIZE && !batchTimeout) {
    batchTimeout = setTimeout(processLogBuffer, LOG_CONFIG.BATCH_TIMEOUT);
  }
}

// Classe Logger principal
class Logger {
  private logLevel: number;

  constructor(level: keyof LogLevel = 'INFO') {
    this.logLevel = LOG_LEVELS[level];
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] <= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}:${v}`).join(', ')}]` : '';
    const dataStr = data ? ` ${JSON.stringify(sanitizeLogData(data))}` : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${truncateString(message, LOG_CONFIG.MAX_STRING_LENGTH)}${contextStr}${dataStr}`;
  }

  private log(level: keyof LogLevel, message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const sanitizedData = sanitizeLogData(data);
    const formattedMessage = this.formatMessage(level, message, sanitizedData, context);

    // Log no console se habilitado
    if (LOG_CONFIG.ENABLE_CONSOLE) {
      switch (level) {
        case 'ERROR':
          console.error(formattedMessage);
          break;
        case 'WARN':
          console.warn(formattedMessage);
          break;
        case 'INFO':
          console.info(formattedMessage);
          break;
        case 'DEBUG':
          console.debug(formattedMessage);
          break;
      }
    }

    // Adicionar ao buffer para envio remoto
    addToBuffer(level, message, sanitizedData, context);
  }

  // Métodos públicos
  error(message: string, error?: any, context?: LogContext): void {
    const errorData = error instanceof Error
      ? { 
          message: error.message, 
          stack: error.stack, 
          name: error.name,
          code: (error as any).code 
        }
      : error;
    
    this.log('ERROR', message, errorData, context);
  }

  warn(message: string, data?: any, context?: LogContext): void {
    this.log('WARN', message, data, context);
  }

  info(message: string, data?: any, context?: LogContext): void {
    this.log('INFO', message, data, context);
  }

  debug(message: string, data?: any, context?: LogContext): void {
    this.log('DEBUG', message, data, context);
  }

  // Método para logging de segurança
  security(event: string, details: any, context?: LogContext): void {
    const securityContext = {
      ...context,
      eventType: 'security',
      timestamp: new Date().toISOString(),
      severity: this.determineSecuritySeverity(event, details)
    };

    this.warn(`Security Event: ${event}`, details, securityContext);
  }

  private determineSecuritySeverity(event: string, details: any): 'low' | 'medium' | 'high' | 'critical' {
    const eventLower = event.toLowerCase();
    
    // Eventos críticos
    if (eventLower.includes('injection') || 
        eventLower.includes('xss') || 
        eventLower.includes('sql') ||
        eventLower.includes('authentication bypass') ||
        eventLower.includes('privilege escalation') ||
        eventLower.includes('data breach')) {
      return 'critical';
    }
    
    // Eventos de alta severidade
    if (eventLower.includes('rate limit') ||
        eventLower.includes('brute force') ||
        eventLower.includes('suspicious pattern') ||
        eventLower.includes('unauthorized access') ||
        eventLower.includes('malicious') ||
        eventLower.includes('exploit')) {
      return 'high';
    }
    
    // Eventos de média severidade
    if (eventLower.includes('invalid token') ||
        eventLower.includes('expired session') ||
        eventLower.includes('invalid input') ||
        eventLower.includes('failed login')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Método para logging de performance
  performance(operation: string, duration: number, context?: LogContext): void {
    const performanceContext = {
      ...context,
      eventType: 'performance',
      duration,
      timestamp: new Date().toISOString()
    };

    const level = duration > 5000 ? 'WARN' : duration > 1000 ? 'INFO' : 'DEBUG';
    this.log(level as keyof LogLevel, `Performance: ${operation}`, { duration }, performanceContext);
  }

  // Método para logging de request
  request(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    const requestContext = {
      ...context,
      method,
      url: SECURITY_UTILS.sanitizeString(url, 200),
      statusCode,
      duration,
      eventType: 'request',
      timestamp: new Date().toISOString()
    };

    if (statusCode >= 500) {
      this.error(`Request failed: ${method} ${url} - ${statusCode}`, { statusCode, duration }, requestContext);
    } else if (statusCode >= 400) {
      this.warn(`Request error: ${method} ${url} - ${statusCode}`, { statusCode, duration }, requestContext);
    } else {
      this.info(`Request: ${method} ${url} - ${statusCode}`, { statusCode, duration }, requestContext);
    }
  }

  // Método para logging de usuário
  user(userId: string, action: string, details?: any, context?: LogContext): void {
    const userContext = {
      ...context,
      userId: SECURITY_UTILS.sanitizeString(userId, 50),
      action,
      eventType: 'user_action',
      timestamp: new Date().toISOString()
    };

    this.info(`User action: ${action}`, details, userContext);
  }

  // Método para logging de sistema
  system(component: string, action: string, details?: any, context?: LogContext): void {
    const systemContext = {
      ...context,
      component,
      action,
      eventType: 'system',
      timestamp: new Date().toISOString()
    };

    this.info(`System: ${component} - ${action}`, details, systemContext);
  }

  // Método para logging de PWA
  pwa(event: string, details?: any, context?: LogContext): void {
    const pwaContext = {
      ...context,
      eventType: 'pwa',
      timestamp: new Date().toISOString()
    };

    this.info(`PWA: ${event}`, details, pwaContext);
  }

  // Método para logging de gamificação
  gamification(userId: string, action: string, points?: number, context?: LogContext): void {
    const gamificationContext = {
      ...context,
      userId: SECURITY_UTILS.sanitizeString(userId, 50),
      action,
      points,
      eventType: 'gamification',
      timestamp: new Date().toISOString()
    };

    this.info(`Gamification: ${action}`, { points }, gamificationContext);
  }

  // Método para limpar buffer
  flush(): void {
    if (batchTimeout) {
      clearTimeout(batchTimeout);
      batchTimeout = null;
    }
    processLogBuffer();
  }

  // Método para obter estatísticas
  getStats(): { bufferSize: number; totalLogs: number } {
    return {
      bufferSize: logBuffer.length,
      totalLogs: logBuffer.length
    };
  }
}

// Instância global do logger
export const logger = new Logger();

// Função para criar contexto de request
export const createRequestContext = (req: any): LogContext => ({
  userId: req.user?.uid,
  requestId: req.headers['x-request-id'] || generateRequestId(),
  ip: req.ip || req.connection?.remoteAddress || 'unknown',
  userAgent: SECURITY_UTILS.sanitizeString(req.headers['user-agent'] || '', 200),
  sessionId: req.headers['x-session-id'],
  action: req.method + ' ' + req.path
});

// Função para criar contexto de usuário
export const createUserContext = (userId: string, action: string): LogContext => ({
  userId: SECURITY_UTILS.sanitizeString(userId, 50),
  action,
  timestamp: new Date().toISOString()
});

// Função para criar contexto de sistema
export const createSystemContext = (component: string, action: string): LogContext => ({
  component,
  action,
  timestamp: new Date().toISOString()
});

// Middleware para logging automático de requests (se usado com Express)
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const context = createRequestContext(req);

  // Log do request
  logger.info(`Request started: ${req.method} ${req.path}`, {}, context);

  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    logger.request(req.method, req.path, res.statusCode, duration, context);
    return originalSend.call(this, data);
  };

  next();
};

// Cleanup ao sair da aplicação
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush();
  });
}

// Cleanup em Node.js
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    logger.flush();
  });

  process.on('SIGINT', () => {
    logger.flush();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.flush();
    process.exit(0);
  });
} 