import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';
import { GAMIFICATION_LEVELS } from '@/lib/gamification';
import { GamificationLevel, FirestoreGamificationReward } from '@/types/firestore';
// import Image from 'next/image'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface GamifiedRewardsProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

// Funções utilitárias de segurança
function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/[<>]/g, '').trim();
}

export default function GamifiedRewards({
  title = "🎁 Recompensas",
  subtitle = "Resgate seus prêmios exclusivos",
  className = ""
}: GamifiedRewardsProps) {
  const { availableRewards, stats, loading, redeemReward } = useGamification();
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<FirestoreGamificationReward | null>(null);

  // 🎨 COR DO NÍVEL
  const getLevelColor = (level: GamificationLevel) => {
    // Mapear nomes de nível para as chaves corretas
    const levelMap: Record<string, keyof typeof GAMIFICATION_LEVELS> = {
      'iniciante': 'INICIANTE',
      'bronze': 'BRONZE', 
      'prata': 'PRATA',
      'ouro': 'OURO',
      'platina': 'PLATINA',
      'diamante': 'DIAMANTE'
    };
    
    const levelKey = levelMap[level.toLowerCase()];
    return levelKey ? GAMIFICATION_LEVELS[levelKey]?.color || '#6B7280' : '#6B7280';
  };

  // 🎁 ÍCONE DA RECOMPENSA
  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'spoiler': return '🔮';
      case 'enquete': return '📊';
      case 'destaque': return '⭐';
      case 'acesso_vip': return '👑';
      case 'conteudo_exclusivo': return '🎬';
      default: return '🎁';
    }
  };

  // 🎯 RESGATAR RECOMPENSA
  const handleRedeem = async (reward: FirestoreGamificationReward) => {
    if (!stats || !reward.id) return;

    try {
      setRedeeming(reward.id);
      await redeemReward(reward.id);
      
      // Mostrar modal de sucesso
      setSelectedReward(reward);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      alert('Erro ao resgatar recompensa. Tente novamente.');
    } finally {
      setRedeeming(null);
    }
  };

  // 🔒 VERIFICAR SE PODE RESGATAR
  const canRedeem = (reward: FirestoreGamificationReward) => {
    if (!stats || !reward) return false;
    
    // Validação robusta de tipos e existência
    if (typeof reward.requiredPoints !== 'number' || !reward.requiredLevel) return false;
    
    // Mapear nomes de nível para as chaves corretas
    const levelMap: Record<string, keyof typeof GAMIFICATION_LEVELS> = {
      'iniciante': 'INICIANTE',
      'bronze': 'BRONZE', 
      'prata': 'PRATA',
      'ouro': 'OURO',
      'platina': 'PLATINA',
      'diamante': 'DIAMANTE'
    };
    
    const requiredLevelKey = levelMap[reward.requiredLevel.toLowerCase()];
    const userLevelKey = levelMap[stats.level.toLowerCase()];
    
    if (!requiredLevelKey || !userLevelKey) return false;
    
    // Verificar pontos
    if (stats.points < reward.requiredPoints) return false;
    
    // Verificar nível
    const levelOrder = ['INICIANTE', 'BRONZE', 'PRATA', 'OURO', 'PLATINA', 'DIAMANTE'];
    const requiredLevelIndex = levelOrder.indexOf(requiredLevelKey);
    const userLevelIndex = levelOrder.indexOf(userLevelKey);
    
    return requiredLevelIndex <= userLevelIndex;
  };

  // 📊 PROGRESSO PARA PRÓXIMA RECOMPENSA
  const getNextRewardProgress = () => {
    if (!stats || !availableRewards.length) return null;

    const sortedRewards = [...availableRewards].sort((a, b) => (a.requiredPoints || 0) - (b.requiredPoints || 0));
    const nextReward = sortedRewards.find(reward => !canRedeem(reward));

    if (!nextReward) return null;

    const progress = (stats.points / (nextReward.requiredPoints || 1)) * 100;
    return {
      reward: nextReward,
      progress: Math.min(progress, 100),
      pointsNeeded: (nextReward.requiredPoints || 0) - stats.points
    };
  };

  const nextRewardProgress = getNextRewardProgress();

  return (
    <div className={`bg-black/60 backdrop-blur rounded-xl p-6 shadow-lg border border-pink-500/20 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <motion.h3 
          className="text-2xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Progresso para próxima recompensa */}
      {nextRewardProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 font-medium text-sm">
              Próxima recompensa: {sanitizeText(nextRewardProgress.reward.title)}
            </span>
            <span className="text-blue-400 text-sm">
              {nextRewardProgress.pointsNeeded} pontos restantes
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${nextRewardProgress.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && availableRewards.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-4">🎁</div>
          <p>Nenhuma recompensa disponível no momento.</p>
          <p className="text-sm">Continue participando para desbloquear recompensas!</p>
        </div>
      )}

      {/* Lista de Recompensas */}
      {!loading && availableRewards.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {availableRewards.map((reward, index) => (
              <motion.div
                key={reward.id || `reward-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  p-4 rounded-lg border transition-all duration-300
                  ${canRedeem(reward) 
                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:bg-green-500/20' 
                    : 'bg-gray-800/50 border-gray-700/50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  {/* Ícone e Informações */}
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 text-2xl">
                      {getRewardIcon(reward.type || 'default')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium mb-1">
                        {sanitizeText(reward.title)}
                      </h4>
                      <p className="text-gray-400 text-sm mb-2">
                        {sanitizeText(reward.description)}
                      </p>
                      
                      {/* Requisitos */}
                      <div className="flex items-center space-x-3">
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${getLevelColor(reward.requiredLevel || 'iniciante')}20`,
                            color: getLevelColor(reward.requiredLevel || 'iniciante'),
                            border: `1px solid ${getLevelColor(reward.requiredLevel || 'iniciante')}40`
                          }}
                        >
                          {(reward.requiredLevel || 'iniciante').charAt(0).toUpperCase() + (reward.requiredLevel || 'iniciante').slice(1)}
                        </span>
                        <span className="text-yellow-400 text-xs font-medium">
                          {reward.requiredPoints || 0} pontos
                        </span>
                        {reward.maxRedemptions && (
                          <span className="text-gray-500 text-xs">
                            {(reward.currentRedemptions || 0)}/{reward.maxRedemptions} resgates
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botão de Resgate */}
                  <div className="flex-shrink-0 ml-4">
                    {canRedeem(reward) ? (
                      <motion.button
                        onClick={() => handleRedeem(reward)}
                        disabled={redeeming === reward.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-300 text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {redeeming === reward.id ? 'Resgatando...' : 'Resgatar'}
                      </motion.button>
                    ) : (
                      <div className="px-4 py-2 bg-gray-600 text-gray-400 font-medium rounded-lg text-sm">
                        Bloqueado
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Sucesso */}
      <AnimatePresence>
        {showModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Recompensa Resgatada!
                </h3>
                <p className="text-gray-600 mb-4">
                  {sanitizeText(selectedReward.title)} foi adicionada ao seu perfil.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <p className="text-gray-500 text-xs text-center">
          Recompensas são resgatadas uma vez por usuário • Algumas recompensas têm limite de resgates
        </p>
      </div>
    </div>
  );
} 