import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FlowPayModal } from '../interbox-flowpay/frontend/components/FlowPayModal';
import { PaymentStatus } from '../interbox-flowpay/frontend/components/PaymentStatus';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface TeamData {
  id: string;
  nome: string;
  captainId: string;
  categoria: string;
  lote: string;
  valor?: number;
  valorInscricao?: number;
  statusPagamento?: 'pending' | 'paid' | 'cancelled';
  atletas: string[];
  box?: {
    nome: string;
    cidade: string;
    estado: string;
  };
  email?: string;
  paymentMethod?: 'pix' | 'card' | string;
  paidAt?: string;
}

const DEFAULT_TEAM: TeamData = {
  id: '',
  nome: '',
  captainId: '',
  categoria: '',
  lote: '',
  valor: 150,
  statusPagamento: 'pending',
  atletas: [],
  email: '',
};

export default function PagamentoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manualData, setManualData] = useState(DEFAULT_TEAM);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user) {
        setIsAnonymous(true);
        setLoading(false);
        return;
      }
      try {
        // Buscar times onde o usuário é capitão ou atleta
        const teamsQuery = query(
          collection(db, 'teams'),
          where('atletas', 'array-contains', user.uid)
        );
        const teamsSnapshot = await getDocs(teamsQuery);
        if (!teamsSnapshot.empty) {
          const teamDoc = teamsSnapshot.docs[0];
          setTeam({ id: teamDoc.id, ...teamDoc.data() } as TeamData);
        } else {
          setError('Nenhum time encontrado para este usuário');
        }
      } catch (error) {
        console.error('Erro ao buscar time:', error);
        setError('Erro ao carregar dados do time');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [user]);

  const handlePayment = () => {
    if (isAnonymous) {
      setTeam({ ...manualData, id: `anon-${Date.now()}` });
    }
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

  if (error && !isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/times')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Time
          </button>
        </div>
      </div>
    );
  }

  if (!team && !isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Time não encontrado</p>
          <button
            onClick={() => router.push('/times')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Time
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🏋️‍♀️ Pagamento do Time</h1>
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Voltar
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informações do Time</h2>
              {isAnonymous ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Time *</label>
                    <input
                      type="text"
                      required
                      value={manualData.nome}
                      onChange={e => setManualData({ ...manualData, nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    <input
                      type="text"
                      required
                      value={manualData.categoria}
                      onChange={e => setManualData({ ...manualData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={manualData.email}
                      onChange={e => setManualData({ ...manualData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <input
                      type="number"
                      value={manualData.valor}
                      onChange={e => setManualData({ ...manualData, valor: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
              ) : team ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Nome:</span>
                    <span className="ml-2">{team.nome}</span>
                  </div>
                  <div>
                    <span className="font-medium">Categoria:</span>
                    <span className="ml-2">{team.categoria}</span>
                  </div>
                  <div>
                    <span className="font-medium">Lote:</span>
                    <span className="ml-2">{team.lote}</span>
                  </div>
                  <div>
                    <span className="font-medium">Atletas:</span>
                    <span className="ml-2">{team.atletas?.length || 0}</span>
                  </div>
                  {team.email && (
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{team.email}</span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Status do Pagamento</h2>
              <div className="space-y-4">
                <PaymentStatus
                  status={(team?.statusPagamento || manualData.statusPagamento || 'pending')}
                  amount={team?.valor || team?.valorInscricao || manualData.valor || 0}
                  paymentMethod={team?.paymentMethod}
                  paidAt={team?.paidAt}
                />
                <div className="text-2xl font-bold text-gray-900">
                  R$ {(team?.valor || team?.valorInscricao || manualData.valor || 0).toFixed(2)}
                </div>
                {(team?.statusPagamento || manualData.statusPagamento || 'pending') === 'pending' && (
                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💳 Pagar (PIX ou Cartão)
                  </button>
                )}
                {(team?.statusPagamento || manualData.statusPagamento || 'pending') === 'paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✅ Pagamento confirmado!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Seu time está inscrito no evento.
                    </p>
                  </div>
                )}
                {(team?.statusPagamento || manualData.statusPagamento || 'pending') === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">
                      ❌ Pagamento cancelado
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      Entre em contato com o suporte.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {(team || isAnonymous) && (
        <FlowPayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          teamId={team?.id || manualData.id}
          teamName={team?.nome || manualData.nome}
          amount={team?.valor || team?.valorInscricao || manualData.valor || 0}
        />
      )}
    </div>
  );
} 