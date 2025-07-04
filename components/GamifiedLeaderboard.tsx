import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';
import { GAMIFICATION_LEVELS } from '@/lib/gamification';
import { GamificationLevel } from '@/types/firestore';
import Image from 'next/image';

interface GamifiedLeaderboardProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  showUserPosition?: boolean;
  className?: string;
}

// Funções utilitárias de segurança
function sanitizeText(text: string): string {
  if (!text) return 'Usuário';
  return text.replace(/[<>]/g, '').trim();
}

function sanitizeUrl(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url, window.location.origin);
    return u.href;
  } catch {
    return '';
  }
}

export default function GamifiedLeaderboard({
  title = "🔥 Comunidade Ativa",
  subtitle = "Os mais engajados da tribo",
  showUserPosition = true,
  className = ""
}: GamifiedLeaderboardProps) {
  const { leaderboard, stats, loading, refreshLeaderboard } = useGamification();
  const [isExpanded, setIsExpanded] = useState(false);

  // 🏆 POSIÇÕES COM MEDALHAS
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

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

  // 📊 FORMATAR PONTOS
  const formatPoints = (points: number) => {
    if (!points || points < 0) return '0';
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}k`;
    }
    return points.toString();
  };

  // 🎯 POSIÇÃO DO USUÁRIO ATUAL
  const getUserPosition = () => {
    if (!stats?.position || !leaderboard.length) return null;
    const userEntry = leaderboard.find(entry => entry.position === stats.position);
    if (!userEntry) return null;
    return {
      position: stats.position,
      points: stats.points || 0,
      level: stats.level || 'iniciante',
      userName: sanitizeText(userEntry.userName),
      userPhotoURL: sanitizeUrl(userEntry.userPhotoURL || '')
    };
  };

  // 🔄 REFRESH AUTOMÁTICO
  useEffect(() => {
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [refreshLeaderboard]);

  // 📱 ITENS VISÍVEIS
  const visibleItems = isExpanded ? leaderboard : leaderboard.slice(0, 5);
  const userPosition = getUserPosition();

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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && leaderboard.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-4">🏆</div>
          <p>Nenhum participante ainda.</p>
          <p className="text-sm">Seja o primeiro a aparecer no ranking!</p>
        </div>
      )}

      {/* Leaderboard */}
      {!loading && leaderboard.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleItems.map((entry, index) => (
              <motion.div
                key={entry.userId || `entry-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all duration-300
                  ${(entry.position || 0) <= 3 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                    : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50'
                  }
                  ${entry.position === stats?.position ? 'ring-2 ring-pink-500/50' : ''}
                `}
              >
                {/* Posição e Avatar */}
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {getPositionIcon(entry.position || index + 1)}
                    </span>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {entry.userPhotoURL ? (
                      <Image
                        src={sanitizeUrl(entry.userPhotoURL)}
                        alt={sanitizeText(entry.userName)}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-pink-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {sanitizeText(entry.userName).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Nome e Nível */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {sanitizeText(entry.userName)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${getLevelColor(entry.level || 'iniciante')}20`,
                          color: getLevelColor(entry.level || 'iniciante'),
                          border: `1px solid ${getLevelColor(entry.level || 'iniciante')}40`
                        }}
                      >
                        {(entry.level || 'iniciante').charAt(0).toUpperCase() + (entry.level || 'iniciante').slice(1)}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {(entry.totalActions || 0)} ações
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pontos */}
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold text-lg">
                    {formatPoints(entry.points)}
                  </span>
                  <span className="text-yellow-400 text-sm">⭐</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Posição do Usuário (se não estiver no top) */}
          {showUserPosition && userPosition && !visibleItems.find(entry => entry.position === stats?.position) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-gray-700 pt-3 mt-3"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-pink-400">
                    #{userPosition.position}
                  </span>
                  
                  <div className="flex-shrink-0">
                    {userPosition.userPhotoURL ? (
                      <Image
                        src={userPosition.userPhotoURL}
                        alt={userPosition.userName}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-pink-500/50"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {userPosition.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {userPosition.userName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${getLevelColor(userPosition.level)}20`,
                          color: getLevelColor(userPosition.level),
                          border: `1px solid ${getLevelColor(userPosition.level)}40`
                        }}
                      >
                        {userPosition.level.charAt(0).toUpperCase() + userPosition.level.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold text-lg">
                    {formatPoints(userPosition.points)}
                  </span>
                  <span className="text-yellow-400 text-sm">⭐</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Botão Expandir/Recolher */}
          {leaderboard.length > 5 && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-4 py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isExpanded ? 'Ver menos' : `Ver mais (${leaderboard.length - 5})`}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
} 