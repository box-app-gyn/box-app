// Sistema de logging para Cloud Functions

interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  FATAL: 4;
}

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
  userId?: string;
  requestId?: string;
  ip?: string;
}

class Logger {
  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, userId, requestId, ip } = entry;
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (userId) formatted += ` | User: ${userId}`;
    if (requestId) formatted += ` | Request: ${requestId}`;
    if (ip) formatted += ` | IP: ${ip}`;
    
    return formatted;
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] >= CURRENT_LOG_LEVEL;
  }

  private log(level: keyof LogLevel, message: string, data?: any, context?: {
    userId?: string;
    requestId?: string;
    ip?: string;
  }) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...context,
    };

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

  private async sendToExternalService(entry: LogEntry) {
    // Implementar integração com serviço de logging externo
    // Ex: Sentry, LogRocket, etc.
    try {
      // await externalLoggingService.send(entry);
    } catch (error) {
      console.error('Falha ao enviar log para serviço externo:', error);
    }
  }

  debug(message: string, data?: any, context?: { userId?: string; requestId?: string; ip?: string }) {
    this.log('DEBUG', message, data, context);
  }

  info(message: string, data?: any, context?: { userId?: string; requestId?: string; ip?: string }) {
    this.log('INFO', message, data, context);
  }

  warn(message: string, data?: any, context?: { userId?: string; requestId?: string; ip?: string }) {
    this.log('WARN', message, data, context);
  }

  error(message: string, error?: Error | any, context?: { userId?: string; requestId?: string; ip?: string }) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    
    this.log('ERROR', message, errorData, context);
  }

  fatal(message: string, error?: Error | any, context?: { userId?: string; requestId?: string; ip?: string }) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    
    this.log('FATAL', message, errorData, context);
  }

  // Método para logging de operações de negócio
  business(operation: string, details: any, context?: { userId?: string; requestId?: string; ip?: string }) {
    this.info(`Business Operation: ${operation}`, details, context);
  }

  // Método para logging de segurança
  security(event: string, details: any, context?: { userId?: string; requestId?: string; ip?: string }) {
    this.warn(`Security Event: ${event}`, details, context);
  }
}

export const logger = new Logger();

// Função helper para criar contexto de request
export function createRequestContext(req?: any): { userId?: string; requestId?: string; ip?: string } {
  return {
    userId: req?.auth?.uid,
    requestId: req?.headers?.['x-request-id'] || Math.random().toString(36).substr(2, 9),
    ip: req?.ip || req?.connection?.remoteAddress,
  };
} 