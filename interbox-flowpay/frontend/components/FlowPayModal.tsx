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
  const [step, setStep] = useState<'init' | 'method' | 'pix' | 'card' | 'success' | 'error'>('init');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
  const { createCharge, qrCode, isLoading, error } = useFlowPay();
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [cardLoading, setCardLoading] = useState(false);

  const handleCreatePayment = async () => {
    try {
      if (paymentMethod === 'pix') {
        setStep('pix');
        await createCharge({
          correlationID: teamId,
          value: amount,
          comment: `Pagamento - ${teamName}`
        });
      } else if (paymentMethod === 'card') {
        setStep('card');
      }
    } catch (err) {
      setStep('error');
    }
  };

  const handleCardPayment = async () => {
    setCardLoading(true);
    try {
      const response = await fetch('/api/pagar-com-cartao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: cardData.cardName,
          email: 'pagamento@interbox.com', // Pode ser ajustado conforme necessário
          valor: amount,
          descricao: `Pagamento - ${teamName}`
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const result = await response.json();
      
      if (result.url) {
        // Redirecionar para página de pagamento do cartão
        window.open(result.url, '_blank');
        setStep('success');
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (err) {
      setStep('error');
    } finally {
      setCardLoading(false);
    }
  };

  const handleClose = () => {
    setStep('init');
    setPaymentMethod(null);
    setCardData({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
    onClose();
  };

  const handleMethodSelect = (method: 'pix' | 'card') => {
    setPaymentMethod(method);
    setStep('method');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">💳 Pagamento</h2>
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
            <p className="mb-6">Valor: <strong>R$ {amount.toFixed(2)}</strong></p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleMethodSelect('pix')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">📱</span>
                Pagar com PIX
              </button>
              
              <button
                onClick={() => handleMethodSelect('card')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <span className="mr-2">💳</span>
                Pagar com Cartão
              </button>
            </div>
          </div>
        )}

        {step === 'method' && (
          <div className="text-center">
            <p className="mb-4">Método selecionado: <strong>{paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}</strong></p>
            <button
              onClick={handleCreatePayment}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Processando...' : 'Continuar'}
            </button>
          </div>
        )}

        {step === 'pix' && qrCode && (
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

        {step === 'card' && (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600">
              Você será redirecionado para a página de pagamento segura
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Informações do Pagamento:</h3>
              <p><strong>Time:</strong> {teamName}</p>
              <p><strong>Valor:</strong> R$ {amount.toFixed(2)}</p>
              <p><strong>Método:</strong> Cartão de Crédito</p>
            </div>

            <button
              onClick={handleCardPayment}
              disabled={cardLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {cardLoading ? 'Processando...' : 'Pagar com Cartão'}
            </button>
            
            <button
              onClick={() => setStep('init')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              Voltar
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-green-600 mb-4 font-semibold">Pagamento iniciado!</p>
            <p className="text-sm text-gray-600 mb-4">
              {paymentMethod === 'card' 
                ? 'Você foi redirecionado para a página de pagamento. Complete o processo para confirmar.'
                : 'Aguarde a confirmação do pagamento.'
              }
            </p>
            <button
              onClick={handleClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Fechar
            </button>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-600 mb-4">Erro ao processar pagamento</p>
            <p className="text-sm text-gray-600 mb-4">
              {error || 'Tente novamente ou escolha outro método de pagamento.'}
            </p>
            <button
              onClick={() => setStep('init')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 