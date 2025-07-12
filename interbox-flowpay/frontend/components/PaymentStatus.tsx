import React from 'react';

interface PaymentStatusProps {
  status: 'pending' | 'paid' | 'cancelled';
  amount?: number;
  paidAt?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  amount,
  paidAt
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'paid':
        return {
          text: 'Pago',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '✅'
        };
      case 'pending':
        return {
          text: 'Pendente',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '⏳'
        };
      case 'cancelled':
        return {
          text: 'Cancelado',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '❌'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      <span className="mr-2">{config.icon}</span>
      {config.text}
      {amount && (
        <span className="ml-2 font-bold">
          R$ {amount.toFixed(2)}
        </span>
      )}
      {paidAt && status === 'paid' && (
        <span className="ml-2 text-xs opacity-75">
          {new Date(paidAt).toLocaleDateString('pt-BR')}
        </span>
      )}
    </div>
  );
}; 