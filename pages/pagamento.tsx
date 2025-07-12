import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import FlowPayModal from '../components/FlowPayModal';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface TeamData {
  id: string;
  nome: string;
  categoria: string;
  lote: string;
  valor: number;
  statusPagamento: 'pending' | 'paid' | 'cancelled';
  atletas: unknown[];
}

export default function PagamentoPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Exemplo: buscar um time fixo para teste público
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        // Substitua 'ID_DO_TIME' por um ID válido para teste público
        const teamDoc = await getDoc(doc(db, 'teams', 'ID_DO_TIME'));
        if (teamDoc.exists()) {
          setTeam({ id: teamDoc.id, ...teamDoc.data() } as TeamData);
        } else {
          setTeam(null);
        }
      } catch (error) {
        console.error('Erro ao buscar time:', error);
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handlePayment = () => {
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

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Time não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Pagamento</h1>
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
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Status do Pagamento</h2>
              <div className="space-y-4">
                <div className="text-2xl font-bold text-gray-900">
                  R$ {team.valor.toFixed(2)}
                </div>

                {team.statusPagamento === 'pending' && (
                  <button
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Pagar com PIX
                  </button>
                )}

                {team.statusPagamento === 'paid' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✅ Pagamento confirmado!
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Seu time está inscrito no evento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FlowPayModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={team.valor}
        pixCode="00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Teste Empresa6008Brasilia62070503***6304E2CA"
        qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Teste%20Empresa6008Brasilia62070503***6304E2CA"
        status="pending"
      />
    </div>
  );
} 