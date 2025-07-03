'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PIXQRCodeProps {
  valor: number;
  categoria: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export default function PIXQRCode({ valor, categoria, onPaymentSuccess, onPaymentError }: PIXQRCodeProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setPaymentStatus('error');
      onPaymentError('Tempo expirado. Tente novamente.');
    }
  }, [timeLeft, paymentStatus, onPaymentError]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('processing');
    
    // Simular processamento de pagamento
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% de chance de sucesso
      
      if (success) {
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else {
        setPaymentStatus('error');
        onPaymentError('Pagamento não autorizado. Tente novamente.');
      }
    }, 3000);
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setTimeLeft(300);
    setShowInstructions(false);
  };

  return (
    <div className="space-y-6">
      {/* Timer */}
      {paymentStatus === 'pending' && (
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Tempo restante para pagamento</div>
          <div className="text-2xl font-bold text-pink-600">{formatTime(timeLeft)}</div>
        </div>
      )}

      {/* QR Code */}
      {paymentStatus === 'pending' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-8 text-center"
        >
          <div className="mb-4">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-sm text-gray-600">QR Code PIX</p>
                <p className="text-xs text-gray-500">R$ {valor.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <strong>Chave PIX:</strong> cerrado@interbox.com.br
            </div>
            <div className="text-sm text-gray-600">
              <strong>Valor:</strong> R$ {valor.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              <strong>Categoria:</strong> {categoria}
            </div>
          </div>
          
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="mt-4 text-pink-600 text-sm hover:text-pink-700 transition-colors"
          >
            {showInstructions ? 'Ocultar' : 'Ver'} instruções
          </button>
          
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-lg text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-2">Como pagar:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Abra seu app bancário</li>
                <li>2. Escolha a opção PIX</li>
                <li>3. Escaneie o QR Code acima</li>
                <li>4. Confirme o valor e dados</li>
                <li>5. Digite sua senha</li>
                <li>6. Aguarde a confirmação</li>
              </ol>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Processing */}
      {paymentStatus === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
          <p className="text-gray-600">Processando pagamento...</p>
          <p className="text-sm text-gray-500">Aguarde, estamos verificando sua transação</p>
        </motion.div>
      )}

      {/* Success */}
      {paymentStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <p className="text-green-600 font-semibold">Pagamento confirmado!</p>
          <p className="text-sm text-gray-600">Sua inscrição foi processada com sucesso</p>
        </motion.div>
      )}

      {/* Error */}
      {paymentStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold">Erro no pagamento</p>
          <p className="text-sm text-gray-600">Não foi possível processar sua transação</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </motion.div>
      )}

      {/* Simulate Button (apenas para desenvolvimento) */}
      {paymentStatus === 'pending' && (
        <button
          onClick={handleSimulatePayment}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
        >
          Simular Pagamento (Dev)
        </button>
      )}
    </div>
  );
} 