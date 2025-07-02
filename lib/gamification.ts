import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  increment,
  arrayUnion,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  GamificationAction, 
  GamificationLevel, 
  UserRole,
  FirestoreGamificationAction,
  FirestoreGamificationLeaderboard,
  FirestoreGamificationReward,
  FirestoreGamificationUserReward,
  // FirestoreGamificationAchievement, // eslint-disable-line @typescript-eslint/no-unused-vars
  FirestoreGamificationCommunityHighlight
} from '@/types/firestore';

// 🎯 PONTUAÇÃO POR AÇÃO - CAMADA 1
export const GAMIFICATION_POINTS: Record<GamificationAction, number> = {
  cadastro: 10,
  indicacao_confirmada: 50,
  compra_ingresso: 100,
  envio_conteudo: 75,
  qr_scan_evento: 25,
  prova_extra: 50,
  participacao_enquete: 15,
  acesso_spoiler: 20,
  checkin_evento: 30,
  compartilhamento: 10,
  login_diario: 5,
  completar_perfil: 25
};

// 📊 NÍVEIS E PONTOS NECESSÁRIOS
export const GAMIFICATION_LEVELS: Record<GamificationLevel, { min: number; max: number; color: string }> = {
  iniciante: { min: 0, max: 99, color: '#6B7280' },
  bronze: { min: 100, max: 299, color: '#CD7F32' },
  prata: { min: 300, max: 599, color: '#C0C0C0' },
  ouro: { min: 600, max: 999, color: '#FFD700' },
  platina: { min: 1000, max: 1999, color: '#E5E4E2' },
  diamante: { min: 2000, max: Infinity, color: '#B9F2FF' }
};

// 🏆 CONQUISTAS DISPONÍVEIS
export const GAMIFICATION_ACHIEVEMENTS = [
  {
    id: 'first_blood',
    title: 'Primeiro Sangue',
    description: 'Primeira ação realizada',
    icon: '🩸',
    requiredActions: [{ action: 'cadastro', count: 1 }]
  },
  {
    id: 'social_butterfly',
    title: 'Borboleta Social',
    description: 'Indicou 5 pessoas para a comunidade',
    icon: '🦋',
    requiredActions: [{ action: 'indicacao_confirmada', count: 5 }]
  },
  {
    id: 'content_creator',
    title: 'Criador de Conteúdo',
    description: 'Enviou 3 conteúdos',
    icon: '📸',
    requiredActions: [{ action: 'envio_conteudo', count: 3 }]
  },
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Comprou ingresso no primeiro lote',
    icon: '🐦',
    requiredActions: [{ action: 'compra_ingresso', count: 1 }]
  },
  {
    id: 'streak_master',
    title: 'Mestre da Sequência',
    description: '7 dias consecutivos de login',
    icon: '🔥',
    requiredPoints: 50
  },
  {
    id: 'bronze_warrior',
    title: 'Guerreiro Bronze',
    description: 'Atingiu nível Bronze',
    icon: '🥉',
    requiredLevel: 'bronze'
  },
  {
    id: 'silver_champion',
    title: 'Campeão Prata',
    description: 'Atingiu nível Prata',
    icon: '🥈',
    requiredLevel: 'prata'
  },
  {
    id: 'gold_legend',
    title: 'Lenda Dourada',
    description: 'Atingiu nível Ouro',
    icon: '🥇',
    requiredLevel: 'ouro'
  }
];

