import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../lib/firebase';
import { handleAuthError } from '../../utils/errorHandler';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useGamification } from '@/hooks/useGamification';

interface EventInfo {
  id: string;
  titulo: string;
  data: Date;
  horario: string;
  local: string;
  tipo: 'workshop' | 'palestra' | 'networking' | 'showcase';
  status: 'upcoming' | 'ongoing' | 'completed';
  inscritos: number;
  capacidade: number;
}

interface UserData {
  name: string;
  userType: string;
  email: string;
  photoURL?: string;
  telefone?: string;
  interesses?: string[];
}

export default function PublicoDashboard() {
  return (
    <ProtectedRoute>
      <PublicoDashboardContent />
    </ProtectedRoute>
  );
}

function PublicoDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventos, setEventos] = useState<EventInfo[]>([]);
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

  const loadEventos = useCallback(async () => {
    try {
      const eventosQuery = query(collection(db, 'eventos_publico'));
      const eventosSnapshot = await getDocs(eventosQuery);
      const eventosData = eventosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EventInfo));
      setEventos(eventosData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
        await loadEventos();
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData, loadEventos]);

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

  const upcomingEvents = eventos.filter(e => e.status === 'upcoming').length;
  const ongoingEvents = eventos.filter(e => e.status === 'ongoing').length;
  const totalEvents = eventos.length;

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
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-500"
                />
                <label className="absolute bottom-0 right-0 bg-gray-600 hover:bg-gray-700 text-white p-1 rounded-full cursor-pointer transition-colors">
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
                <h1 className="text-3xl font-bold text-white">👥 Dashboard Público</h1>
                <p className="text-gray-300">Acompanhe informações do evento e participe como espectador</p>
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
            <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-lg p-6 border border-gray-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">📅 Eventos</h3>
              <p className="text-3xl font-bold text-gray-400">{totalEvents}</p>
              <p className="text-gray-300 text-sm">Total de eventos</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">⏰ Próximos</h3>
              <p className="text-3xl font-bold text-green-400">{upcomingEvents}</p>
              <p className="text-gray-300 text-sm">Eventos futuros</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🎯 Ativos</h3>
              <p className="text-3xl font-bold text-blue-400">{ongoingEvents}</p>
              <p className="text-gray-300 text-sm">Eventos em andamento</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🎁 Benefícios</h3>
              <p className="text-3xl font-bold text-purple-400">5</p>
              <p className="text-gray-300 text-sm">Benefícios disponíveis</p>
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
                  <span className="text-gray-400 font-semibold">Público</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Acesso:</span>
                  <span className="text-green-400 font-semibold">✓ Liberado</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: PRÓXIMOS EVENTOS */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📅 Próximos Eventos</h2>
            {upcomingEvents > 0 ? (
              <div className="space-y-4">
                {eventos
                  .filter(e => e.status === 'upcoming')
                  .slice(0, 3)
                  .map((evento) => (
                  <div key={evento.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{evento.titulo}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-400">Data:</span>
                            <p className="text-white">{evento.data.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Horário:</span>
                            <p className="text-white">{evento.horario}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Local:</span>
                            <p className="text-white">{evento.local}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Tipo:</span>
                            <p className="text-white capitalize">{evento.tipo}</p>
                          </div>
                        </div>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                        ⏰ Próximo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhum evento próximo encontrado.
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: BENEFÍCIOS DO PÚBLICO */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🎁 Seus Benefícios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-2">🎫 Acesso ao Evento</h3>
                <p className="text-gray-300 text-sm mb-3">Acesso completo como espectador</p>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                  ✅ Ativo
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-blue-400 font-semibold mb-2">📱 App Oficial</h3>
                <p className="text-gray-300 text-sm mb-3">Acesso ao aplicativo do evento</p>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                  ✅ Ativo
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                <h3 className="text-purple-400 font-semibold mb-2">📊 Resultados</h3>
                <p className="text-gray-300 text-sm mb-3">Acompanhar resultados em tempo real</p>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">
                  ✅ Ativo
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 font-semibold mb-2">🎥 Transmissão</h3>
                <p className="text-gray-300 text-sm mb-3">Acesso à transmissão ao vivo</p>
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
                  ⏳ Em breve
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-lg p-4 border border-red-500/20">
                <h3 className="text-red-400 font-semibold mb-2">🏆 Ranking</h3>
                <p className="text-gray-300 text-sm mb-3">Acompanhar ranking dos times</p>
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                  ⏳ Em breve
                </span>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20">
                <h3 className="text-indigo-400 font-semibold mb-2">💬 Comunidade</h3>
                <p className="text-gray-300 text-sm mb-3">Acesso à comunidade do evento</p>
                <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full text-xs font-semibold">
                  ✅ Ativo
                </span>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: STATUS VISUAL */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Status Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status de Participação */}
              <div className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-lg p-4 border border-gray-500/20">
                <h3 className="text-gray-400 font-semibold mb-2">👥 Status de Participação</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Eventos:</span>
                    <span className="text-white font-semibold">{eventos.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Próximos:</span>
                    <span className="text-green-400 font-semibold">{upcomingEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Ativos:</span>
                    <span className="text-blue-400 font-semibold">{ongoingEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status Geral:</span>
                    <span className="text-green-400 font-semibold">✅ Ativo</span>
                  </div>
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
                {upcomingEvents > 0 ? (
                  <div className="flex items-center space-x-2 text-green-300">
                    <span>✅</span>
                    <span>{upcomingEvents} evento(s) próximo(s)! Prepare-se para participar</span>
                  </div>
                ) : ongoingEvents > 0 ? (
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span>🎯</span>
                    <span>{ongoingEvents} evento(s) em andamento! Acompanhe ao vivo</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>👀</span>
                    <span>Explore os eventos disponíveis e participe</span>
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
                onClick={() => router.push('/links')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                🔗 Links Úteis
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                👤 Meu Perfil
              </button>
              <button
                onClick={() => router.push('/times')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                🏆 Ver Times
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 