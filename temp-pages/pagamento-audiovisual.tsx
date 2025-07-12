import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FlowPayModal } from '../interbox-flowpay/frontend/components/FlowPayModal';
import { PaymentStatus } from '../interbox-flowpay/frontend/components/PaymentStatus';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AudiovisualData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  portfolio?: string;
  statusPagamento: 'pending' | 'paid' | 'cancelled';
  valor: number;
  createdAt: unknown;
  paymentMethod?: 'pix' | 'card' | string;
  paidAt?: string;
}

export default function PagamentoAudiovisualPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [audiovisualData, setAudiovisualData] = useState<AudiovisualData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    portfolio: ''
  });

  const VALOR_AUDIOVISUAL = 29.90;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchAudiovisualData = async () => {
      try {
        const audiovisualDoc = await getDoc(doc(db, 'audiovisual', user.uid));
        if (audiovisualDoc.exists()) {
          setAudiovisualData({ id: audiovisualDoc.id, ...audiovisualDoc.data() } as AudiovisualData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados audiovisual:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudiovisualData();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const audiovisualData = {
        id: user.uid,
        ...formData,
        statusPagamento: 'pending' as const,
        valor: VALOR_AUDIOVISUAL,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'audiovisual', user.uid), audiovisualData);
      setAudiovisualData(audiovisualData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const handlePayment = () => {
    if (!audiovisualData) return;
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">📹 Inscrição Audiovisual</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Voltar
            </button>
          </div>

          {!audiovisualData ? (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Informações do Evento</h2>
                <div className="space-y-3 text-gray-600">
                  <p><strong>Valor:</strong> R$ {VALOR_AUDIOVISUAL.toFixed(2)}</p>
                  <p><strong>Inclui:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Acesso à área de mídia</li>
                    <li>Credencial de fotógrafo/videomaker</li>
                    <li>Área de trabalho exclusiva</li>
                    <li>Networking com outros profissionais</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Dados para Inscrição</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portfólio (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                      placeholder="https://seu-portfolio.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continuar para Pagamento
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Informações da Inscrição</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Nome:</span>
                    <span className="ml-2">{audiovisualData.nome}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{audiovisualData.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span>
                    <span className="ml-2">{audiovisualData.telefone}</span>
                  </div>
                  {audiovisualData.portfolio && (
                    <div>
                      <span className="font-medium">Portfólio:</span>
                      <span className="ml-2">{audiovisualData.portfolio}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Status do Pagamento</h2>
                <div className="space-y-4">
                  <PaymentStatus
                    status={audiovisualData.statusPagamento}
                    amount={audiovisualData.valor}
                    paymentMethod={audiovisualData.paymentMethod}
                    paidAt={audiovisualData.paidAt}
                  />
                  
                  <div className="text-2xl font-bold text-gray-900">
                    R$ {audiovisualData.valor.toFixed(2)}
                  </div>

                  {audiovisualData.statusPagamento === 'pending' && (
                    <button
                      onClick={handlePayment}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      💳 Pagar (PIX ou Cartão)
                    </button>
                  )}

                  {audiovisualData.statusPagamento === 'paid' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        ✅ Pagamento confirmado!
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        Sua inscrição audiovisual está confirmada.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {audiovisualData && (
        <FlowPayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teamId={audiovisualData.id}
          teamName={audiovisualData.nome}
          amount={audiovisualData.valor}
        />
      )}
    </div>
  );
} 