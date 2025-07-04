import { useState, useCallback } from 'react';

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

// Respostas pré-definidas do chat
const CHAT_RESPONSES: Record<string, string> = {
  'inscrições': '🔥 As inscrições para o CERRADØ 2025 abrem em breve! Fique ligado nas nossas redes sociais para não perder o prazo. Será um evento épico!',
  'evento': '🏛️ O CERRADØ 2025 será realizado no Centro de Convenções de Brasília, um local incrível para reunir a comunidade fitness!',
  'time': '🤝 Para formar seu time, você precisa de 3-5 atletas. Escolha sua categoria e monte seu dream team! Cada membro deve se inscrever individualmente.',
  'audiovisual': '📸 A categoria audiovisual é perfeita para quem ama fotografia e vídeo! Capture os melhores momentos do evento e concorra a prêmios incríveis.',
  'categorias': '🏆 Temos várias categorias: Individual, Duplas, Trios, Times (3-5 atletas) e Audiovisual. Cada uma com desafios únicos!',
  'valores': '💰 Os valores das inscrições variam por categoria. Individual: R$ 150, Duplas: R$ 280, Trios: R$ 390, Times: R$ 600, Audiovisual: R$ 100.',
  'quando': '📅 O CERRADØ 2025 acontece em março de 2025! As inscrições abrem em janeiro. Não perca essa oportunidade!',
  'onde': '📍 O evento será no Centro de Convenções de Brasília, um local incrível com toda infraestrutura necessária para um evento épico!',
  'como': '🎯 Para participar, escolha sua categoria, forme seu time (se aplicável) e aguarde a abertura das inscrições. Será simples e rápido!',
  'preço': '💎 Os valores são acessíveis: Individual R$ 150, Duplas R$ 280, Trios R$ 390, Times R$ 600, Audiovisual R$ 100. Vale cada centavo!',
  'inscrever': '📝 As inscrições abrem em janeiro de 2025! Fique ligado nas nossas redes sociais para ser o primeiro a se inscrever!',
  'local': '🏢 Centro de Convenções de Brasília - um local incrível com toda estrutura necessária para o maior evento fitness do ano!',
  'data': '🗓️ Março de 2025! Prepare-se para o evento mais épico do ano. As inscrições abrem em janeiro!',
  'horário': '⏰ O evento acontece durante todo o dia de março de 2025. Programação completa será divulgada em breve!',
  'regulamento': '📋 O regulamento completo será divulgado junto com as inscrições. Fique ligado nas nossas redes sociais!',
  'premiação': '🏆 Prêmios incríveis para os campeões! Detalhes da premiação serão divulgados em breve.',
  'patrocinadores': '💪 Temos patrocinadores incríveis apoiando o evento! Lista completa será divulgada em breve.',
  'organização': '👥 O CERRADØ é organizado pela equipe INTERBØX, especialistas em eventos fitness de alta qualidade!',
  'contato': '📞 Entre em contato conosco via WhatsApp ou Instagram @interbox. Estamos sempre disponíveis para ajudar!',
  'ajuda': '🤝 Estou aqui para ajudar! Pergunte sobre inscrições, categorias, local, valores ou qualquer dúvida sobre o CERRADØ 2025!'
};

// Função para encontrar a melhor resposta baseada na mensagem
const findBestResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Buscar por palavras-chave específicas
  for (const [keyword, response] of Object.entries(CHAT_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  // Resposta padrão se não encontrar nada específico
  return '🤖 Oi! Sou o assistente do CERRADØ 2025! Posso te ajudar com informações sobre inscrições, categorias, local, valores e muito mais. O que você gostaria de saber?';
};

export const useChatAPI = () => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enviar mensagem
  const sendMessage = useCallback(async (message: string, context?: string): Promise<ChatResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de resposta
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const response = findBestResponse(message);
      const sessionId = currentSession?.id || `session-${Date.now()}`;
      const messageId = `msg-${Date.now()}`;

      // Adicionar mensagem do usuário
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sessionId,
        userId: 'user',
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      // Adicionar resposta da IA
      const aiMessage: ChatMessage = {
        id: messageId,
        sessionId,
        userId: 'ai',
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      if (!currentSession) {
        setCurrentSession({
          id: sessionId,
          userId: 'user',
          context: context || 'cerrado-interbox-2025',
          status: 'active',
          createdAt: new Date(),
          lastActivity: new Date(),
          messageCount: 2
        });
      }

      return {
        success: true,
        response,
        sessionId,
        messageId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession?.id]);

  // Criar nova sessão
  const createSession = useCallback(async (context?: string): Promise<ChatSession> => {
    const session: ChatSession = {
      id: `session-${Date.now()}`,
      userId: 'user',
      context: context || 'cerrado-interbox-2025',
      status: 'active',
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0
    };

    setCurrentSession(session);
    setMessages([]);

    return session;
  }, []);

  // Buscar histórico (não implementado no chat simples)
  const loadHistory = useCallback(async (sessionId: string) => {
    // Não implementado no chat simples
    console.log('Histórico não disponível no chat simples');
  }, []);

  // Salvar feedback (não implementado no chat simples)
  const saveFeedback = useCallback(async (feedbackData: Omit<FeedbackData, 'userId'>) => {
    // Não implementado no chat simples
    console.log('Feedback não disponível no chat simples');
  }, []);

  // Polling (não necessário no chat simples)
  const startPolling = useCallback(() => {
    // Não implementado no chat simples
  }, []);

  const stopPolling = useCallback(() => {
    // Não implementado no chat simples
  }, []);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentSession,
    sendMessage,
    createSession,
    loadHistory,
    saveFeedback,
    startPolling,
    stopPolling,
    clearMessages
  };
}; 