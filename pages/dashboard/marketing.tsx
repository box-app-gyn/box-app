import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import { handleAuthError } from '../../utils/errorHandler';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGamification } from '@/hooks/useGamification';

interface MarketingCampaign {
  id: string;
  nome: string;
  tipo: 'social' | 'email' | 'ads' | 'influencer';
  status: 'active' | 'paused' | 'completed';
  reach: number;
  engagement: number;
  conversions: number;
  budget: number;
  startDate: Date;
  endDate?: Date;
}

interface UserData {
  name: string;
  userType: string;
  email: string;
  photoURL?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
}

export default function MarketingDashboard() {
  return (
    <ProtectedRoute>
      <MarketingDashboardContent />
    </ProtectedRoute>
  );
}

function MarketingDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
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

  const loadCampaigns = useCallback(async (userId: string) => {
    try {
      const campaignsQuery = query(
        collection(db, 'marketing_campaigns'), 
        where('userId', '==', userId)
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaignsData = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MarketingCampaign));
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
        await loadCampaigns(currentUser.uid);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData, loadCampaigns]);

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
      setError(handleAuthError(err));
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

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
  const totalEngagement = campaigns.reduce((sum, c) => sum + c.engagement, 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

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
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                />
                <label className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-1 rounded-full cursor-pointer transition-colors">
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
                <h1 className="text-3xl font-bold text-white">📢 Dashboard Marketing</h1>
                <p className="text-orange-300">Gerencie campanhas e métricas de marketing</p>
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
            <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg p-6 border border-orange-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">📊 Campanhas</h3>
              <p className="text-3xl font-bold text-orange-400">{campaigns.length}</p>
              <p className="text-gray-300 text-sm">Total de campanhas</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🎯 Alcance</h3>
              <p className="text-3xl font-bold text-green-400">{totalReach.toLocaleString()}</p>
              <p className="text-gray-300 text-sm">Pessoas alcançadas</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">💬 Engajamento</h3>
              <p className="text-3xl font-bold text-blue-400">{totalEngagement.toLocaleString()}</p>
              <p className="text-gray-300 text-sm">Interações totais</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">💰 Orçamento</h3>
              <p className="text-3xl font-bold text-purple-400">R$ {totalBudget.toLocaleString()}</p>
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
                  <span className="text-orange-400 font-semibold">Marketing</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Empresa:</span>
                  <span className="text-orange-400 font-semibold">{userData?.empresa || 'Não informada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: CAMPANHAS ATIVAS */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Campanhas Ativas</h2>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.filter(c => c.status === 'active').map((campaign) => (
                  <div key={campaign.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{campaign.nome}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-400">Tipo:</span>
                            <p className="text-white capitalize">{campaign.tipo}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Alcance:</span>
                            <p className="text-white">{campaign.reach.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Engajamento:</span>
                            <p className="text-white">{campaign.engagement.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Orçamento:</span>
                            <p className="text-white">R$ {campaign.budget.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                        ✅ Ativa
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhuma campanha ativa encontrada.
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: MÉTRICAS DE PERFORMANCE */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📈 Métricas de Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-2">Taxa de Conversão</h3>
                <p className="text-2xl font-bold text-white">
                  {totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-gray-400 text-sm">Engajamento/Reach</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-blue-400 font-semibold mb-2">CPM Médio</h3>
                <p className="text-2xl font-bold text-white">
                  R$ {totalReach > 0 ? (totalBudget / (totalReach / 1000)).toFixed(2) : '0'}
                </p>
                <p className="text-gray-400 text-sm">Custo por mil impressões</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-purple-400 font-semibold mb-2">ROI Estimado</h3>
                <p className="text-2xl font-bold text-white">
                  {totalBudget > 0 ? ((totalEngagement * 0.1) / totalBudget * 100).toFixed(1) : '0'}%
                </p>
                <p className="text-gray-400 text-sm">Retorno sobre investimento</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: STATUS VISUAL */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Status Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status das Campanhas */}
              <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-lg p-4 border border-orange-500/20">
                <h3 className="text-orange-400 font-semibold mb-2">📢 Status das Campanhas</h3>
                <div className="space-y-2">
                  {campaigns.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Total:</span>
                        <span className="text-white font-semibold">{campaigns.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Ativas:</span>
                        <span className="text-green-400 font-semibold">{campaigns.filter(c => c.status === 'active').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Pausadas:</span>
                        <span className="text-yellow-400 font-semibold">{campaigns.filter(c => c.status === 'paused').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Status Geral:</span>
                        <span className={`font-semibold ${campaigns.filter(c => c.status === 'active').length > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {campaigns.filter(c => c.status === 'active').length > 0 ? '✅ Ativo' : '⏸️ Inativo'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-red-400 font-semibold">❌ Sem campanhas</span>
                      <p className="text-gray-400 text-sm mt-1">Crie sua primeira campanha</p>
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
                {campaigns.length === 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>📢</span>
                    <span>Criar primeira campanha de marketing</span>
                  </div>
                ) : campaigns.filter(c => c.status === 'paused').length > 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>⏸️</span>
                    <span>Reativar {campaigns.filter(c => c.status === 'paused').length} campanha(s) pausada(s)</span>
                  </div>
                ) : campaigns.filter(c => c.status === 'active').length > 0 ? (
                  <div className="flex items-center space-x-2 text-green-300">
                    <span>✅</span>
                    <span>{campaigns.filter(c => c.status === 'active').length} campanha(s) ativa(s)! Monitore os resultados</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span>📊</span>
                    <span>Analisar métricas e otimizar campanhas</span>
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
                onClick={() => router.push('/admin')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                📊 Painel Admin
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