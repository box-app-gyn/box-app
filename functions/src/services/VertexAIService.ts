import { logger } from '../utils/logger';

export interface VertexAIResponse {
  content: string;
  model: string;
  tokens: number;
  processingTime: number;
}

export interface VertexAIRequest {
  message: string;
  context: any;
  temperature?: number;
  maxTokens?: number;
}

export class VertexAIService {
  private projectId: string;
  private location: string;
  private model: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
    this.location = 'us-central1';
    this.model = 'gemini-1.5-flash-001';
  }

  async generateResponse(request: VertexAIRequest): Promise<VertexAIResponse> {
    const startTime = Date.now();

    try {
      // Construir prompt com contexto
      const prompt = this.buildPrompt(request.message, request.context);

      logger.info('Enviando requisição para Vertex AI', {
        messageLength: request.message.length,
        contextLength: JSON.stringify(request.context).length,
        temperature: request.temperature,
        maxTokens: request.maxTokens
      });

      // Aqui você implementaria a chamada real para o Vertex AI
      // Por enquanto, vamos simular uma resposta
      const response = await this.simulateVertexAIResponse(prompt, request);

      const processingTime = Date.now() - startTime;

      logger.info('Resposta do Vertex AI recebida', {
        contentLength: response.content.length,
        processingTime,
        tokens: response.tokens
      });

      return response;

    } catch (error) {
      logger.error('Erro ao gerar resposta do Vertex AI:', error);
      throw new Error(`Erro na IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private buildPrompt(message: string, context: any): string {
    const { baseContext, conversationHistory, currentMessage } = context;

    return `
${baseContext}

${conversationHistory ? `Histórico da conversa:
${conversationHistory}

` : ''}Mensagem atual do usuário: ${currentMessage}

Você é o assistente virtual oficial do CERRADØ INTERBOX 2025. Responda de forma clara, cordial e informativa, sempre mantendo o tom da marca.

INFORMAÇÕES OFICIAIS DO EVENTO:
- Data: 24, 25 e 26 de outubro de 2025
- Local: Praça Cívica, Goiânia - GO
- Alcance: 200km (Goiânia, DF, MG, TO, BA)
- Formato: Times de 4 atletas (2 homens + 2 mulheres) da mesma box
- Categorias: Iniciante, Scale, Amador, Master 145+, Rx
- Inscrições: Ainda não abriram (serão anunciadas na comunidade)
- Comunidade: WhatsApp oficial (link será divulgado)
- Audiovisual: Inscrições na página específica do site

Se a pergunta não for sobre o evento, oriente gentilmente para informações sobre o CERRADØ INTERBOX 2025.
`;
  }

  private async simulateVertexAIResponse(prompt: string, request: VertexAIRequest): Promise<VertexAIResponse> {
    // Simulação de resposta para desenvolvimento
    // Em produção, substitua por chamada real ao Vertex AI
    
    const responses = [
      "Olá! Sou o assistente virtual do CERRADØ INTERBOX 2025. Como posso te ajudar hoje?",
      "O CERRADØ INTERBOX acontece nos dias 24, 25 e 26 de outubro de 2025 na Praça Cívica, Goiânia. É o maior evento de times da América Latina!",
      "Para se inscrever, você precisa formar um time de 4 atletas (2 homens + 2 mulheres) da mesma box. As inscrições ainda não abriram, mas você pode entrar na comunidade para receber as novidades.",
      "O evento tem alcance de 200km, cobrindo Goiânia, DF, MG, TO e BA. É uma competição presencial com ativações digitais.",
      "Temos categorias para todos os níveis: Iniciante, Scale, Amador, Master 145+ e Rx. Cada categoria tem suas especificidades.",
      "Para o audiovisual, estamos reunindo criadores para cobrir o evento. Você pode se inscrever no final da página de audiovisual.",
      "O CERRADØ vai além da arena - é sobre comunidade, superação e história. Aqui você não se inscreve, você assume seu chamado!"
    ];

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Escolher resposta baseada no contexto da mensagem
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    const userMessage = request.message.toLowerCase();
    
    if (userMessage.includes('inscriç')) {
      response = "As inscrições ainda não abriram, mas você pode se preparar! Forme seu time de 4 atletas (2 homens + 2 mulheres) da mesma box. O link da comunidade do WhatsApp será divulgado em breve - fique atento às nossas redes sociais para receber as novidades em primeira mão!";
    } else if (userMessage.includes('data') || userMessage.includes('quando')) {
      response = "O CERRADØ INTERBOX 2025 acontece nos dias 24, 25 e 26 de outubro na Praça Cívica, Goiânia. Marque na agenda - será o maior evento de times da América Latina!";
    } else if (userMessage.includes('local') || userMessage.includes('onde')) {
      response = "O evento será na Praça Cívica, Goiânia - GO. Temos alcance de 200km, cobrindo Goiânia, DF, MG, TO e BA. É uma competição presencial com ativações digitais!";
    } else if (userMessage.includes('audiovisual') || userMessage.includes('criador')) {
      response = "Estamos reunindo criadores para cobrir o evento! Se você trabalha com fotografia, vídeo, drone, podcast ou mídia, pode se inscrever na página de audiovisual do site. É uma oportunidade única de fazer parte da história do CERRADØ!";
    } else if (userMessage.includes('comunidade') || userMessage.includes('whatsapp') || userMessage.includes('link')) {
      response = "O link da comunidade oficial do WhatsApp será divulgado em breve! Fique atento às nossas redes sociais (@cerradointerbox) para receber o convite em primeira mão. Lá você receberá todas as novidades sobre inscrições, treinos e preparação para o evento.";
    } else if (userMessage.includes('categoria') || userMessage.includes('nível')) {
      response = "Temos categorias para todos os níveis: Iniciante, Scale, Amador, Master 145+ e Rx. Cada categoria tem suas especificidades e movimentos. A definição completa será divulgada junto com as inscrições.";
    } else if (userMessage.includes('time') || userMessage.includes('formar')) {
      response = "Para participar, você precisa formar um time de 4 atletas (2 homens + 2 mulheres) da mesma box. Comece a treinar junto e prepare-se para assumir seu chamado no CERRADØ INTERBOX 2025!";
    }

    return {
      content: response,
      model: this.model,
      tokens: this.estimateTokens(prompt + response),
      processingTime: Date.now() - Date.now() + 1500 // Simular tempo de processamento
    };
  }

  private estimateTokens(text: string): number {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  async testConnection(): Promise<boolean> {
    try {
      // Teste simples de conexão
      logger.info('Testando conexão com Vertex AI...');
      
      // Em produção, implemente teste real
      await this.generateResponse({
        message: "Teste de conexão",
        context: { baseContext: "Teste", conversationHistory: "", currentMessage: "Teste", sessionContext: "test" },
        temperature: 0.1,
        maxTokens: 10
      });

      logger.info('✅ Conexão com Vertex AI testada com sucesso');
      return true;
    } catch (error) {
      logger.error('❌ Erro ao testar conexão com Vertex AI:', error);
      return false;
    }
  }

  async getModelInfo(): Promise<any> {
    try {
      return {
        name: this.model,
        projectId: this.projectId,
        location: this.location,
        status: 'active'
      };
    } catch (error) {
      logger.error('Erro ao buscar informações do modelo:', error);
      throw error;
    }
  }
} 