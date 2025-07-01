const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const { logger } = require('../utils/logger');

class VertexAIService {
  constructor() {
    this.client = new PredictionServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.location = 'us-central1';
    this.model = 'gemini-1.5-flash-001';
    this.endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}`;
  }

  async generateResponse({ message, context, temperature = 0.7, maxTokens = 1000 }) {
    const startTime = Date.now();

    try {
      // Construir prompt com contexto
      const prompt = this.buildPrompt(message, context);

      const request = {
        endpoint: this.endpoint,
        instances: [{
          prompt: prompt
        }],
        parameters: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40
        }
      };

      logger.info('Enviando requisição para Vertex AI', {
        messageLength: message.length,
        contextLength: JSON.stringify(context).length,
        temperature,
        maxTokens
      });

      const [response] = await this.client.predict(request);
      const content = response.predictions[0].content;

      const processingTime = Date.now() - startTime;

      logger.info('Resposta do Vertex AI recebida', {
        contentLength: content.length,
        processingTime,
        tokens: this.estimateTokens(prompt + content)
      });

      return {
        content,
        model: this.model,
        tokens: this.estimateTokens(prompt + content),
        processingTime
      };

    } catch (error) {
      logger.error('Erro ao gerar resposta do Vertex AI:', error);
      throw new Error(`Erro na IA: ${error.message}`);
    }
  }

  async generateResponseStream({ message, context, temperature = 0.7, maxTokens = 1000, onChunk, onComplete, onError }) {
    const startTime = Date.now();

    try {
      // Construir prompt com contexto
      const prompt = this.buildPrompt(message, context);

      const request = {
        endpoint: this.endpoint,
        instances: [{
          prompt: prompt
        }],
        parameters: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 0.8,
          topK: 40
        }
      };

      logger.info('Iniciando streaming com Vertex AI', {
        messageLength: message.length,
        temperature,
        maxTokens
      });

      // Para streaming, você pode usar a API de streaming do Vertex AI
      // ou implementar um fallback com chunks simulados
      
      // Implementação simulada de streaming
      const response = await this.generateResponse({ message, context, temperature, maxTokens });
      
      // Simular streaming enviando chunks
      const chunks = this.chunkText(response.content, 50);
      
      for (const chunk of chunks) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Delay para simular streaming
        onChunk(chunk);
      }

      const processingTime = Date.now() - startTime;

      onComplete({
        model: this.model,
        tokens: this.estimateTokens(prompt + response.content),
        processingTime
      });

    } catch (error) {
      logger.error('Erro no streaming do Vertex AI:', error);
      onError(error);
    }
  }

  buildPrompt(message, context) {
    const { baseContext, conversationHistory, currentMessage, sessionContext } = context;

    return `
${baseContext}

${conversationHistory ? `Histórico da conversa:
${conversationHistory}

` : ''}Mensagem atual do usuário: ${currentMessage}

Responda de forma clara, cordial e informativa, sempre mantendo o tom da marca CERRADØ INTERBOX.
Se a pergunta não for sobre o evento, oriente gentilmente para informações sobre o CERRADØ INTERBOX 2025.
`;
  }

  chunkText(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  estimateTokens(text) {
    // Estimativa simples: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  async testConnection() {
    try {
      const testRequest = {
        endpoint: this.endpoint,
        instances: [{
          prompt: "Olá, teste de conexão."
        }],
        parameters: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      };

      await this.client.predict(testRequest);
      logger.info('✅ Conexão com Vertex AI testada com sucesso');
      return true;
    } catch (error) {
      logger.error('❌ Erro ao testar conexão com Vertex AI:', error);
      return false;
    }
  }

  async getModelInfo() {
    try {
      // Buscar informações do modelo
      const modelPath = `projects/${this.projectId}/locations/${this.location}/models/${this.model}`;
      
      // Aqui você pode implementar busca de informações do modelo
      // Por enquanto, retornamos informações básicas
      
      return {
        name: this.model,
        projectId: this.projectId,
        location: this.location,
        endpoint: this.endpoint,
        status: 'active'
      };
    } catch (error) {
      logger.error('Erro ao buscar informações do modelo:', error);
      throw error;
    }
  }
}

module.exports = { VertexAIService }; 