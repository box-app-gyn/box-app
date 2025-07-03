import { VertexAI } from '@google-cloud/vertexai';

// Configuração do Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'interbox-app-8d400',
  location: 'us-central1', // ou 'southamerica-east1' para São Paulo
});

// Modelo Gemini Pro
const model = vertexAI.preview.getGenerativeModel({
  model: 'gemini-pro',
  generation_config: {
    max_output_tokens: 2048,
    temperature: 0.7,
    top_p: 0.8,
    top_k: 40,
  },
});

// Contexto específico do CERRADØ INTERBOX
const CERRADO_CONTEXT = `
Você é um assistente especializado no CERRADØ INTERBOX 2025, o maior evento de times da América Latina.

INFORMAÇÕES DO EVENTO:
- Data: 24, 25 e 26 de outubro de 2025
- Local: A ser definido
- Categorias: Iniciante, Scale, Amador, Master 145+, Rx
- Formato: Times de 4 atletas (2 homens + 2 mulheres)
- Área Audiovisual: Foto, Vídeo, Drone, Pós, Direção Criativa, Social Media

REGRAS IMPORTANTES:
- Pelo menos 3 integrantes do time devem ser da mesma box
- Idade mínima: 18 anos (menores com autorização)
- Alterações no time até o check-in
- Todos os membros devem concluir o pagamento

BENEFÍCIOS AUDIOVISUAL:
- Acesso VIP completo ao evento
- Kit oficial exclusivo Interbox
- Créditos em vídeos e postagens oficiais
- Portfólio com visibilidade real e nacional
- Networking com atletas, marcas e agências

SEU PAPEL:
- Responder dúvidas sobre o evento
- Explicar regras e categorias
- Ajudar com inscrições e audiovisual
- Fornecer informações precisas e úteis
- Manter tom profissional mas acessível
- Sempre direcionar para os canais oficiais quando necessário

IMPORTANTE:
- Mantenha sempre um tom acolhedor, respeitoso e objetivo
- Use frases curtas, diretas e com vocabulário esportivo sempre que possível
- Evite linguagem técnica de IA ou expressões genéricas como "sou apenas uma IA"
- Sempre que possível, reforce o posicionamento do Interbox como o maior evento de times da América Latina
- Seja sempre cordial e profissional
- Use linguagem clara e direta
- Quando não souber algo, sugira entrar em contato via WhatsApp
- Foque em ajudar o usuário a participar do evento
`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  suggestions?: string[];
}

