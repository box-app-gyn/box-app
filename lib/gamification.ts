// /lib/gamification.ts
// 🎯 GAMIFICAÇÃO CAMADA 1 - CONSTANTES E CONFIGURAÇÕES

// =====================================
// NÍVEIS DE GAMIFICAÇÃO
// =====================================

export const GAMIFICATION_LEVELS = {
  INICIANTE: {
    name: 'iniciante',
    minPoints: 0,
    maxPoints: 99,
    title: '🏃‍♂️ Iniciante',
    description: 'Começando a jornada no Interbox!',
    color: '#6B7280',
    badge: '🥉'
  },
  BRONZE: {
    name: 'bronze',
    minPoints: 100,
    maxPoints: 299,
    title: '🥉 Bronze',
    description: 'Atleta em evolução!',
    color: '#CD7F32',
    badge: '🥉'
  },
  PRATA: {
    name: 'prata',
    minPoints: 300,
    maxPoints: 599,
    title: '🥈 Prata',
    description: 'Atleta experiente!',
    color: '#C0C0C0',
    badge: '🥈'
  },
  OURO: {
    name: 'ouro',
    minPoints: 600,
    maxPoints: 999,
    title: '🥇 Ouro',
    description: 'Atleta de elite!',
    color: '#FFD700',
    badge: '🥇'
  },
  PLATINA: {
    name: 'platina',
    minPoints: 1000,
    maxPoints: 1999,
    title: '💎 Platina',
    description: 'Lenda do Interbox!',
    color: '#E5E4E2',
    badge: '💎'
  },
  DIAMANTE: {
    name: 'diamante',
    minPoints: 2000,
    maxPoints: 999999,
    title: '👑 Diamante',
    description: 'Mestre Supremo!',
    color: '#B9F2FF',
    badge: '👑'
  }
} as const;

// =====================================
// PONTOS POR AÇÃO
// =====================================

export const GAMIFICATION_POINTS = {
  // 🎯 AÇÕES BÁSICAS
  CADASTRO: 10,
  LOGIN_DIARIO: 5,
  COMPLETAR_PERFIL: 20,
  
  // 🏃‍♂️ AÇÕES DE TIMES
  CRIAR_TIME: 50,
  ENTRAR_TIME: 30,
  CONVIDAR_ATLETA: 15,
  ACEITAR_CONVITE: 25,
  COMPLETAR_TIME: 100,
  
  // 📸 AÇÕES AUDIOVISUAIS
  INSCRICAO_AUDIOVISUAL: 40,
  APROVACAO_AUDIOVISUAL: 60,
  
  // 🎫 AÇÕES DE INSCRIÇÃO
  INSCRICAO_EVENTO: 80,
  PAGAMENTO_CONFIRMADO: 120,
  
  // 🏆 AÇÕES ESPECIAIS
  PRIMEIRA_VEZ: 25,
  STREAK_7_DIAS: 50,
  STREAK_30_DIAS: 200,
  REFERRAL: 30,
  
  // 🎮 AÇÕES DE ENGAGAMENTO
  VISITAR_APP: 2,
  COMPARTILHAR: 10,
  FEEDBACK: 15,
  AVALIAR: 10
} as const;

// =====================================
// CONQUISTAS DISPONÍVEIS
// =====================================

