// Sistema de logging robusto para produção
import { SECURITY_UTILS } from '../constants/security';

type LogLevel = {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
  FATAL: number;
};

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.INFO 
  : LOG_LEVELS.DEBUG;

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  context?: any;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  action?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Função para sanitizar dados de log
function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    return SECURITY_UTILS.sanitizeString(data, 500);
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

// Função para gerar ID único para requests
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

class Logger {
  private requestId: string;

  constructor() {
    this.requestId = generateRequestId();
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] >= CURRENT_LOG_LEVEL;
  }

  private formatLog(level: keyof LogLevel, message: string, data?: any, context?: any): LogEntry {
    const sanitizedData = data ? sanitizeLogData(data) : undefined;
    const sanitizedContext = context ? sanitizeLogData(context) : undefined;

    return {
      timestamp: new Date().toISOString(),
      level,
      message: SECURITY_UTILS.sanitizeString(message, 200),
      data: sanitizedData,
      context: sanitizedContext,
      userId: sanitizedContext?.userId,
      requestId: this.requestId,
      ip: sanitizedContext?.ip,
      userAgent: sanitizedContext?.userAgent,
      sessionId: sanitizedContext?.sessionId,
      action: sanitizedContext?.action,
      severity: this.getSeverity(level)
    };
  }

  private getSeverity(level: keyof LogLevel): 'low' | 'medium' | 'high' | 'critical' {
    switch (level) {
      case 'DEBUG':
      case 'INFO':
        return 'low';
      case 'WARN':
        return 'medium';
      case 'ERROR':
        return 'high';
      case 'FATAL':
        return 'critical';
      default:
        return 'low';
    }
  }

  private output(entry: LogEntry): void {
    if (process.env.NODE_ENV === 'production') {
      // Em produção, usar console.log estruturado
      console.log(JSON.stringify(entry));
    } else {
      // Em desenvolvimento, usar console colorido
      const colors = {
        DEBUG: '\x1b[36m', // Cyan
        INFO: '\x1b[32m',  // Green
        WARN: '\x1b[33m',  // Yellow
        ERROR: '\x1b[31m', // Red
        FATAL: '\x1b[35m'  // Magenta
      };
      
      const reset = '\x1b[0m';
      const color = colors[entry.level] || '';
      
      console.log(
        `${color}[${entry.level}]${reset} ${entry.timestamp} ${entry.message}`,
        entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '',
        entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : ''
      );
    }
  }

  debug(message: string, data?: any, context?: any): void {
    if (this.shouldLog('DEBUG')) {
      const entry = this.formatLog('DEBUG', message, data, context);
      this.output(entry);
    }
  }

  info(message: string, data?: any, context?: any): void {
    if (this.shouldLog('INFO')) {
      const entry = this.formatLog('INFO', message, data, context);
      this.output(entry);
    }
  }

  warn(message: string, data?: any, context?: any): void {
    if (this.shouldLog('WARN')) {
      const entry = this.formatLog('WARN', message, data, context);
      this.output(entry);
    }
  }

  error(message: string, data?: any, context?: any): void {
    if (this.shouldLog('ERROR')) {
      const entry = this.formatLog('ERROR', message, data, context);
      this.output(entry);
    }
  }

  fatal(message: string, data?: any, context?: any): void {
    if (this.shouldLog('FATAL')) {
      const entry = this.formatLog('FATAL', message, data, context);
      this.output(entry);
    }
  }

  // Método para logging de segurança
  security(event: string, details: any, context?: { userId?: string; requestId?: string; ip?: string; userAgent?: string; sessionId?: string; action?: string }): void {
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
        eventLower.includes('privilege escalation')) {
      return 'critical';
    }
    
    // Eventos de alta severidade
    if (eventLower.includes('rate limit') ||
        eventLower.includes('brute force') ||
        eventLower.includes('suspicious pattern') ||
        eventLower.includes('unauthorized access')) {
      return 'high';
    }
    
    // Eventos de média severidade
    if (eventLower.includes('invalid token') ||
        eventLower.includes('expired session') ||
        eventLower.includes('invalid input')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Método para logging de auditoria
  audit(action: string, userId: string, resource: string, details?: any): void {
    const auditContext = {
      userId,
      action,
      resource,
      eventType: 'audit',
      timestamp: new Date().toISOString()
    };

    this.info(`Audit: ${action} on ${resource}`, details, auditContext);
  }

  // Método para logging de performance
  performance(operation: string, duration: number, context?: any): void {
    const performanceContext = {
      ...context,
      operation,
      duration,
      eventType: 'performance',
      timestamp: new Date().toISOString()
    };

    if (duration > 5000) {
      this.warn(`Slow operation: ${operation} took ${duration}ms`, { duration }, performanceContext);
    } else if (duration > 1000) {
      this.info(`Operation: ${operation} took ${duration}ms`, { duration }, performanceContext);
    } else {
      this.debug(`Operation: ${operation} took ${duration}ms`, { duration }, performanceContext);
    }
  }

  // Método para logging de erro com stack trace
  errorWithStack(message: string, error: Error, context?: any): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    };

    this.error(message, errorData, context);
  }

  // Método para logging de request
  request(method: string, url: string, statusCode: number, duration: number, context?: any): void {
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
}

// Instância singleton
export const logger = new Logger();

// Função para criar contexto de request
export const createRequestContext = (req: any) => ({
  userId: req.user?.uid,
  requestId: req.headers['x-request-id'] || generateRequestId(),
  ip: req.ip || req.connection?.remoteAddress || 'unknown',
  userAgent: SECURITY_UTILS.sanitizeString(req.headers['user-agent'] || '', 200),
  sessionId: req.headers['x-session-id'],
  action: req.method + ' ' + req.path
}); 