// Função principal para chat
export async function chatWithCerradoAI(
  userMessage: string,
  chatHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  try {
    // Construir contexto com histórico
    const fullContext = CERRADO_CONTEXT + '\n\nHISTÓRICO DA CONVERSA:\n' +
      chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') +
      `\n\nUSUÁRIO: ${userMessage}\nASSISTENTE:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullContext }] }],
    });

    const response = result.response;
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui gerar uma resposta.';

    // Análise de confiança baseada no contexto
    const confidence = analyzeConfidence(text);

    // Gerar sugestões baseadas na resposta
    const suggestions = generateSuggestions(userMessage);

    return {
      response: text,
      confidence,
      suggestions,
    };
  } catch (error) {
    console.error('Erro no Vertex AI:', error);
    return {
      response: 'Desculpe, estou com dificuldades técnicas no momento. Por favor, entre em contato conosco via WhatsApp: https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz',
      confidence: 0,
    };
  }
}

// Análise de confiança da resposta
function analyzeConfidence(response: string): number {
  let confidence = 0.8; // Base

  // Reduzir confiança se a resposta for muito genérica
  const genericPhrases = [
    'não tenho certeza',
    'não posso confirmar',
    'sugiro entrar em contato',
    'não tenho essa informação'
  ];

  if (genericPhrases.some(phrase => response.toLowerCase().includes(phrase))) {
    confidence -= 0.3;
  }

  // Aumentar confiança se mencionar informações específicas do evento
  const specificInfo = [
    '24, 25 e 26 de outubro',
    'times de 4 atletas',
    'categorias',
    'audiovisual',
    'kit oficial'
  ];

  if (specificInfo.some(info => response.toLowerCase().includes(info))) {
    confidence += 0.2;
  }

  return Math.max(0, Math.min(1, confidence));
}

// Gerar sugestões baseadas na conversa
function generateSuggestions(userMessage: string): string[] {
  const suggestions: string[] = [];
  const message = userMessage.toLowerCase();

  // JORNADA: Interesse geral → Informações básicas
  if (message.includes('evento') || message.includes('cerrado') || message.includes('interbox')) {
    suggestions.push('Quais são as categorias disponíveis?');
    suggestions.push('Como funciona a inscrição por times?');
    suggestions.push('Qual é o formato do evento?');
  }

  // JORNADA: Times e categorias
  else if (message.includes('time') || message.includes('categoria') || message.includes('inscriç')) {
    suggestions.push('Como formar um time válido?');
    suggestions.push('Posso mudar meu time depois de inscrito?');
    suggestions.push('Quais são as diferenças entre categorias?');
  }

  // JORNADA: Audiovisual
  else if (message.includes('audiovisual') || message.includes('foto') || message.includes('vídeo') || message.includes('drone')) {
    suggestions.push('Qual é o prazo para envio do portfólio?');
    suggestions.push('Quais funções estão disponíveis?');
    suggestions.push('O acesso audiovisual dá direito ao kit oficial?');
  }

  // JORNADA: Benefícios e vantagens
  else if (message.includes('benefício') || message.includes('kit') || message.includes('acesso') || message.includes('vip')) {
    suggestions.push('Quais são os benefícios do audiovisual?');
    suggestions.push('Como funciona o networking no evento?');
    suggestions.push('O kit oficial inclui o quê?');
  }

  // JORNADA: Regras e procedimentos
  else if (message.includes('regra') || message.includes('procedimento') || message.includes('check-in') || message.includes('pagamento')) {
    suggestions.push('Como funciona o check-in?');
    suggestions.push('Posso alterar membros do time?');
    suggestions.push('Qual é o prazo para pagamento?');
  }

  // JORNADA: Local e logística
  else if (message.includes('local') || message.includes('onde') || message.includes('data') || message.includes('horário')) {
    suggestions.push('Onde será realizado o evento?');
    suggestions.push('Qual é a programação dos dias?');
    suggestions.push('Como chegar ao local?');
  }

  // JORNADA: Contato e suporte
  else if (message.includes('contato') || message.includes('whatsapp') || message.includes('ajuda') || message.includes('suporte')) {
    suggestions.push('Como entrar em contato com a organização?');
    suggestions.push('Tem grupo oficial no WhatsApp?');
    suggestions.push('Posso falar com alguém da equipe?');
  }

  // Sugestões gerais para iniciar a jornada
  else {
    suggestions.push('Como funciona o CERRADØ INTERBOX?');
    suggestions.push('Quero participar do audiovisual');
    suggestions.push('Como formar um time?');
  }

  return suggestions.slice(0, 3); // Máximo 3 sugestões
}

// Função para análise de candidatura audiovisual
export async function analyzeAudiovisualProfile(profile: {
  areaAtuacao: string;
  experiencia: string;
  portfolio: string;
  equipamentos: string;
}): Promise<{
  score: number;
  feedback: string;
  recommendations: string[];
}> {
  try {
    const prompt = `
Analise este perfil de candidato para audiovisual do CERRADØ INTERBOX 2025:

Área de Atuação: ${profile.areaAtuacao}
Experiência: ${profile.experiencia}
Portfólio: ${profile.portfolio}
Equipamentos: ${profile.equipamentos}

Forneça:
1. Score de 0-100 baseado na adequação ao evento
2. Feedback construtivo
3. 3 recomendações específicas para melhorar a candidatura

Seja específico e construtivo.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Análise temporariamente indisponível.';
    
    // Extrair score da resposta (assumindo formato específico)
    const scoreMatch = response.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

    return {
      score,
      feedback: response,
      recommendations: extractRecommendations(response),
    };
  } catch (error) {
    console.error('Erro na análise de perfil:', error);
    return {
      score: 70,
      feedback: 'Análise temporariamente indisponível. Sua candidatura será avaliada pela nossa equipe.',
      recommendations: [
        'Certifique-se de que seu portfólio está atualizado',
        'Descreva sua experiência de forma detalhada',
        'Mencione equipamentos específicos que você utiliza'
      ],
    };
  }
}

function extractRecommendations(response: string): string[] {
  const recommendations: string[] = [];
  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.match(/^\d+\./) || line.toLowerCase().includes('recomendo')) {
      const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
      if (cleanLine && recommendations.length < 3) {
        recommendations.push(cleanLine);
      }
    }
  }

  return recommendations.length > 0 ? recommendations : [
    'Atualize seu portfólio com trabalhos recentes',
    'Descreva sua experiência com eventos esportivos',
    'Mencione sua disponibilidade para os dias do evento'
  ];
} 