export const GAMIFICATION_ACHIEVEMENTS = {
  // 🎯 CONQUISTAS INICIAIS
  FIRST_BLOOD: {
    id: 'first_blood',
    name: 'Primeiro Sangue',
    description: 'Primeiro login no app',
    points: 25,
    icon: '🩸',
    category: 'inicial'
  },
  
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'Perfil Completo',
    description: 'Completou todas as informações do perfil',
    points: 50,
    icon: '✅',
    category: 'perfil'
  },
  
  // 🏃‍♂️ CONQUISTAS DE TIMES
  TEAM_CREATOR: {
    id: 'team_creator',
    name: 'Capitão',
    description: 'Criou seu primeiro time',
    points: 100,
    icon: '👑',
    category: 'times'
  },
  
  TEAM_PLAYER: {
    id: 'team_player',
    name: 'Jogador de Equipe',
    description: 'Entrou em um time',
    points: 60,
    icon: '🤝',
    category: 'times'
  },
  
  TEAM_FULL: {
    id: 'team_full',
    name: 'Time Completo',
    description: 'Time com todos os atletas',
    points: 200,
    icon: '🏆',
    category: 'times'
  },
  
  // 📸 CONQUISTAS AUDIOVISUAIS
  AUDIOVISUAL_APPROVED: {
    id: 'audiovisual_approved',
    name: 'Profissional Aprovado',
    description: 'Inscrição audiovisual aprovada',
    points: 120,
    icon: '📸',
    category: 'audiovisual'
  },
  
  // 🎫 CONQUISTAS DE EVENTO
  EVENT_REGISTERED: {
    id: 'event_registered',
    name: 'Inscrito no Evento',
    description: 'Inscrição confirmada no Interbox',
    points: 160,
    icon: '🎫',
    category: 'evento'
  },
  
  PAYMENT_CONFIRMED: {
    id: 'payment_confirmed',
    name: 'Pagamento Confirmado',
    description: 'Pagamento processado com sucesso',
    points: 240,
    icon: '💳',
    category: 'evento'
  },
  
  // 🏆 CONQUISTAS ESPECIAIS
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Mestre da Sequência',
    description: '7 dias consecutivos de login',
    points: 100,
    icon: '🔥',
    category: 'especial'
  },
  
  STREAK_LEGEND: {
    id: 'streak_legend',
    name: 'Lenda da Sequência',
    description: '30 dias consecutivos de login',
    points: 400,
    icon: '⚡',
    category: 'especial'
  },
  
  REFERRAL_MASTER: {
    id: 'referral_master',
    name: 'Mestre dos Referidos',
    description: 'Convidou 5 atletas',
    points: 150,
    icon: '👥',
    category: 'especial'
  },
  
  // 🎮 CONQUISTAS DE ENGAGAMENTO
  FEEDBACK_GIVER: {
    id: 'feedback_giver',
    name: 'Doador de Feedback',
    description: 'Enviou feedback pela primeira vez',
    points: 30,
    icon: '💬',
    category: 'engajamento'
  },
  
  SHARER: {
    id: 'sharer',
    name: 'Compartilhador',
    description: 'Compartilhou o app pela primeira vez',
    points: 20,
    icon: '📤',
    category: 'engajamento'
  }
} as const;

// =====================================
// RECOMPENSAS DISPONÍVEIS
// =====================================

export const GAMIFICATION_REWARDS = {
  // 🎁 RECOMPENSAS POR NÍVEL
  LEVEL_BRONZE: {
    id: 'level_bronze',
    name: 'Recompensa Bronze',
    description: 'Desconto de 5% na próxima inscrição',
    type: 'discount',
    value: 5,
    icon: '🥉',
    requiredLevel: 'bronze'
  },
  
  LEVEL_SILVER: {
    id: 'level_silver',
    name: 'Recompensa Prata',
    description: 'Desconto de 10% na próxima inscrição',
    type: 'discount',
    value: 10,
    icon: '🥈',
    requiredLevel: 'prata'
  },
  
  LEVEL_GOLD: {
    id: 'level_gold',
    name: 'Recompensa Ouro',
    description: 'Desconto de 15% na próxima inscrição',
    type: 'discount',
    value: 15,
    icon: '🥇',
    requiredLevel: 'ouro'
  },
  
  LEVEL_PLATINUM: {
    id: 'level_platinum',
    name: 'Recompensa Platina',
    description: 'Inscrição gratuita para o próximo evento',
    type: 'free_registration',
    value: 100,
    icon: '💎',
    requiredLevel: 'platina'
  },
  
  // 🏆 RECOMPENSAS ESPECIAIS
  STREAK_7_DAYS: {
    id: 'streak_7_days',
    name: 'Recompensa de Sequência',
    description: 'Desconto de 8% por 7 dias de login',
    type: 'discount',
    value: 8,
    icon: '🔥',
    requiredStreak: 7
  },
  
  STREAK_30_DAYS: {
    id: 'streak_30_days',
    name: 'Recompensa de Lenda',
    description: 'Desconto de 20% por 30 dias de login',
    type: 'discount',
    value: 20,
    icon: '⚡',
    requiredStreak: 30
  },
  
  REFERRAL_5: {
    id: 'referral_5',
    name: 'Recompensa de Referência',
    description: 'Desconto de 12% por 5 referências',
    type: 'discount',
    value: 12,
    icon: '👥',
    requiredReferrals: 5
  }
} as const;

