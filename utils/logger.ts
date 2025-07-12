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
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
  FATAL: 4;
}

export interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  context?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

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
  let batchTimeout: ReturnType<typeof setTimeout> | null = null;

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
  private maxLogs: number;
  private logs: LogEntry[] = [];
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logLevel = this.isProduction ? 1 : 0; // INFO em produção, DEBUG em desenvolvimento
    this.maxLogs = 1000;
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    data?: any,
    context?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    // Adicionar à lista de logs
    this.logs.push(entry);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return entry;
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: LogLevel = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      FATAL: 4
    };
    return levels[level] >= this.logLevel;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, data } = entry;
    const contextStr = context ? ` [${context}]` : '';
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `${timestamp} ${level}${contextStr}: ${message}${dataStr}`;
  }

  private outputLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedLog = this.formatLog(entry);

    switch (entry.level) {
      case 'DEBUG':
        console.debug(formattedLog);
        break;
      case 'INFO':
        console.info(formattedLog);
        break;
      case 'WARN':
        console.warn(formattedLog);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(formattedLog);
        break;
    }

    // Em produção, enviar logs críticos para monitoramento
    if (this.isProduction && (entry.level === 'ERROR' || entry.level === 'FATAL')) {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    try {
      // Aqui você pode integrar com serviços de monitoramento como:
      // - Sentry
      // - LogRocket
      // - Firebase Crashlytics
      // - Custom API

      if (typeof window !== 'undefined') {
        // Enviar via beacon para não bloquear a página
        const report = {
          type: 'log',
          level: entry.level,
          message: entry.message,
          data: entry.data,
          context: entry.context,
          timestamp: entry.timestamp,
          url: entry.url,
          userAgent: entry.userAgent
        };

        navigator.sendBeacon('/api/error-report', JSON.stringify({
          errors: [report],
          totalErrors: 1,
          lastError: report
        }));
      }
    } catch (error) {
      // Fallback para console em caso de erro no envio
      console.error('Failed to send log to monitoring:', error);
    }
  }

  debug(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('DEBUG', message, data, context);
    this.outputLog(entry);
  }

  info(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('INFO', message, data, context);
    this.outputLog(entry);
  }

  warn(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('WARN', message, data, context);
    this.outputLog(entry);
  }

  error(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('ERROR', message, data, context);
    this.outputLog(entry);
  }

  fatal(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('FATAL', message, data, context);
    this.outputLog(entry);
  }

  // Logs específicos para diferentes contextos
  auth(message: string, data?: any): void {
    this.info(message, data, 'AUTH');
  }

  payment(message: string, data?: any): void {
    this.info(message, data, 'PAYMENT');
  }

  pwa(message: string, data?: any): void {
    this.info(message, data, 'PWA');
  }

  network(message: string, data?: any): void {
    this.info(message, data, 'NETWORK');
  }

  performance(message: string, data?: any): void {
    this.info(message, data, 'PERFORMANCE');
  }

  // Métodos para análise e debug
  getLogs(level?: keyof LogLevel, limit?: number): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      const levels: LogLevel = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
      };
      filtered = this.logs.filter(log => levels[log.level] >= levels[level]);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  getErrorCount(): number {
    return this.logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length;
  }

  getRecentErrors(limit: number = 10): LogEntry[] {
    return this.logs
      .filter(log => log.level === 'ERROR' || log.level === 'FATAL')
      .slice(-limit);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Método para performance monitoring
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.performance(`${label} completed in ${duration.toFixed(2)}ms`);
    };
  }

  // Método para monitorar erros de rede
  logNetworkError(error: Error, url?: string): void {
    this.error('Network error', {
      message: error.message,
      url: url || 'unknown',
      stack: error.stack
    }, 'NETWORK');
  }

  // Método para monitorar erros de autenticação
  logAuthError(error: Error, action?: string): void {
    this.error('Authentication error', {
      message: error.message,
      action: action || 'unknown',
      stack: error.stack
    }, 'AUTH');
  }

  // Método para monitorar erros de pagamento
  logPaymentError(error: Error, paymentId?: string): void {
    this.error('Payment error', {
      message: error.message,
      paymentId: paymentId || 'unknown',
      stack: error.stack
    }, 'PAYMENT');
  }
}

export const logger = new Logger();

// Log inicial do sistema
if (typeof window !== 'undefined') {
  logger.info('Logger initialized', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
}

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