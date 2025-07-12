import React, { useState } from 'react';
import { useFlowPay } from '../hooks/useFlowPay';

interface FlowPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  amount: number;
}

export const FlowPayModal: React.FC<FlowPayModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  amount
}) => {
  const [step, setStep] = useState<'init' | 'qr' | 'success' | 'error'>('init');
  const { createCharge, qrCode, isLoading, error } = useFlowPay();

  const handleCreatePayment = async () => {
    try {
      setStep('qr');
      await createCharge({
        correlationID: teamId,
        value: amount,
        comment: `Pagamento - ${teamName}`
      });
    } catch (err) {
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('init');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pagamento PIX</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {step === 'init' && (
          <div className="text-center">
            <p className="mb-4">Time: <strong>{teamName}</strong></p>
            <p className="mb-4">Valor: <strong>R$ {amount.toFixed(2)}</strong></p>
            <button
              onClick={handleCreatePayment}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Gerando...' : 'Gerar PIX'}
            </button>
          </div>
        )}

        {step === 'qr' && qrCode && (
          <div className="text-center">
            <p className="mb-4">Escaneie o QR Code para pagar:</p>
            <div className="mb-4">
              <img src={qrCode} alt="QR Code PIX" className="mx-auto" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Após o pagamento, o status será atualizado automaticamente
            </p>
            <button
              onClick={handleClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao gerar pagamento</p>
            <button
              onClick={handleClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 