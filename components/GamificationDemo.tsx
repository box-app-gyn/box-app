import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GAMIFICATION_LEVELS, GAMIFICATION_POINTS } from '@/lib/gamification';
import { GamificationAction } from '@/types/firestore';
import { useGamification } from '@/hooks/useGamification';

interface GamificationDemoProps {
  className?: string;
}

// Funções utilitárias de segurança
function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(/[<>]/g, '').trim();
}

export default function GamificationDemo({ className = "" }: GamificationDemoProps) {
  const { stats, addPoints, getLevelProgress } = useGamification();
  const [isExpanded, setIsExpanded] = useState(false);

  // 🎯 AÇÕES DE DEMONSTRAÇÃO
  const demoActions: { action: GamificationAction; label: string; icon: string; points: number }[] = [
    { action: 'COMPARTILHAR', label: 'Compartilhar', icon: '📤', points: GAMIFICATION_POINTS.COMPARTILHAR },
    { action: 'COMPLETAR_PERFIL', label: 'Completar Perfil', icon: '✅', points: GAMIFICATION_POINTS.COMPLETAR_PERFIL },
    { action: 'LOGIN_DIARIO', label: 'Login Diário', icon: '🔥', points: GAMIFICATION_POINTS.LOGIN_DIARIO },
    { action: 'CADASTRO', label: 'Cadastro', icon: '📝', points: GAMIFICATION_POINTS.CADASTRO },
    { action: 'INSCRICAO_AUDIOVISUAL', label: 'Enviar Conteúdo', icon: '📸', points: GAMIFICATION_POINTS.INSCRICAO_AUDIOVISUAL },
    { action: 'VISITAR_APP', label: 'Check-in Evento', icon: '🎫', points: GAMIFICATION_POINTS.VISITAR_APP }
  ];

  // 🎨 COR DO NÍVEL
  const getLevelColor = (level: string) => {
    if (!level) return '#6B7280';
    
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

  // 🎯 EXECUTAR AÇÃO DE DEMO
  const handleDemoAction = async (action: GamificationAction) => {
    if (!action) {
      console.error('Ação inválida:', action);
      return;
    }

    try {
      await addPoints(action, { demo: true });
    } catch (error) {
      console.error('Erro na ação de demo:', error);
    }
  };

  if (!stats) {
    return (
      <div className={`bg-black/60 backdrop-blur rounded-xl p-6 shadow-lg border border-pink-500/20 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-white mb-2">Sistema de Gamificação</h3>
          <p className="text-gray-400">Faça login para participar da gamificação!</p>
        </div>
      </div>
    );
  }

  // Validação de dados do usuário
  const safeStats = {
    points: stats.points || 0,
    level: stats.level || 'iniciante',
    totalActions: stats.totalActions || 0,
    streakDays: stats.streakDays || 0,
    position: stats.position || null
  };

  const levelProgress = getLevelProgress();

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
          🎯 Gamificação Interbox 2025
        </motion.h3>
        <motion.p 
          className="text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Cada ação gera pontos e desbloqueia recompensas exclusivas
        </motion.p>
      </div>

      {/* Status do Usuário */}
      <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span 
              className="text-lg px-3 py-1 rounded-full font-bold"
              style={{ 
                backgroundColor: `${getLevelColor(safeStats.level)}20`,
                color: getLevelColor(safeStats.level),
                border: `1px solid ${getLevelColor(safeStats.level)}40`
              }}
            >
              {sanitizeText(safeStats.level).charAt(0).toUpperCase() + sanitizeText(safeStats.level).slice(1)}
            </span>
            <span className="text-yellow-400 font-bold text-xl">
              {safeStats.points} ⭐
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            #{safeStats.position || 'N/A'}
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progresso para próximo nível</span>
            <span>{levelProgress.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.percentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{levelProgress.current} XP</span>
          <span>{levelProgress.next} XP</span>
        </div>
      </div>

      {/* Ações de Demonstração */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-white mb-4">🚀 Ações Disponíveis</h4>
        <div className="grid grid-cols-2 gap-3">
          {demoActions.slice(0, isExpanded ? demoActions.length : 4).map((demoAction, index) => (
            <motion.button
              key={demoAction.action}
              onClick={() => handleDemoAction(demoAction.action)}
              className="p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{demoAction.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{sanitizeText(demoAction.label)}</p>
                  <p className="text-yellow-400 text-xs">+{demoAction.points} XP</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {demoActions.length > 4 && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? 'Ver menos' : `Ver mais (${demoActions.length - 4})`}
          </motion.button>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
          <div className="text-2xl mb-1">🔥</div>
          <p className="text-white font-bold">{safeStats.streakDays}</p>
          <p className="text-gray-400 text-xs">Dias Streak</p>
        </div>
        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
          <div className="text-2xl mb-1">📊</div>
          <p className="text-white font-bold">{safeStats.totalActions}</p>
          <p className="text-gray-400 text-xs">Ações</p>
        </div>
      </div>

      {/* Recompensas Disponíveis */}
      <div className="mb-6">
        <h4 className="text-lg font-bold text-white mb-3">🎁 Próximas Recompensas</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded">
            <div className="flex items-center space-x-2">
              <span>🔮</span>
              <span className="text-white text-sm">Spoiler do Workout</span>
            </div>
            <span className="text-green-400 text-xs">50 XP</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/30 rounded">
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span className="text-white text-sm">Voto na Categoria</span>
            </div>
            <span className="text-blue-400 text-xs">100 XP</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-purple-500/10 border border-purple-500/30 rounded">
            <div className="flex items-center space-x-2">
              <span>⭐</span>
              <span className="text-white text-sm">Destaque no Perfil</span>
            </div>
            <span className="text-purple-400 text-xs">200 XP</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-3">
          Continue participando para desbloquear mais recompensas!
        </p>
        <div className="text-xs text-gray-500">
          Sistema de gamificação em tempo real
        </div>
      </div>
    </div>
  );
} 