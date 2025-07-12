import { logger } from './logger';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  userAgent?: string;
  url?: string;
  stack?: string;
}

export interface ErrorReport {
  errors: ErrorInfo[];
  totalErrors: number;
  lastError?: ErrorInfo;
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;
  private isReporting = false;

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(event.error || new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          { type: 'unhandledrejection' }
        );
      });

      window.addEventListener('beforeunload', () => {
        this.reportErrors();
      });
    }
  }

  handleError(error: Error | string, context?: any): void {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code: this.getErrorCode(error),
      details: context,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };

    this.errors.push(errorInfo);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    console.error('Error captured:', errorInfo);

    if (process.env.NODE_ENV === 'development') {
      console.group('Error Details');
      console.error('Message:', errorInfo.message);
      console.error('Code:', errorInfo.code);
      console.error('Context:', errorInfo.details);
      console.error('Stack:', errorInfo.stack);
      console.groupEnd();
    }

    this.reportErrors();
  }

  private getErrorCode(error: Error | string): string {
    if (typeof error === 'string') {
      return 'UNKNOWN_ERROR';
    }

    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('firebase') || message.includes('firestore')) {
      return 'FIREBASE_ERROR';
    }
    if (message.includes('auth') || message.includes('login')) {
      return 'AUTH_ERROR';
    }
    if (message.includes('payment') || message.includes('pix')) {
      return 'PAYMENT_ERROR';
    }
    if (message.includes('validation')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'PERMISSION_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('quota') || message.includes('limit')) {
      return 'QUOTA_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  async reportErrors(): Promise<void> {
    if (this.isReporting || this.errors.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      const report: ErrorReport = {
        errors: [...this.errors],
        totalErrors: this.errors.length,
        lastError: this.errors[this.errors.length - 1]
      };

      if (typeof window !== 'undefined' && 'navigator' in window && 'sendBeacon' in navigator) {
        const success = navigator.sendBeacon('/api/error-report', JSON.stringify(report));
        if (success) {
          this.errors = [];
        }
      } else {
        await fetch('/api/error-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
        this.errors = [];
      }
    } catch (error) {
      console.error('Failed to report errors:', error);
    } finally {
      this.isReporting = false;
    }
  }

  getErrorReport(): ErrorReport {
    return {
      errors: [...this.errors],
      totalErrors: this.errors.length,
      lastError: this.errors[this.errors.length - 1]
    };
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

export const errorHandler = new ErrorHandler();

export function handleAsyncError<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error as Error);
      return null;
    }
  };
}

export function createErrorBoundary(componentName: string) {
  return (error: Error, errorInfo: any) => {
    errorHandler.handleError(error, {
      component: componentName,
      errorInfo
    });
  };
}

export const errorMessages = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet e tente novamente.',
  FIREBASE_ERROR: 'Erro no servidor. Tente novamente em alguns instantes.',
  AUTH_ERROR: 'Erro de autenticação. Faça login novamente.',
  PAYMENT_ERROR: 'Erro no pagamento. Verifique os dados e tente novamente.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique as informações fornecidas.',
  PERMISSION_ERROR: 'Acesso negado. Você não tem permissão para esta ação.',
  TIMEOUT_ERROR: 'Tempo limite excedido. Tente novamente.',
  QUOTA_ERROR: 'Limite excedido. Tente novamente mais tarde.',
  UNKNOWN_ERROR: 'Erro inesperado. Tente novamente.'
};

export function getErrorMessage(code: string): string {
  return errorMessages[code as keyof typeof errorMessages] || errorMessages.UNKNOWN_ERROR;
}

export function isRetryableError(error: Error | string): boolean {
  const code = errorHandler.getErrorCode(error);
  return ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'FIREBASE_ERROR'].includes(code);
}

export function shouldShowErrorToUser(error: Error | string): boolean {
  const code = errorHandler.getErrorCode(error);
  return !['QUOTA_ERROR', 'PERMISSION_ERROR'].includes(code);
} 