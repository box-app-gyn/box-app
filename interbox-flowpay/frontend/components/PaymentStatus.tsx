import React from 'react';

interface PaymentStatusProps {
  status: 'pending' | 'paid' | 'cancelled';
  amount?: number;
  paidAt?: string;
  paymentMethod?: 'pix' | 'card' | string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  amount,
  paidAt,
  paymentMethod
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

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'pix':
        return '📱';
      case 'card':
        return '💳';
      default:
        return '';
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
        <span className="mr-2">{config.icon}</span>
        {config.text}
        {paymentMethod && (
          <span className="ml-2">
            {getPaymentMethodIcon()} {paymentMethod.toUpperCase()}
          </span>
        )}
      </div>
      
      {amount && (
        <div className="text-lg font-semibold text-gray-900">
          R$ {amount.toFixed(2)}
        </div>
      )}
      
      {paidAt && status === 'paid' && (
        <div className="text-sm text-gray-500">
          Pago em {new Date(paidAt).toLocaleDateString('pt-BR')}
        </div>
      )}
    </div>
  );
}; 