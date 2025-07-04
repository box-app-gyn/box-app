import { useState } from 'react';

// Hook de chat desativado
export function useChat() {
  return {
    sendMessage: async () => {
      throw new Error('Chat desativado. Vertex AI não está mais disponível.');
    },
    messages: [],
    loading: false,
    error: 'Chat desativado. Vertex AI não está mais disponível.'
  };
} 