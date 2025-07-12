import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleAuthError } from '../utils/errorHandler';
import { getValidatedUserType } from '../utils/storage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGamification } from '@/hooks/useGamification';

interface Team {
  id: string;
  nome: string;
  captainId: string;
  atletas: string[];
  status: string;
}

interface Pedido {
  id: string;
  tipo: string;
  quantidade: number;
  valorTotal: number;
  status: string;
}

interface UserData {
  name: string;
  userType: string;
  email: string;
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userPedidos, setUserPedidos] = useState<Pedido[]>([]);
  const router = useRouter();
  
  // 🎯 GAMIFICAÇÃO
  const { stats: gamificationStats } = useGamification();

  const loadUserData = useCallback(async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        // Fallback para dados básicos
        setUserData({
          name: currentUser.displayName || 'Usuário',
          userType: getValidatedUserType(),
          email: currentUser.email || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError('Erro ao carregar dados do usuário');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData]);

  const handleLogout = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsProcessing(false);
    }
  }, [router, isProcessing]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

  useEffect(() => {
    const loadUserTeams = async () => {
      try {
        // Carregar times do usuário
        const teamsQuery = query(collection(db, 'teams'), where('atletas', 'array-contains', user?.uid));
        const teamsSnapshot = await getDocs(teamsQuery);
        const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        setUserTeams(teams);

        // Carregar pedidos do usuário
        const pedidosQuery = query(collection(db, 'pedidos'), where('userId', '==', user?.uid));
        const pedidosSnapshot = await getDocs(pedidosQuery);
        const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
        setUserPedidos(pedidos);
      } catch (error: unknown) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    if (user) {
      loadUserTeams();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              {userData?.userType === 'audiovisual' ? '📹 Dashboard Audiovisual' :
               userData?.userType === 'atleta' ? '🏋️‍♀️ Dashboard Atleta' :
               userData?.userType === 'publico' ? '👥 Dashboard Público' :
               userData?.userType === 'marketing' ? '📢 Dashboard Marketing' :
               userData?.userType === 'judge' ? '⚖️ Dashboard Judge' :
               'Dashboard'}
            </h1>
            <button
              onClick={handleLogout}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isProcessing ? 'Saindo...' : 'Sair'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 text-red-200">
              {error}
            </div>
          )}

          {/* Descrição personalizada baseada no tipo de usuário */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
            <p className="text-blue-200 text-center">
              {userData?.userType === 'audiovisual' ? '📹 Gerencie suas submissões audiovisuais e portfólio' :
               userData?.userType === 'atleta' ? '🏋️‍♀️ Gerencie seus times e acompanhe a competição' :
               userData?.userType === 'publico' ? '👥 Acompanhe informações do evento e participe como espectador' :
               userData?.userType === 'marketing' ? '📢 Acesse ferramentas de marketing e relatórios' :
               userData?.userType === 'judge' ? '⚖️ Acesse ferramentas de julgamento e resultados' :
               'Bem-vindo ao seu dashboard personalizado'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Informações do Usuário */}
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">👤 Informações do Usuário</h2>
              <div className="space-y-2 text-gray-300">
                <p><strong>Nome:</strong> {userData?.name || 'Não informado'}</p>
                <p><strong>Email:</strong> {userData?.email || user.email}</p>
                <p><strong>Tipo:</strong> {userData?.userType || 'Não definido'}</p>
              </div>
            </div>

            {/* Métricas de Gamificação */}
            {gamificationStats && (
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
                <h2 className="text-xl font-semibold text-white mb-4">🎯 Gamificação</h2>
                <div className="space-y-2 text-gray-300">
                  <p><strong>Pontos:</strong> {gamificationStats.points || 0}</p>
                  <p><strong>Nível:</strong> {gamificationStats.level || 'iniciante'}</p>
                  <p><strong>Ações:</strong> {gamificationStats.totalActions || 0}</p>
                  <p><strong>Conquistas:</strong> {gamificationStats.achievements?.length || 0}</p>
                </div>
              </div>
            )}

            {/* Métricas Específicas por Tipo */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">
                {userData?.userType === 'atleta' ? '🏋️‍♀️ Meus Times' :
                 userData?.userType === 'audiovisual' ? '📹 Submissões' :
                 '📊 Atividade'}
              </h2>
              <div className="space-y-2 text-gray-300">
                {userData?.userType === 'atleta' ? (
                  <>
                    <p><strong>Times:</strong> {userTeams.length}</p>
                    <p><strong>Status:</strong> {userTeams.length > 0 ? 'Ativo' : 'Sem time'}</p>
                    <p><strong>Pedidos:</strong> {userPedidos.length}</p>
                  </>
                ) : userData?.userType === 'audiovisual' ? (
                  <>
                    <p><strong>Submissões:</strong> {userPedidos.length}</p>
                    <p><strong>Status:</strong> {userPedidos.length > 0 ? 'Enviado' : 'Pendente'}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Atividade:</strong> Ativo</p>
                    <p><strong>Último acesso:</strong> Hoje</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-6 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">⚡ Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userData?.userType === 'audiovisual' ? (
                <>
                  <button
                    onClick={() => router.push('/dashboard/audiovisual')}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    📹 Dashboard Audiovisual
                  </button>
                  <button
                    onClick={() => router.push('/pagamento-audiovisual')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    💳 Pagamento Audiovisual
                  </button>
                </>
              ) : userData?.userType === 'atleta' ? (
                <>
                  <button
                    onClick={() => router.push('/dashboard/atleta')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    🏋️‍♀️ Dashboard Atleta
                  </button>
                  <button
                    onClick={() => router.push('/pagamento')}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    💳 Pagamento
                  </button>
                </>
              ) : userData?.userType === 'marketing' ? (
                <button
                  onClick={() => router.push('/dashboard/marketing')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  📢 Dashboard Marketing
                </button>
              ) : userData?.userType === 'judge' ? (
                <button
                  onClick={() => router.push('/dashboard/judge')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  ⚖️ Dashboard Judge
                </button>
              ) : userData?.userType === 'publico' ? (
                <button
                  onClick={() => router.push('/dashboard/publico')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  👥 Dashboard Público
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/audiovisual')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    📹 Área Audiovisual
                  </button>
                  <button
                    onClick={() => router.push('/times')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    🏋️‍♀️ Gerenciar Times
                  </button>
                </>
              )}
              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                👤 Meu Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 