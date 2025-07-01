import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  context: string;
  status: 'active' | 'ended';
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  messageId: string;
  metadata?: any;
}

export interface FeedbackData {
  sessionId: string;
  messageId: string;
  userId: string;
  rating: number;
  feedback?: string;
}

export const useChatAPI = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Função base para fazer requisições
  const makeRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://us-central1-interbox-app-8d400.cloudfunctions.net'
      : 'http://localhost:5001/interbox-app-8d400/us-central1';

    const url = `${baseURL}/${endpoint}`;
    
    console.log('🔗 Fazendo requisição para:', url);
    console.log('📦 Dados da requisição:', { endpoint, options });
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Adicionar token de autenticação se disponível
    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    try {
      console.log('🚀 Iniciando fetch...');
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 Resposta recebida:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro na requisição:', error);
      console.error('🔍 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        url,
        options
      });
      throw error;
    }
  }, [user?.token]);

  // Enviar mensagem
  const sendMessage = useCallback(async (message: string, context?: string): Promise<ChatResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await makeRequest('sendMessageFunction', {
        method: 'POST',
        body: JSON.stringify({
          message,
          context,
          sessionId: currentSession?.id,
          userId: user?.uid || 'anonymous'
        })
      });

      // Adicionar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sessionId: response.sessionId,
        userId: user?.uid || 'anonymous',
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      // Adicionar resposta da IA
      const aiMessage: ChatMessage = {
        id: response.messageId,
        sessionId: response.sessionId,
        userId: 'ai',
        content: response.response,
        role: 'assistant',
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      setCurrentSession(prev => prev ? { ...prev, id: response.sessionId } : null);
      lastMessageIdRef.current = response.messageId;

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest, currentSession?.id, user?.uid]);

  // Criar nova sessão
  const createSession = useCallback(async (context?: string): Promise<ChatSession> => {
    try {
      const response = await makeRequest('createSessionFunction', {
        method: 'POST',
        body: JSON.stringify({
          context,
          userId: user?.uid || 'anonymous'
        })
      });

      setCurrentSession(response.session);
      setMessages([]);
      lastMessageIdRef.current = null;

      return response.session;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw error;
    }
  }, [makeRequest, user?.uid]);

  // Buscar histórico
  const loadHistory = useCallback(async (sessionId: string) => {
    try {
      const response = await makeRequest(`getChatHistoryFunction?sessionId=${sessionId}&userId=${user?.uid || 'anonymous'}`);
      
      setMessages(response.history);
      lastMessageIdRef.current = response.history[response.history.length - 1]?.id || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  }, [makeRequest, user?.uid]);

  // Salvar feedback
  const saveFeedback = useCallback(async (feedbackData: Omit<FeedbackData, 'userId'>) => {
    try {
      await makeRequest('saveFeedbackFunction', {
        method: 'POST',
        body: JSON.stringify({
          ...feedbackData,
          userId: user?.uid || 'anonymous'
        })
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw error;
    }
  }, [makeRequest, user?.uid]);

  // Polling para novas mensagens
  const startPolling = useCallback(() => {
    if (!currentSession?.id || isPolling) return;

    setIsPolling(true);
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await makeRequest(
          `pollMessagesFunction?sessionId=${currentSession.id}&userId=${user?.uid || 'anonymous'}&lastMessageId=${lastMessageIdRef.current || ''}`
        );

        if (response.messages && response.messages.length > 0) {
          setMessages(prev => {
            const newMessages = response.messages.filter(
              (msg: ChatMessage) => !prev.find(existing => existing.id === msg.id)
            );
            return [...prev, ...newMessages];
          });

          lastMessageIdRef.current = response.messages[response.messages.length - 1]?.id || null;
        }
      } catch (error) {
        console.error('Erro no polling:', error);
      }
    }, 3000); // Poll a cada 3 segundos
  }, [makeRequest, currentSession?.id, user?.uid, isPolling]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Limpar chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentSession(null);
    setError(null);
    lastMessageIdRef.current = null;
    stopPolling();
  }, [stopPolling]);

  // Iniciar polling quando sessão estiver ativa
  useEffect(() => {
    if (currentSession?.id && !isPolling) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [currentSession?.id, startPolling, stopPolling, isPolling]);

  // Limpar polling quando componente for desmontado
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // Estado
    messages,
    currentSession,
    isLoading,
    error,
    isPolling,

    // Ações
    sendMessage,
    createSession,
    loadHistory,
    saveFeedback,
    clearChat,
    startPolling,
    stopPolling
  };
}; 