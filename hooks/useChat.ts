import { useState, useCallback } from 'react';
import { ChatMessage, ChatResponse } from '@/lib/vertex-ai';
import { useAnalytics } from './useAnalytics';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { trackAudiovisual } = useAnalytics();

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Tracking
      trackAudiovisual('chat_message', message.trim());

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'chat',
          message: message.trim(),
          chatHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSuggestions(data.data.suggestions || []);
    } catch (error) {
      console.error('Erro no chat:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Desculpe, estou com dificuldades técnicas no momento. Por favor, entre em contato conosco via WhatsApp: https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, trackAudiovisual]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  const addWelcomeMessage = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: 'Olá! Sou o assistente do CERRADØ INTERBOX 2025, o maior evento de times da América Latina. Como posso te ajudar hoje? Posso responder dúvidas sobre o evento, inscrições, audiovisual e muito mais! 🏋️‍♀️',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setSuggestions([
        'Como funciona o CERRADØ INTERBOX?',
        'Quero participar do audiovisual',
        'Como formar um time?'
      ]);
    }
  }, [messages.length]);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    clearChat,
    addWelcomeMessage,
  };
} 