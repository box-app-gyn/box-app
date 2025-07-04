import { logger } from './logger';

// Tipos de erro customizados
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Usuário não autenticado') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Limite de requisições excedido') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

// Função para tratar erros de autenticação Firebase
export const handleAuthError = (error: unknown): string => {
  try {
    if (error instanceof Error) {
      const errorCode = (error as any).code;
      
      // Log do erro para debugging
      logger.error('Erro de autenticação:', { 
        code: errorCode, 
        message: error.message,
        stack: error.stack 
      });
      
      switch (errorCode) {
        case 'auth/user-not-found':
          return 'Usuário não encontrado';
        case 'auth/wrong-password':
          return 'Senha incorreta';
        case 'auth/email-already-in-use':
          return 'Email já está em uso';
        case 'auth/weak-password':
          return 'Senha muito fraca';
        case 'auth/invalid-email':
          return 'Email inválido';
        case 'auth/too-many-requests':
          return 'Muitas tentativas. Tente novamente em alguns minutos';
        case 'auth/user-disabled':
          return 'Conta desabilitada';
        case 'auth/operation-not-allowed':
          return 'Operação não permitida';
        case 'auth/network-request-failed':
          return 'Erro de conexão. Verifique sua internet';
        case 'auth/popup-closed-by-user':
          return 'Login cancelado pelo usuário';
        case 'auth/popup-blocked':
          return 'Popup bloqueado pelo navegador';
        case 'auth/cancelled-popup-request':
          return 'Solicitação de login cancelada';
        case 'auth/account-exists-with-different-credential':
          return 'Conta já existe com credenciais diferentes';
        case 'auth/requires-recent-login':
          return 'Requer login recente para esta operação';
        case 'auth/invalid-credential':
          return 'Credenciais inválidas';
        case 'auth/invalid-verification-code':
          return 'Código de verificação inválido';
        case 'auth/invalid-verification-id':
          return 'ID de verificação inválido';
        case 'auth/missing-verification-code':
          return 'Código de verificação ausente';
        case 'auth/missing-verification-id':
          return 'ID de verificação ausente';
        case 'auth/quota-exceeded':
          return 'Cota de requisições excedida';
        case 'auth/retry-popup-request':
          return 'Tente novamente';
        default:
          return 'Erro de autenticação. Tente novamente';
      }
    }
    
    // Se não for um Error, logar e retornar mensagem genérica
    logger.error('Erro de autenticação desconhecido:', error);
    return 'Erro inesperado. Tente novamente';
  } catch (logError) {
    // Fallback em caso de erro no próprio logger
    console.error('Erro ao processar erro de autenticação:', logError);
    return 'Erro interno. Tente novamente';
  }
};

// Função para tratar erros de rede
export const handleNetworkError = (error: unknown): string => {
  try {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      logger.error('Erro de rede:', { 
        message: error.message,
        stack: error.stack 
      });
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return 'Erro de conexão. Verifique sua internet';
      }
      
      if (errorMessage.includes('timeout')) {
        return 'Tempo limite excedido. Tente novamente';
      }
      
      if (errorMessage.includes('cors')) {
        return 'Erro de acesso. Tente novamente';
      }
      
      if (errorMessage.includes('404')) {
        return 'Recurso não encontrado';
      }
      
      if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        return 'Servidor temporariamente indisponível';
      }
    }
    
    return 'Erro de conexão. Tente novamente';
  } catch (logError) {
    console.error('Erro ao processar erro de rede:', logError);
    return 'Erro interno. Tente novamente';
  }
};

// Função para tratar erros de validação
export const handleValidationError = (error: unknown): string => {
  try {
    if (error instanceof ValidationError) {
      logger.warn('Erro de validação:', { 
        field: error.field,
        message: error.message 
      });
      return error.message;
    }
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('required') || errorMessage.includes('obrigatório')) {
        return 'Campo obrigatório não preenchido';
      }
      
      if (errorMessage.includes('invalid') || errorMessage.includes('inválido')) {
        return 'Dados inválidos';
      }
      
      if (errorMessage.includes('length') || errorMessage.includes('tamanho')) {
        return 'Tamanho inválido';
      }
      
      if (errorMessage.includes('email')) {
        return 'Email inválido';
      }
      
      if (errorMessage.includes('password') || errorMessage.includes('senha')) {
        return 'Senha inválida';
      }
    }
    
    return 'Dados inválidos';
  } catch (logError) {
    console.error('Erro ao processar erro de validação:', logError);
    return 'Erro de validação';
  }
};