// =====================================
// FUNÇÕES UTILITÁRIAS
// =====================================

/**
 * Calcula o nível baseado nos pontos
 */
export function calculateLevel(points: number): string {
  if (points >= 2000) return 'diamante';
  if (points >= 1000) return 'platina';
  if (points >= 600) return 'ouro';
  if (points >= 300) return 'prata';
  if (points >= 100) return 'bronze';
  return 'iniciante';
}

/**
 * Calcula o progresso para o próximo nível
 */
export function calculateProgress(points: number): { current: number; next: number; progress: number } {
  const currentLevel = calculateLevel(points);
  
  // Mapear nomes de nível para as chaves corretas
  const levelMap: Record<string, keyof typeof GAMIFICATION_LEVELS> = {
    'iniciante': 'INICIANTE',
    'bronze': 'BRONZE', 
    'prata': 'PRATA',
    'ouro': 'OURO',
    'platina': 'PLATINA',
    'diamante': 'DIAMANTE'
  };
  
  const levelKey = levelMap[currentLevel];
  const levelConfig = levelKey ? GAMIFICATION_LEVELS[levelKey] : GAMIFICATION_LEVELS.INICIANTE;
  
  const current = points - levelConfig.minPoints;
  const next = levelConfig.maxPoints - levelConfig.minPoints;
  const progress = Math.min(100, (current / next) * 100);
  
  return { current, next, progress };
}

/**
 * Verifica se o usuário pode receber uma conquista
 */
export function canEarnAchievement(userAchievements: string[], achievementId: string): boolean {
  return !userAchievements.includes(achievementId);
}

/**
 * Verifica se o usuário pode receber uma recompensa
 */
export function canEarnReward(userRewards: string[], rewardId: string): boolean {
  return !userRewards.includes(rewardId);
}

