import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGamification } from '@/hooks/useGamification';

interface Team {
  id: string;
  nome: string;
  captainId: string;
  atletas: string[];
  status: 'pending' | 'approved' | 'rejected';
  categoria: string;
  lote: string;
  box: string;
  cidade: string;
  estado: string;
  createdAt: Date;
}

interface Pedido {
  id: string;
  tipo: string;
  quantidade: number;
  valorTotal: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
}

interface UserData {
  name: string;
  userType: string;
  email: string;
  photoURL?: string;
  telefone?: string;
  categoria?: string;
  experiencia?: string;
}

export default function AtletaDashboard() {
  return (
    <ProtectedRoute>
      <AtletaDashboardContent />
    </ProtectedRoute>
  );
}

function AtletaDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userPedidos, setUserPedidos] = useState<Pedido[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const router = useRouter();
  
  // 🎯 GAMIFICAÇÃO
  const { stats: gamificationStats } = useGamification();

  const loadUserData = useCallback(async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError('Erro ao carregar dados do usuário');
    }
  }, []);

  const loadUserTeams = useCallback(async (userId: string) => {
    try {
      const teamsQuery = query(collection(db, 'teams'), where('atletas', 'array-contains', userId));
      const teamsSnapshot = await getDocs(teamsQuery);
      const teams = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Team));
      setUserTeams(teams);
    } catch (error) {
      console.error('Erro ao carregar times:', error);
    }
  }, []);

  const loadUserPedidos = useCallback(async (userId: string) => {
    try {
      const pedidosQuery = query(collection(db, 'pedidos'), where('userId', '==', userId));
      const pedidosSnapshot = await getDocs(pedidosQuery);
      const pedidos = pedidosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pedido));
      setUserPedidos(pedidos);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
        await loadUserTeams(currentUser.uid);
        await loadUserPedidos(currentUser.uid);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData, loadUserTeams, loadUserPedidos]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL
      });
      
      setUserData(prev => prev ? { ...prev, photoURL: downloadURL } : null);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      setError('Erro ao fazer upload da foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleLogout = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      setError(err.message); // Assuming err is an AuthError object
    } finally {
      setIsProcessing(false);
    }
  }, [router, isProcessing]);

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

  const approvedTeams = userTeams.filter(t => t.status === 'approved').length;
  const pendingTeams = userTeams.filter(t => t.status === 'pending').length;
  const paidPedidos = userPedidos.filter(p => p.status === 'paid').length;
  const totalSpent = userPedidos.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.valorTotal, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src={userData?.photoURL || user.photoURL || '/images/default-avatar.png'}
                  alt="Foto do perfil"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                />
                <label className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 text-white p-1 rounded-full cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploadingPhoto}
                  />
                  {isUploadingPhoto ? '⏳' : '📷'}
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">🏋️‍♀️ Dashboard Atleta</h1>
                <p className="text-green-300">Gerencie seus times e acompanhe a competição</p>
              </div>
            </div>
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

          {/* MÉTRICAS PRINCIPAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🏆 Times</h3>
              <p className="text-3xl font-bold text-green-400">{userTeams.length}</p>
              <p className="text-gray-300 text-sm">Total de times</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">✅ Aprovados</h3>
              <p className="text-3xl font-bold text-blue-400">{approvedTeams}</p>
              <p className="text-gray-300 text-sm">Times aprovados</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">💰 Pedidos</h3>
              <p className="text-3xl font-bold text-yellow-400">{userPedidos.length}</p>
              <p className="text-gray-300 text-sm">Total de pedidos</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">💳 Investido</h3>
              <p className="text-3xl font-bold text-purple-400">R$ {totalSpent.toFixed(0)}</p>
              <p className="text-gray-300 text-sm">Total investido</p>
            </div>
          </div>

          {/* SEÇÕES PRINCIPAIS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SEÇÃO PADRÃO: GAMIFICAÇÃO */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">🎯 Gamificação</h2>
              {gamificationStats ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Pontos:</span>
                    <span className="text-white font-semibold">{gamificationStats.points || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Nível:</span>
                    <span className="text-white font-semibold capitalize">{gamificationStats.level || 'iniciante'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Ações:</span>
                    <span className="text-white font-semibold">{gamificationStats.totalActions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Conquistas:</span>
                    <span className="text-white font-semibold">{gamificationStats.achievements?.length || 0}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Gamificação não disponível</p>
              )}
            </div>

            {/* SEÇÃO PADRÃO: STATUS */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
              <h2 className="text-xl font-semibold text-white mb-4">📊 Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Status Geral:</span>
                  <span className="text-green-400 font-semibold">Ativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Último Acesso:</span>
                  <span className="text-white font-semibold">Hoje</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tipo de Conta:</span>
                  <span className="text-green-400 font-semibold">Atleta</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Categoria:</span>
                  <span className="text-green-400 font-semibold">{userData?.categoria || 'Não definida'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: MEUS TIMES */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🏆 Meus Times</h2>
            {userTeams.length > 0 ? (
              <div className="space-y-4">
                {userTeams.map((team) => (
                  <div key={team.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{team.nome}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-400">Categoria:</span>
                            <p className="text-white">{team.categoria}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Box:</span>
                            <p className="text-white">{team.box}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Cidade:</span>
                            <p className="text-white">{team.cidade} - {team.estado}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Lote:</span>
                            <p className="text-white capitalize">{team.lote}</p>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ml-4 ${
                        team.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        team.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {team.status === 'approved' ? '✅ Aprovado' :
                         team.status === 'pending' ? '⏳ Pendente' : '❌ Rejeitado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Você ainda não participa de nenhum time. 
                <button 
                  onClick={() => router.push('/times')}
                  className="text-green-400 hover:text-green-300 ml-2 underline"
                >
                  Encontrar ou criar time
                </button>
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: PEDIDOS RECENTES */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">💰 Pedidos Recentes</h2>
            {userPedidos.length > 0 ? (
              <div className="space-y-3">
                {userPedidos.slice(0, 3).map((pedido) => (
                  <div key={pedido.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{pedido.tipo}</h3>
                        <p className="text-gray-400 text-sm">
                          Quantidade: {pedido.quantidade} | 
                          Criado em {pedido.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">R$ {pedido.valorTotal.toFixed(2)}</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pedido.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                          pedido.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {pedido.status === 'paid' ? '✅ Pago' :
                           pedido.status === 'pending' ? '⏳ Pendente' : '❌ Cancelado'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhum pedido encontrado.
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: STATUS VISUAL */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Status Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status do Time */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-2">🏆 Status do Time</h3>
                <div className="space-y-2">
                  {userTeams.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Times:</span>
                        <span className="text-white font-semibold">{userTeams.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Aprovados:</span>
                        <span className="text-green-400 font-semibold">{approvedTeams}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Pendentes:</span>
                        <span className="text-yellow-400 font-semibold">{pendingTeams}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Status Geral:</span>
                        <span className={`font-semibold ${approvedTeams > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {approvedTeams > 0 ? '✅ Completo' : '⏳ Incompleto'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-red-400 font-semibold">❌ Sem time</span>
                      <p className="text-gray-400 text-sm mt-1">Entre ou crie um time</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Nível de Gamificação */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-purple-400 font-semibold mb-2">🎯 Nível de Gamificação</h3>
                <div className="space-y-2">
                  {gamificationStats ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Nível:</span>
                        <span className="text-purple-400 font-semibold capitalize">{gamificationStats.level || 'iniciante'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Pontos:</span>
                        <span className="text-white font-semibold">{gamificationStats.points || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Conquistas:</span>
                        <span className="text-pink-400 font-semibold">{gamificationStats.achievements?.length || 0}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-400 font-semibold">🎮 Gamificação não disponível</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Próximas Ações Necessárias */}
            <div className="mt-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
              <h3 className="text-yellow-400 font-semibold mb-3">⚡ Próximas Ações Necessárias</h3>
              <div className="space-y-2">
                {userTeams.length === 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>🏆</span>
                    <span>Entrar ou criar um time para competir</span>
                  </div>
                ) : pendingTeams > 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>⏳</span>
                    <span>Aguardar aprovação de {pendingTeams} time(s)</span>
                  </div>
                ) : approvedTeams > 0 ? (
                  <div className="flex items-center space-x-2 text-green-300">
                    <span>✅</span>
                    <span>Time(s) aprovado(s)! Prepare-se para a competição</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span>💰</span>
                    <span>Completar pagamentos pendentes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AÇÕES RÁPIDAS */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">⚡ Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={() => router.push('/times')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                🏆 Gerenciar Times
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                👤 Meu Perfil
              </button>
              <button
                onClick={() => router.push('/links')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                🔗 Links Úteis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 