// 🎁 RECOMPENSAS DISPONÍVEIS
export const GAMIFICATION_REWARDS = [
  {
    id: 'spoiler_workout',
    title: 'Spoiler do Workout',
    description: 'Acesso antecipado ao primeiro workout do evento',
    type: 'spoiler' as const,
    requiredPoints: 50,
    requiredLevel: 'iniciante',
    metadata: {
      content: 'Workout "Cerrado Spirit" - Prepare-se para o desafio que definirá os verdadeiros guerreiros.',
      instructions: 'O spoiler será enviado por email 24h antes do evento.'
    }
  },
  {
    id: 'enquete_categoria',
    title: 'Voto na Categoria',
    description: 'Participe da enquete para definir uma categoria especial',
    type: 'enquete' as const,
    requiredPoints: 100,
    requiredLevel: 'bronze',
    metadata: {
      content: 'Ajude a definir a próxima categoria do Interbox 2026!',
      externalLink: '/enquete-categoria'
    }
  },
  {
    id: 'destaque_perfil',
    title: 'Destaque no Perfil',
    description: 'Seu nome aparecerá em destaque na comunidade por 24h',
    type: 'destaque' as const,
    requiredPoints: 200,
    requiredLevel: 'bronze',
    metadata: {
      content: 'Seu perfil será destacado na seção "Comunidade Ativa"',
      instructions: 'O destaque será ativado automaticamente após o resgate.'
    }
  },
  {
    id: 'acesso_vip_preview',
    title: 'Acesso VIP Preview',
    description: 'Acesso exclusivo ao preview do evento',
    type: 'acesso_vip' as const,
    requiredPoints: 500,
    requiredLevel: 'prata',
    metadata: {
      content: 'Acesso exclusivo ao preview do evento com 48h de antecedência',
      instructions: 'Link exclusivo será enviado por email.'
    }
  }
];

