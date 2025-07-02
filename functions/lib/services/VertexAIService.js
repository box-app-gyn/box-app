"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VertexAIService = void 0;
const logger_1 = require("../utils/logger");
class VertexAIService {
    constructor() {
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT || '';
        this.location = 'us-central1';
        this.model = 'gemini-1.5-flash-001';
    }
    async generateResponse(request) {
        const startTime = Date.now();
        try {
            // Construir prompt com contexto
            const prompt = this.buildPrompt(request.message, request.context);
            logger_1.logger.info('Enviando requisição para Vertex AI', {
                messageLength: request.message.length,
                contextLength: JSON.stringify(request.context).length,
                temperature: request.temperature,
                maxTokens: request.maxTokens
            });
            // Aqui você implementaria a chamada real para o Vertex AI
            // Por enquanto, vamos simular uma resposta
            const response = await this.simulateVertexAIResponse(prompt, request);
            const processingTime = Date.now() - startTime;
            logger_1.logger.info('Resposta do Vertex AI recebida', {
                contentLength: response.content.length,
                processingTime,
                tokens: response.tokens
            });
            return response;
        }
        catch (error) {
            logger_1.logger.error('Erro ao gerar resposta do Vertex AI:', error);
            throw new Error(`Erro na IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
    buildPrompt(message, context) {
        const { baseContext, conversationHistory, currentMessage } = context;
        return `
${baseContext}

${conversationHistory ? `Histórico da conversa:
${conversationHistory}

` : ''}Mensagem atual do usuário: ${currentMessage}

Você é o CERRADØ Assistant, o assistente virtual oficial do CERRADØ INTERBOX 2025. Você é especializado em CrossFit e tem conhecimento profundo sobre o evento.

INFORMAÇÕES OFICIAIS DO CERRADØ INTERBOX 2025:
- Data: 24, 25 e 26 de outubro de 2025
- Local: Praça Cívica, Goiânia - GO
- Alcance: 200km (Goiânia, DF, MG, TO, BA)
- Formato: Times de 4 atletas (2 homens + 2 mulheres) da mesma box
- Categorias: Iniciante, Scale, Amador, Master 145+, Rx
- Inscrições: Ainda não abriram (serão anunciadas na comunidade)
- Comunidade: WhatsApp oficial (link será divulgado)
- Audiovisual: Inscrições na página específica do site
- Valores: Serão divulgados junto com as inscrições

TOM E PERSONALIDADE:
- Use linguagem motivacional e inspiradora
- Referencie "assumir seu chamado" e "história"
- Seja empático e acolhedor
- Use emojis ocasionalmente para manter o tom amigável
- Sempre mantenha o foco no CERRADØ INTERBOX 2025

RESPONDA SEMPRE EM PORTUGUÊS e seja específico sobre o evento. Se a pergunta não for sobre o CERRADØ, oriente gentilmente para informações sobre o evento.
`;
    }
    async simulateVertexAIResponse(prompt, request) {
        // Simulação de resposta para desenvolvimento
        // Em produção, substitua por chamada real ao Vertex AI
        const responses = [
            "Olá! Sou o CERRADØ Assistant 🤖, seu guia oficial para o maior evento de times da América Latina! Como posso te ajudar a assumir seu chamado?",
            "O CERRADØ INTERBOX 2025 acontece nos dias 24, 25 e 26 de outubro na Praça Cívica, Goiânia! É mais que uma competição - é onde você escreve sua história! 💪",
            "Para se inscrever, você precisa formar seu time de 4 atletas (2 homens + 2 mulheres) da mesma box. As inscrições ainda não abriram, mas você pode se preparar! 🔥",
            "O evento tem alcance de 200km, cobrindo Goiânia, DF, MG, TO e BA. É uma competição presencial com ativações digitais - o melhor dos dois mundos! 🌟",
            "Temos categorias para todos os níveis: Iniciante, Scale, Amador, Master 145+ e Rx. Aqui não há limites, apenas superação! 🏆",
            "Para o audiovisual, estamos reunindo criadores para cobrir o evento! Se você trabalha com fotografia, vídeo, drone ou mídia, pode se inscrever na página específica. 📸",
            "O CERRADØ vai além da arena - é sobre comunidade, superação e história. Aqui você não se inscreve, você assume seu chamado! ⚡"
        ];
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        // Escolher resposta baseada no contexto da mensagem
        let response = responses[Math.floor(Math.random() * responses.length)];
        const userMessage = request.message.toLowerCase();
        if (userMessage.includes('inscriç')) {
            response = "As inscrições ainda não abriram, mas você pode se preparar! 🔥 Forme seu time de 4 atletas (2 homens + 2 mulheres) da mesma box e comece a treinar junto. O link da comunidade do WhatsApp será divulgado em breve - fique atento às nossas redes sociais (@cerradointerbox) para receber as novidades em primeira mão! Aqui você não se inscreve, você assume seu chamado! 💪";
        }
        else if (userMessage.includes('data') || userMessage.includes('quando')) {
            response = "O CERRADØ INTERBOX 2025 acontece nos dias 24, 25 e 26 de outubro na Praça Cívica, Goiânia! 📅 Marque na agenda - será o maior evento de times da América Latina! É onde você escreve sua história e assume seu chamado! ⚡";
        }
        else if (userMessage.includes('local') || userMessage.includes('onde')) {
            response = "O evento será na Praça Cívica, Goiânia - GO! 🏛️ Temos alcance de 200km, cobrindo Goiânia, DF, MG, TO e BA. É uma competição presencial com ativações digitais - o melhor dos dois mundos! 🌟";
        }
        else if (userMessage.includes('audiovisual') || userMessage.includes('criador')) {
            response = "Estamos reunindo criadores para cobrir o evento! 📸 Se você trabalha com fotografia, vídeo, drone, podcast ou mídia, pode se inscrever na página de audiovisual do site. É uma oportunidade única de fazer parte da história do CERRADØ e capturar momentos épicos! 🎥";
        }
        else if (userMessage.includes('comunidade') || userMessage.includes('whatsapp') || userMessage.includes('link')) {
            response = "O link da comunidade oficial do WhatsApp será divulgado em breve! 📱 Fique atento às nossas redes sociais (@cerradointerbox) para receber o convite em primeira mão. Lá você receberá todas as novidades sobre inscrições, treinos e preparação para o evento. É onde a comunidade CERRADØ se conecta! 🤝";
        }
        else if (userMessage.includes('categoria') || userMessage.includes('nível')) {
            response = "Temos categorias para todos os níveis: Iniciante, Scale, Amador, Master 145+ e Rx! 🏆 Cada categoria tem suas especificidades e movimentos. A definição completa será divulgada junto com as inscrições. Aqui não há limites, apenas superação! 💪";
        }
        else if (userMessage.includes('time') || userMessage.includes('formar')) {
            response = "Para participar, você precisa formar seu time de 4 atletas (2 homens + 2 mulheres) da mesma box! 🤝 Comece a treinar junto, fortaleça os laços e prepare-se para assumir seu chamado no CERRADØ INTERBOX 2025! É sobre união, superação e história! 🔥";
        }
        else if (userMessage.includes('valor') || userMessage.includes('preço') || userMessage.includes('custo')) {
            response = "Os valores das inscrições serão divulgados junto com a abertura das inscrições! 💰 Fique atento às nossas redes sociais e comunidade para receber as informações em primeira mão. O investimento vale cada centavo para fazer parte da maior história do CrossFit! ⚡";
        }
        else if (userMessage.includes('treino') || userMessage.includes('preparação')) {
            response = "A preparação para o CERRADØ já começou! 💪 Foque em treinos em equipe, melhore sua comunicação e fortaleça os laços com sua box. O evento vai testar não só sua força física, mas também sua união como time! 🔥";
        }
        return {
            content: response,
            model: this.model,
            tokens: this.estimateTokens(prompt + response),
            processingTime: Date.now() - Date.now() + 1500 // Simular tempo de processamento
        };
    }
    estimateTokens(text) {
        // Estimativa simples: ~4 caracteres por token
        return Math.ceil(text.length / 4);
    }
    async testConnection() {
        try {
            // Teste simples de conexão
            logger_1.logger.info('Testando conexão com Vertex AI...');
            // Em produção, implemente teste real
            await this.generateResponse({
                message: "Teste de conexão",
                context: { baseContext: "Teste", conversationHistory: "", currentMessage: "Teste", sessionContext: "test" },
                temperature: 0.1,
                maxTokens: 10
            });
            logger_1.logger.info('✅ Conexão com Vertex AI testada com sucesso');
            return true;
        }
        catch (error) {
            logger_1.logger.error('❌ Erro ao testar conexão com Vertex AI:', error);
            return false;
        }
    }
    async getModelInfo() {
        try {
            return {
                name: this.model,
                projectId: this.projectId,
                location: this.location,
                status: 'active'
            };
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar informações do modelo:', error);
            throw error;
        }
    }
}
exports.VertexAIService = VertexAIService;
//# sourceMappingURL=VertexAIService.js.map