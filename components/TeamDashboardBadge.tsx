import React from 'react';

interface TeamDashboardBadgeProps {
  status: 'confirmado' | 'aguardando_pagamento' | 'incomplete' | 'not_found';
}

export default function TeamDashboardBadge({ status }: TeamDashboardBadgeProps) {
  if (status === 'confirmado') {
    return (
      <div className="flex items-center gap-2 bg-green-700/80 text-white px-4 py-2 rounded-lg mt-4 shadow-lg">
        <span className="text-2xl">⚡</span>
        <span>Time montado e pagamento confirmado! Bem-vindos à arena.</span>
      </div>
    );
  }
  if (status === 'aguardando_pagamento') {
    return (
      <div className="flex items-center gap-2 bg-yellow-700/80 text-white px-4 py-2 rounded-lg mt-4 shadow-lg">
        <span className="text-2xl">⏳</span>
        <span>Aguardando todos os pagamentos do time...</span>
      </div>
    );
  }
  if (status === 'incomplete') {
    return (
      <div className="flex items-center gap-2 bg-gray-700/80 text-white px-4 py-2 rounded-lg mt-4 shadow-lg">
        <span className="text-2xl">👥</span>
        <span>Time incompleto. Convide seus amigos!</span>
      </div>
    );
  }
  return null;
} 