class GamificationService {
  // 🎯 ADICIONAR PONTOS AO USUÁRIO
  async addPoints(
    userId: string, 
    userEmail: string, 
    userName: string, 
    action: GamificationAction, 
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; pointsAdded: number; newTotal: number; newLevel: GamificationLevel }> {
    try {
      const pointsToAdd = GAMIFICATION_POINTS[action];
      const userRef = doc(db, 'users', userId);
      
      // Buscar dados atuais do usuário
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }

      const userData = userDoc.data();
      const currentPoints = userData.gamification?.points || 0;
      // const currentLevel = userData.gamification?.level || 'iniciante'; // eslint-disable-line @typescript-eslint/no-unused-vars
      const newTotal = currentPoints + pointsToAdd;
      const newLevel = this.calculateLevel(newTotal);

      // Atualizar pontos do usuário
      await updateDoc(userRef, {
        'gamification.points': newTotal,
        'gamification.level': newLevel,
        'gamification.totalActions': increment(1),
        'gamification.lastActionAt': serverTimestamp(),
        'gamification.achievements': arrayUnion(...this.checkNewAchievements(userData.gamification?.achievements || [], newTotal, action))
      });

      // Registrar ação no histórico
      await this.recordAction(userId, userEmail, userName, action, pointsToAdd, metadata);

      // Atualizar ranking
      await this.updateLeaderboard(userId, userEmail, userName, userData.role, userData.photoURL, newTotal, newLevel);

      // Verificar conquistas desbloqueadas
      await this.checkAndAwardAchievements(userId, userEmail, userName, action);

      return {
        success: true,
        pointsAdded: pointsToAdd,
        newTotal,
        newLevel
      };

    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      throw error;
    }
  }

  // 📊 CALCULAR NÍVEL BASEADO NOS PONTOS
  private calculateLevel(points: number): GamificationLevel {
    if (points >= 2000) return 'diamante';
    if (points >= 1000) return 'platina';
    if (points >= 600) return 'ouro';
    if (points >= 300) return 'prata';
    if (points >= 100) return 'bronze';
    return 'iniciante';
  }

  // 🏆 VERIFICAR NOVAS CONQUISTAS
  private checkNewAchievements(currentAchievements: string[], totalPoints: number, lastAction: GamificationAction): string[] {
    const newAchievements: string[] = [];
    
    for (const achievement of GAMIFICATION_ACHIEVEMENTS) {
      if (currentAchievements.includes(achievement.id)) continue;

      let shouldAward = false;

      // Verificar por pontos
      if (achievement.requiredPoints && totalPoints >= achievement.requiredPoints) {
        shouldAward = true;
      }

      // Verificar por nível
      if (achievement.requiredLevel) {
        const currentLevel = this.calculateLevel(totalPoints);
        if (currentLevel === achievement.requiredLevel) {
          shouldAward = true;
        }
      }

      // Verificar por ações específicas
      if (achievement.requiredActions) {
        // Esta lógica seria implementada com contadores de ações
        // Por simplicidade, vamos verificar apenas a ação atual
        if (achievement.requiredActions.some(req => req.action === lastAction)) {
          shouldAward = true;
        }
      }

      if (shouldAward) {
        newAchievements.push(achievement.id);
      }
    }

    return newAchievements;
  }

  // 📝 REGISTRAR AÇÃO NO HISTÓRICO
  private async recordAction(
    userId: string, 
    userEmail: string, 
    userName: string, 
    action: GamificationAction, 
    points: number, 
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const actionData: Omit<FirestoreGamificationAction, 'id'> = {
      userId,
      userEmail,
      userName,
      action,
      points,
      description: this.getActionDescription(action),
      metadata,
      createdAt: serverTimestamp() as Timestamp,
      processed: true,
      processedAt: serverTimestamp() as Timestamp
    };

    await addDoc(collection(db, 'gamification_actions'), actionData);
  }

  // 📖 DESCRIÇÃO DAS AÇÕES
  private getActionDescription(action: GamificationAction): string {
    const descriptions: Record<GamificationAction, string> = {
      cadastro: 'Cadastro realizado na plataforma',
      indicacao_confirmada: 'Indicação confirmada - novo membro se juntou',
      compra_ingresso: 'Compra de ingresso realizada',
      envio_conteudo: 'Conteúdo enviado para a comunidade',
      qr_scan_evento: 'QR Code escaneado no evento',
      prova_extra: 'Prova extra completada',
      participacao_enquete: 'Participação em enquete da comunidade',
      acesso_spoiler: 'Acesso a spoiler do evento',
      checkin_evento: 'Check-in realizado no evento',
      compartilhamento: 'Conteúdo compartilhado nas redes sociais',
      login_diario: 'Login diário realizado',
      completar_perfil: 'Perfil completado com todas as informações'
    };

    return descriptions[action];
  }

  // 🏅 ATUALIZAR RANKING
  private async updateLeaderboard(
    userId: string, 
    userEmail: string, 
    userName: string, 
    userRole: string, 
    userPhotoURL: string | undefined, 
    points: number, 
    level: GamificationLevel
  ): Promise<void> {
    const leaderboardRef = doc(db, 'gamification_leaderboard', userId);
    const leaderboardDoc = await getDoc(leaderboardRef);

    const leaderboardData: Omit<FirestoreGamificationLeaderboard, 'id'> = {
      userId,
      userEmail,
      userName,
      userPhotoURL,
      userRole: userRole as UserRole,
      points,
      level,
      totalActions: 1,
      streakDays: 0, // Será calculado separadamente
      lastActionAt: serverTimestamp() as Timestamp,
      position: 0, // Será calculado pelo Cloud Function
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    if (leaderboardDoc.exists()) {
      await updateDoc(leaderboardRef, {
        points,
        level,
        totalActions: increment(1),
        lastActionAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(leaderboardRef, leaderboardData);
    }
  }

  // 🏆 VERIFICAR E PREMIAR CONQUISTAS
  private async checkAndAwardAchievements(userId: string, userEmail: string, userName: string, action: GamificationAction): Promise<void> {
    // Implementação futura para notificar conquistas
    // Por enquanto, apenas registra a ação
    console.log(`Verificando conquistas para ${userName} após ação: ${action}`);
  }

  // 📊 BUSCAR RANKING
  async getLeaderboard(limitCount: number = 10): Promise<FirestoreGamificationLeaderboard[]> {
    try {
      const leaderboardQuery = query(
        collection(db, 'gamification_leaderboard'),
        orderBy('points', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(leaderboardQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreGamificationLeaderboard));
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }
  }

  // 🎁 BUSCAR RECOMPENSAS DISPONÍVEIS
  async getAvailableRewards(userLevel: GamificationLevel, userPoints: number): Promise<FirestoreGamificationReward[]> {
    try {
      const rewardsQuery = query(
        collection(db, 'gamification_rewards'),
        where('isActive', '==', true),
        where('requiredPoints', '<=', userPoints)
      );

      const snapshot = await getDocs(rewardsQuery);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FirestoreGamificationReward))
        .filter(reward => {
          const levelIndex = Object.keys(GAMIFICATION_LEVELS).indexOf(reward.requiredLevel);
          const userLevelIndex = Object.keys(GAMIFICATION_LEVELS).indexOf(userLevel);
          return levelIndex <= userLevelIndex;
        });
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      return [];
    }
  }

  // 🎁 RESGATAR RECOMPENSA
  async redeemReward(
    userId: string, 
    userEmail: string, 
    userName: string, 
    rewardId: string
  ): Promise<{ success: boolean; reward?: FirestoreGamificationReward }> {
    try {
      const rewardRef = doc(db, 'gamification_rewards', rewardId);
      const rewardDoc = await getDoc(rewardRef);

      if (!rewardDoc.exists()) {
        throw new Error('Recompensa não encontrada');
      }

      const reward = rewardDoc.data() as FirestoreGamificationReward;
      
      // Verificar se ainda está disponível
      if (!reward.isActive) {
        throw new Error('Recompensa não está mais disponível');
      }

      // Verificar limite de resgates
      if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
        throw new Error('Recompensa esgotada');
      }

      // Registrar resgate do usuário
      const userRewardData: Omit<FirestoreGamificationUserReward, 'id'> = {
        userId,
        userEmail,
        userName,
        rewardId,
        rewardTitle: reward.title,
        rewardType: reward.type,
        status: 'disponivel',
        redeemedAt: serverTimestamp() as Timestamp,
        expiresAt: reward.expiresAt,
        metadata: reward.metadata
      };

      await addDoc(collection(db, 'gamification_user_rewards'), userRewardData);

      // Atualizar contador de resgates da recompensa
      await updateDoc(rewardRef, {
        currentRedemptions: increment(1)
      });

      // Adicionar recompensa ao perfil do usuário
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.rewards': arrayUnion(rewardId)
      });

      return { success: true, reward };
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      throw error;
    }
  }

  // 🔥 BUSCAR DESTAQUES DA COMUNIDADE
  async getCommunityHighlights(): Promise<FirestoreGamificationCommunityHighlight[]> {
    try {
      const highlightsQuery = query(
        collection(db, 'gamification_community_highlights'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(highlightsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreGamificationCommunityHighlight));
    } catch (error) {
      console.error('Erro ao buscar destaques:', error);
      return [];
    }
  }

  // 📈 BUSCAR ESTATÍSTICAS DO USUÁRIO
  async getUserStats(userId: string): Promise<{
    points: number;
    level: GamificationLevel;
    totalActions: number;
    achievements: string[];
    rewards: string[];
    streakDays: number;
    position?: number;
  } | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const gamification = userData.gamification || {};

      // Buscar posição no ranking
      const leaderboardRef = doc(db, 'gamification_leaderboard', userId);
      const leaderboardDoc = await getDoc(leaderboardRef);
      const position = leaderboardDoc.exists() ? leaderboardDoc.data().position : undefined;

      return {
        points: gamification.points || 0,
        level: gamification.level || 'iniciante',
        totalActions: gamification.totalActions || 0,
        achievements: gamification.achievements || [],
        rewards: gamification.rewards || [],
        streakDays: gamification.streakDays || 0,
        position
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      return null;
    }
  }
}

// Exportar instância única do serviço
export const gamificationService = new GamificationService(); 