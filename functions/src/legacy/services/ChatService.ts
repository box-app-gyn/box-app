import { ChatRepository } from '../repositories/ChatRepository';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  private chatRepository: ChatRepository;

  constructor(chatRepository: ChatRepository) {
    this.chatRepository = chatRepository;
  }

  async sendMessage(sessionId: string, message: string, userId?: string): Promise<any> {
    try {
      // Salvar mensagem do usuário
      await this.chatRepository.saveMessage({
        id: uuidv4(),
        sessionId,
        userId: userId || 'anonymous',
        content: message,
        role: 'user',
        timestamp: new Date()
      });

      // Gerar resposta fake (sem Vertex AI)
      const fakeResponse = this.generateFakeResponse(message);

      // Salvar resposta do assistente
      await this.chatRepository.saveMessage({
        id: uuidv4(),
        sessionId,
        userId: 'assistant',
        content: fakeResponse,
        role: 'assistant',
        timestamp: new Date()
      });

      return {
        success: true,
        message: fakeResponse,
        sessionId
      };

    } catch (error) {
      console.error('Erro no ChatService:', error);
      throw new Error('Erro ao processar mensagem');
    }
  }

  private generateFakeResponse(message: string): string {
    const userMessage = message.toLowerCase();
    
    if (userMessage.includes('inscriç')) {
      return "As inscrições ainda não abriram, mas você pode se preparar! 🔥 Forme seu time de 4 atletas (2 homens + 2 mulheres) da mesma box e comece a treinar junto. O link da comunidade do WhatsApp será divulgado em breve - fique atento às nossas redes sociais (@cerradointerbox) para receber as novidades em primeira mão! Aqui você não se inscreve, você assume seu chamado! 💪";
    } else if (userMessage.includes('data') || userMessage.includes('quando')) {
      return "O CERRADØ INTERBOX 2025 acontece nos dias 24, 25 e 26 de outubro na Praça Cívica, Goiânia! 📅 Marque na agenda - será o maior evento de times da América Latina! É onde você escreve sua história e assume seu chamado! ⚡";
    } else if (userMessage.includes('local') || userMessage.includes('onde')) {
      return "O evento será na Praça Cívica, Goiânia - GO! 🏛️ Temos alcance de 200km, cobrindo Goiânia, DF, MG, TO e BA. É uma competição presencial com ativações digitais - o melhor dos dois mundos! 🌟";
    } else if (userMessage.includes('audiovisual') || userMessage.includes('criador')) {
      return "Estamos reunindo criadores para cobrir o evento! 📸 Se você trabalha com fotografia, vídeo, drone, podcast ou mídia, pode se inscrever na página de audiovisual do site. É uma oportunidade única de fazer parte da história do CERRADØ e capturar momentos épicos! 🎥";
    } else if (userMessage.includes('comunidade') || userMessage.includes('whatsapp') || userMessage.includes('link')) {
      return "O link da comunidade oficial do WhatsApp será divulgado em breve! 📱 Fique atento às nossas redes sociais (@cerradointerbox) para receber o convite em primeira mão. Lá você receberá todas as novidades sobre inscrições, treinos e preparação para o evento. É onde a comunidade CERRADØ se conecta! 🤝";
    } else if (userMessage.includes('categoria') || userMessage.includes('nível')) {
      return "Temos categorias para todos os níveis: Iniciante, Scale, Amador, Master 145+ e Rx! 🏆 Cada categoria tem suas especificidades e movimentos. A definição completa será divulgada junto com as inscrições. Aqui não há limites, apenas superação! 💪";
    } else if (userMessage.includes('time') || userMessage.includes('formar')) {
      return "Para participar, você precisa formar seu time de 4 atletas (2 homens + 2 mulheres) da mesma box! 🤝 Comece a treinar junto, fortaleça os laços e prepare-se para assumir seu chamado no CERRADØ INTERBOX 2025! É sobre união, superação e história! 🔥";
    } else if (userMessage.includes('valor') || userMessage.includes('preço') || userMessage.includes('custo')) {
      return "Os valores das inscrições serão divulgados junto com a abertura das inscrições! 💰 Fique atento às nossas redes sociais e comunidade para receber as informações em primeira mão. O investimento vale cada centavo para fazer parte da maior história do CrossFit! ⚡";
    } else if (userMessage.includes('treino') || userMessage.includes('preparação')) {
      return "A preparação para o CERRADØ já começou! 💪 Foque em treinos em equipe, melhore sua comunicação e fortaleça os laços com sua box. O evento vai testar não só sua força física, mas também sua união como time! 🔥";
    } else {
      return "Olá! Sou o CERRADØ Assistant 🤖, seu guia oficial para o maior evento de times da América Latina! Como posso te ajudar a assumir seu chamado?";
    }
  }
} 