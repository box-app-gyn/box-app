import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { gamificationService, GAMIFICATION_LEVELS, GAMIFICATION_ACHIEVEMENTS, GAMIFICATION_REWARDS } from '@/lib/gamification';
import { GamificationAction, GamificationLevel, FirestoreGamificationLeaderboard, FirestoreGamificationReward } from '@/types/firestore';

interface GamificationStats {
  points: number;
  level: GamificationLevel;
  totalActions: number;
  achievements: string[];
  rewards: string[];
  streakDays: number;
  position?: number;
}

interface UseGamificationReturn {
  // Estado
  stats: GamificationStats | null;
  leaderboard: FirestoreGamificationLeaderboard[];
  availableRewards: FirestoreGamificationReward[];
  loading: boolean;
  error: string | null;

  // Ações
  addPoints: (action: GamificationAction, metadata?: Record<string, any>) => Promise<{ success: boolean; pointsAdded: number; newTotal: number; newLevel: GamificationLevel }>;
  redeemReward: (rewardId: string) => Promise<{ success: boolean; reward?: FirestoreGamificationReward }>;
  refreshStats: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  refreshRewards: () => Promise<void>;

  // Utilitários
  getLevelInfo: (level: GamificationLevel) => { min: number; max: number; color: string };
  getLevelProgress: () => { current: number; next: number; percentage: number };
  getAchievementInfo: (achievementId: string) => any;
  getRewardInfo: (rewardId: string) => any;
}

export function useGamification(): UseGamificationReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<FirestoreGamificationLeaderboard[]>([]);
  const [availableRewards, setAvailableRewards] = useState<FirestoreGamificationReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🎯 CARREGAR ESTATÍSTICAS DO USUÁRIO
  const loadUserStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      const userStats = await gamificationService.getUserStats(user.uid);
      setStats(userStats);

      // Carregar recompensas disponíveis se temos os stats
      if (userStats) {
        const rewards = await gamificationService.getAvailableRewards(userStats.level, userStats.points);
        setAvailableRewards(rewards);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar dados da gamificação');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // 🏅 CARREGAR RANKING
  const loadLeaderboard = useCallback(async () => {
    try {
      const leaderboardData = await gamificationService.getLeaderboard(10);
      setLeaderboard(leaderboardData);
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
    }
  }, []);

  // 🎯 ADICIONAR PONTOS
  const addPoints = useCallback(async (action: GamificationAction, metadata?: Record<string, any>) => {
    if (!user?.uid || !user?.email || !user?.displayName) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await gamificationService.addPoints(
        user.uid,
        user.email,
        user.displayName,
        action,
        metadata
      );

      // Atualizar stats locais
      if (stats) {
        setStats({
          ...stats,
          points: result.newTotal,
          level: result.newLevel,
          totalActions: stats.totalActions + 1
        });
      }

      // Recarregar dados para garantir sincronização
      await Promise.all([
        loadUserStats(),
        loadLeaderboard()
      ]);

      return result;
    } catch (err) {
      console.error('Erro ao adicionar pontos:', err);
      setError('Erro ao adicionar pontos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.email, user?.displayName, stats, loadUserStats, loadLeaderboard]);

  // 🎁 RESGATAR RECOMPENSA
  const redeemReward = useCallback(async (rewardId: string) => {
    if (!user?.uid || !user?.email || !user?.displayName) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await gamificationService.redeemReward(
        user.uid,
        user.email,
        user.displayName,
        rewardId
      );

      // Atualizar recompensas do usuário
      if (stats && result.reward) {
        setStats({
          ...stats,
          rewards: [...stats.rewards, rewardId]
        });

        // Remover recompensa da lista de disponíveis se esgotou
        setAvailableRewards(prev => prev.filter(reward => reward.id !== rewardId));
      }

      return result;
    } catch (err) {
      console.error('Erro ao resgatar recompensa:', err);
      setError('Erro ao resgatar recompensa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.email, user?.displayName, stats]);

  // 🔄 REFRESH FUNCTIONS
  const refreshStats = useCallback(() => loadUserStats(), [loadUserStats]);
  const refreshLeaderboard = useCallback(() => loadLeaderboard(), [loadLeaderboard]);
  const refreshRewards = useCallback(async () => {
    if (stats) {
      const rewards = await gamificationService.getAvailableRewards(stats.level, stats.points);
      setAvailableRewards(rewards);
    }
  }, [stats]);

  // 📊 UTILITÁRIOS
  const getLevelInfo = useCallback((level: GamificationLevel) => {
    return GAMIFICATION_LEVELS[level];
  }, []);

  const getLevelProgress = useCallback(() => {
    if (!stats) return { current: 0, next: 0, percentage: 0 };

    const currentLevel = GAMIFICATION_LEVELS[stats.level];
    const current = stats.points - currentLevel.min;
    const next = currentLevel.max - currentLevel.min;
    const percentage = Math.min((current / next) * 100, 100);

    return { current, next, percentage };
  }, [stats]);

  const getAchievementInfo = useCallback((achievementId: string) => {
    return GAMIFICATION_ACHIEVEMENTS.find(achievement => achievement.id === achievementId);
  }, []);

  const getRewardInfo = useCallback((rewardId: string) => {
    return GAMIFICATION_REWARDS.find(reward => reward.id === rewardId);
  }, []);

  // 🚀 EFEITOS
  useEffect(() => {
    if (user?.uid) {
      loadUserStats();
      loadLeaderboard();
    } else {
      setStats(null);
      setLeaderboard([]);
      setAvailableRewards([]);
    }
  }, [user?.uid, loadUserStats, loadLeaderboard]);

  // 🔥 LOGIN DIÁRIO AUTOMÁTICO
  useEffect(() => {
    if (!user?.uid) return;

    const checkDailyLogin = async () => {
      try {
        const lastLogin = localStorage.getItem(`daily_login_${user.uid}`);
        const today = new Date().toDateString();

        if (lastLogin !== today) {
          await addPoints('login_diario');
          localStorage.setItem(`daily_login_${user.uid}`, today);
        }
      } catch (err) {
        console.error('Erro no login diário:', err);
      }
    };

    // Verificar login diário após carregar stats
    if (stats) {
      checkDailyLogin();
    }
  }, [user?.uid, stats, addPoints]);

  return {
    // Estado
    stats,
    leaderboard,
    availableRewards,
    loading,
    error,

    // Ações
    addPoints,
    redeemReward,
    refreshStats,
    refreshLeaderboard,
    refreshRewards,

    // Utilitários
    getLevelInfo,
    getLevelProgress,
    getAchievementInfo,
    getRewardInfo
  };
} 