// Função para tratar erros de storage
export const handleStorageError = (error: unknown): string => {
  try {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      logger.error('Erro de storage:', { 
        message: error.message,
        stack: error.stack 
      });
      
      if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
        return 'Espaço de armazenamento insuficiente';
      }
      
      if (errorMessage.includes('permission') || errorMessage.includes('access')) {
        return 'Sem permissão para acessar armazenamento';
      }
      
      if (errorMessage.includes('not supported') || errorMessage.includes('não suportado')) {
        return 'Armazenamento não suportado pelo navegador';
      }
    }
    
    return 'Erro de armazenamento';
  } catch (logError) {
    console.error('Erro ao processar erro de storage:', logError);
    return 'Erro de armazenamento';
  }
};

// Função para tratar erros de PWA
export const handlePWAError = (error: unknown): string => {
  try {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      logger.error('Erro de PWA:', { 
        message: error.message,
        stack: error.stack 
      });
      
      if (errorMessage.includes('service worker') || errorMessage.includes('sw')) {
        return 'Erro no Service Worker';
      }
      
      if (errorMessage.includes('cache')) {
        return 'Erro no cache da aplicação';
      }
      
      if (errorMessage.includes('install') || errorMessage.includes('instalação')) {
        return 'Erro na instalação da aplicação';
      }
      
      if (errorMessage.includes('update') || errorMessage.includes('atualização')) {
        return 'Erro na atualização da aplicação';
      }
    }
    
    return 'Erro na aplicação';
  } catch (logError) {
    console.error('Erro ao processar erro de PWA:', logError);
    return 'Erro na aplicação';
  }
};

// Função principal para tratar erros
export const handleError = (error: unknown, context?: string): string => {
  try {
    // Log do erro com contexto
    logger.error(`Erro${context ? ` em ${context}` : ''}:`, error);
    
    // Tratar tipos específicos de erro
    if (error instanceof AppError) {
      return error.message;
    }
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Detectar tipo de erro baseado na mensagem
      if (errorMessage.includes('auth') || errorMessage.includes('firebase')) {
        return handleAuthError(error);
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('http')) {
        return handleNetworkError(error);
      }
      
      if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
        return handleValidationError(error);
      }
      
      if (errorMessage.includes('storage') || errorMessage.includes('localstorage') || errorMessage.includes('quota')) {
        return handleStorageError(error);
      }
      
      if (errorMessage.includes('pwa') || errorMessage.includes('service worker') || errorMessage.includes('cache')) {
        return handlePWAError(error);
      }
    }
    
    // Fallback para erros desconhecidos
    return 'Erro inesperado. Tente novamente';
  } catch (logError) {
    // Fallback em caso de erro no próprio tratamento
    console.error('Erro ao processar erro:', logError);
    return 'Erro interno. Tente novamente';
  }
};

// Função para criar erro operacional
export const createOperationalError = (message: string, code: string, statusCode: number = 500): AppError => {
  return new AppError(message, code, statusCode, true);
};

// Função para criar erro de programação
export const createProgrammingError = (message: string, code: string, statusCode: number = 500): AppError => {
  return new AppError(message, code, statusCode, false);
};

// Função para verificar se erro é operacional
export const isOperationalError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Função para processar erro e decidir se deve crashar a aplicação
export const processError = (error: unknown, context?: string): void => {
  const errorMessage = handleError(error, context);
  
  // Se não for operacional, crashar a aplicação
  if (!isOperationalError(error)) {
    logger.error('Erro crítico - aplicação será encerrada:', error);
    // Em produção, você pode querer enviar para um serviço de monitoramento
    // e depois encerrar graciosamente
    if (typeof window !== 'undefined') {
      // No cliente, mostrar erro fatal
      alert('Erro crítico na aplicação. A página será recarregada.');
      window.location.reload();
    }
  }
}; 