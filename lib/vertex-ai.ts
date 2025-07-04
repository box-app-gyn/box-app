export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    suggestions?: string[];
  };
  error?: string;
}

export interface VertexAIConfig {
  projectId: string;
  location: string;
  model: string;
}

// Configuração do Vertex AI
export const vertexAIConfig: VertexAIConfig = {
  projectId: process.env.VERTEX_AI_PROJECT_ID || 'interbox-app-8d400',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1',
  model: 'gemini-1.5-flash',
};

// Função para fazer requisições ao Vertex AI
export async function callVertexAI(
  messages: ChatMessage[],
  context?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'chat',
        messages,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao chamar Vertex AI:', error);
    return {
      success: false,
      data: {
        response: 'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente mais tarde.',
      },
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
} 