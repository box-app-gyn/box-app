"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageFunction = void 0;
const https_1 = require("firebase-functions/v2/https");
// POST /api/chat/message - Enviar mensagem para IA
exports.sendMessageFunction = (0, https_1.onRequest)(async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Mensagem é obrigatória' });
            return;
        }
        // Gerar resposta fake baseada na mensagem
        const fakeResponse = generateFakeResponse(message);
        // Simular delay de processamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.json({
            success: true,
            response: fakeResponse,
            sessionId,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Erro na função sendMessage:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
function generateFakeResponse(message) {
    const lowerMessage = message.toLowerCase();
    // Respostas contextuais baseadas em palavras-chave
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('hello')) {
        return "Olá! Sou o CERRADØ Assistant 🤖, seu guia oficial para o CERRADØ INTERBOX 2025! Como posso te ajudar hoje?";
    }
    if (lowerMessage.includes('data') || lowerMessage.includes('quando') || lowerMessage.includes('dia')) {
        return "O CERRADØ INTERBOX 2025 acontece nos dias 24, 25 e 26 de janeiro de 2025! 🗓️";
    }
    if (lowerMessage.includes('local') || lowerMessage.includes('onde') || lowerMessage.includes('lugar')) {
        return "O evento será realizado no Centro de Convenções de Goiânia! 📍";
    }
    if (lowerMessage.includes('ingresso') || lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
        return "Os ingressos estão disponíveis em diferentes categorias. Acesse nosso site para mais informações sobre preços e pacotes! 💰";
    }
    if (lowerMessage.includes('programação') || lowerMessage.includes('agenda') || lowerMessage.includes('horário')) {
        return "A programação completa será divulgada em breve! Fique ligado nas nossas redes sociais para não perder nada! 📋";
    }
    if (lowerMessage.includes('inscrição') || lowerMessage.includes('cadastro') || lowerMessage.includes('registro')) {
        return "Para se inscrever, acesse nosso site oficial ou entre em contato conosco! 📝";
    }
    // Resposta padrão
    return "Obrigado pela sua mensagem! O CERRADØ INTERBOX 2025 será um evento incrível. Se precisar de informações específicas sobre datas, local, ingressos ou programação, é só perguntar! 🎉";
}
//# sourceMappingURL=chat.js.map