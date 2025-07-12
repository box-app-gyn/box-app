import React, { useState } from 'react';
import { useRouter } from 'next/router';

interface TestTeamData {
  id: string;
  nome: string;
  categoria: string;
  valor: number;
  statusPagamento: 'pending' | 'paid' | 'cancelled';
  email: string;
}

export default function TestePagamentoPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<'init' | 'pix' | 'card' | 'success' | 'error'>('init');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teamData] = useState<TestTeamData>({
    id: `test-${Date.now()}`,
    nome: 'Time Teste',
    categoria: 'RX',
    valor: 150,
    statusPagamento: 'pending',
    email: 'teste@exemplo.com'
  });

  const handlePayment = () => {
    setIsModalOpen(true);
    setStep('init');
  };

  const handlePixPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://us-central1-interbox-app-8d400.cloudfunctions.net/api/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correlationID: teamData.id,
          value: teamData.valor,
          comment: `Pagamento - ${teamData.nome}`
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar cobrança PIX');
      }

      const data = await response.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setStep('pix');
      } else {
        throw new Error('QR Code não recebido');
      }
    } catch (error) {
      console.error('Erro PIX:', error);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://us-central1-interbox-app-8d400.cloudfunctions.net/api/card-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: teamData.nome,
          email: teamData.email,
          valor: teamData.valor,
          descricao: `Pagamento - ${teamData.nome}`
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar cartão');
      }

      const result = await response.json();
      if (result.url) {
        window.open(result.url, '_blank');
        setStep('success');
      } else {
        throw new Error('URL de pagamento não recebida');
      }
    } catch (error) {
      console.error('Erro cartão:', error);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setStep('init');
    setQrCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🧪 Teste de Pagamento</h1>
            <div className="flex gap-2">
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
              >
                ← Voltar
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border"
              >
                🏠 Home
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações do Time</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Nome:</span>
                  <span className="ml-2">{teamData.nome}</span>
                </div>
                <div>
                  <span className="font-medium">Categoria:</span>
                  <span className="ml-2">{teamData.categoria}</span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{teamData.email}</span>
                </div>
                <div>
                  <span className="font-medium">ID:</span>
                  <span className="ml-2 text-sm text-gray-600">{teamData.id}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Status do Pagamento</h2>
              <div className="space-y-4">
                <div className="text-2xl font-bold text-gray-900">
                  R$ {teamData.valor.toFixed(2)}
                </div>
                {teamData.statusPagamento === 'pending' && (
                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💳 Testar Pagamento (PIX ou Cartão)
                  </button>
                )}
                {teamData.statusPagamento === 'paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✅ Pagamento confirmado!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Teste concluído com sucesso.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informações do Teste</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Esta página funciona sem autenticação</li>
              <li>• Teste o fluxo completo de pagamento</li>
              <li>• Use PIX ou cartão de crédito</li>
              <li>• Backend: interbox-app-8d400 (correto)</li>
              <li>• Sem redirecionamentos para /hub</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {isModalOpen && (
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
                <p className="mb-4">Time: <strong>{teamData.nome}</strong></p>
                <p className="mb-6">Valor: <strong>R$ {teamData.valor.toFixed(2)}</strong></p>
                
                <div className="space-y-3">
                  <button
                    onClick={handlePixPayment}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <span className="mr-2">📱</span>
                    {isLoading ? 'Processando...' : 'Pagar com PIX'}
                  </button>
                  
                  <button
                    onClick={handleCardPayment}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <span className="mr-2">💳</span>
                    {isLoading ? 'Processando...' : 'Pagar com Cartão'}
                  </button>
                </div>
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

            {step === 'success' && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-green-600 mb-4 font-semibold">Pagamento iniciado!</p>
                <p className="text-sm text-gray-600 mb-4">
                  Verifique o status do pagamento no console.
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
                <p className="text-red-600 mb-4 font-semibold">Erro no pagamento</p>
                <p className="text-sm text-gray-600 mb-4">
                  Tente novamente ou entre em contato com o suporte.
                </p>
                <button
                  onClick={() => setStep('init')}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                >
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 