/**
 * Calcula pontos de bônus por streak
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 10;
  if (streakDays >= 7) return 5;
  return 0;
}

// =====================================
// TIPOS DE DADOS
// =====================================

export type GamificationLevel = keyof typeof GAMIFICATION_LEVELS;
export type GamificationAction = keyof typeof GAMIFICATION_POINTS;
export type AchievementId = keyof typeof GAMIFICATION_ACHIEVEMENTS;
export type RewardId = keyof typeof GAMIFICATION_REWARDS;

export interface GamificationData {
  points: number;
  level: string;
  totalActions: number;
  lastActionAt: Date;
  achievements: string[];
  rewards: string[];
  streakDays: number;
  lastLoginStreak: Date;
  referralCode: string;
  referrals: string[];
  referralPoints: number;
  position?: number;
}

export interface GamificationActionData {
  action: GamificationAction;
  points: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// =====================================
// SERVIÇO DE GAMIFICAÇÃO
// =====================================

import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, limit as firestoreLimit, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { FirestoreGamificationReward, FirestoreGamificationLeaderboard } from '@/types/firestore';

export const gamificationService = {
  // 🎯 OBTER ESTATÍSTICAS DO USUÁRIO
  async getUserStats(userId: string): Promise<GamificationData> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        // Retornar dados padrão para usuário novo
        return {
          points: 0,
          level: 'iniciante',
          totalActions: 0,
          lastActionAt: new Date(),
          achievements: [],
          rewards: [],
          streakDays: 0,
          lastLoginStreak: new Date(),
          referralCode: '',
          referrals: [],
          referralPoints: 0
        };
      }
      const userData = userDoc.data();
      const gamificationData = userData.gamification || {};
      return {
        points: gamificationData.points || 0,
        level: gamificationData.level || 'iniciante',
        totalActions: gamificationData.totalActions || 0,
        lastActionAt: gamificationData.lastActionAt?.toDate() || new Date(),
        achievements: gamificationData.achievements || [],
        rewards: gamificationData.rewards || [],
        streakDays: gamificationData.streakDays || 0,
        lastLoginStreak: gamificationData.lastLoginStreak?.toDate() || new Date(),
        referralCode: gamificationData.referralCode || '',
        referrals: gamificationData.referrals || [],
        referralPoints: gamificationData.referralPoints || 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do usuário:', error);
      return {
        points: 0,
        level: 'iniciante',
        totalActions: 0,
        lastActionAt: new Date(),
        achievements: [],
        rewards: [],
        streakDays: 0,
        lastLoginStreak: new Date(),
        referralCode: '',
        referrals: [],
        referralPoints: 0
      };
    }
  },

  // 🏅 OBTER RANKING
  async getLeaderboard(limit: number = 10): Promise<FirestoreGamificationLeaderboard[]> {
    try {
      const leaderboardQuery = query(
        collection(db, 'gamification_leaderboard'),
        orderBy('points', 'desc'),
        firestoreLimit(limit)
      );
      const leaderboardSnapshot = await getDocs(leaderboardQuery);
      return leaderboardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreGamificationLeaderboard[];
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      return [];
    }
  },

  // 🎯 ADICIONAR PONTOS
  async addPoints(userId: string, action: GamificationAction): Promise<{ success: boolean; pointsAdded: number; newTotal: number; newLevel: string }> {
    try {
      const pointsToAdd = GAMIFICATION_POINTS[action] || 0;
      const userDoc = await getDoc(doc(db, 'users', userId));
      const currentPoints = userDoc.exists() ? (userDoc.data().gamification?.points || 0) : 0;
      const newTotal = currentPoints + pointsToAdd;
      const newLevel = calculateLevel(newTotal);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.points': increment(pointsToAdd),
        'gamification.level': newLevel,
        'gamification.totalActions': increment(1),
        'gamification.lastActionAt': serverTimestamp()
      });
      return {
        success: true,
        pointsAdded: pointsToAdd,
        newTotal,
        newLevel
      };
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return {
        success: false,
        pointsAdded: 0,
        newTotal: 0,
        newLevel: 'iniciante'
      };
    }
  },

  // 🎁 RESGATAR RECOMPENSA
  async redeemReward(userId: string, rewardId: string): Promise<{ success: boolean; reward?: FirestoreGamificationReward }> {
    try {
      const rewardDoc = await getDoc(doc(db, 'gamification_rewards', rewardId));
      if (!rewardDoc.exists()) return { success: false };
      const reward = { id: rewardDoc.id, ...rewardDoc.data() } as FirestoreGamificationReward;
      // Verificar se o usuário já resgatou esta recompensa
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userRewards = userDoc.exists() ? (userDoc.data().gamification?.rewards || []) : [];
      if (userRewards.includes(rewardId)) return { success: false };
      // Adicionar recompensa ao usuário
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.rewards': [...userRewards, rewardId]
      });
      return { success: true, reward };
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      return { success: false };
    }
  },

  // 🎁 OBTER RECOMPENSAS DISPONÍVEIS
  async getAvailableRewards(level: string): Promise<FirestoreGamificationReward[]> {
    try {
      const rewardsSnapshot = await getDocs(collection(db, 'gamification_rewards'));
      if (rewardsSnapshot.empty) return [];
      return rewardsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as FirestoreGamificationReward))
        .filter(reward => reward.isActive && reward.requiredLevel.toLowerCase() === level.toLowerCase());
    } catch (error) {
      console.error('Erro ao obter recompensas:', error);
      return [];
    }
  }
}; 