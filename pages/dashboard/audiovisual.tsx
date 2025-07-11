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

interface AudiovisualSubmission {
  id: string;
  tipo: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  portfolio: string[];
  experiencia: string;
  equipamentos: string[];
}

interface UserData {
  name: string;
  userType: string;
  email: string;
  photoURL?: string;
  telefone?: string;
  portfolio?: {
    urls: string[];
    descricao: string;
    experiencia: string;
    equipamentos: string[];
    especialidades: string[];
  };
}

export default function AudiovisualDashboard() {
  return (
    <ProtectedRoute>
      <AudiovisualDashboardContent />
    </ProtectedRoute>
  );
}

function AudiovisualDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [submissions, setSubmissions] = useState<AudiovisualSubmission[]>([]);
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

  const loadSubmissions = useCallback(async (userId: string) => {
    try {
      const submissionsQuery = query(
        collection(db, 'audiovisual'), 
        where('userId', '==', userId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AudiovisualSubmission));
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Erro ao carregar submissões:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
        await loadSubmissions(currentUser.uid);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData, loadSubmissions]);

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

  const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
  const totalPortfolioItems = userData?.portfolio?.urls?.length || 0;

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
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500"
                />
                <label className="absolute bottom-0 right-0 bg-cyan-600 hover:bg-cyan-700 text-white p-1 rounded-full cursor-pointer transition-colors">
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
                <h1 className="text-3xl font-bold text-white">📹 Dashboard Audiovisual</h1>
                <p className="text-cyan-300">Gerencie suas submissões e portfólio</p>
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
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg p-6 border border-cyan-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">📸 Submissões</h3>
              <p className="text-3xl font-bold text-cyan-400">{submissions.length}</p>
              <p className="text-gray-300 text-sm">Total enviadas</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">✅ Aprovadas</h3>
              <p className="text-3xl font-bold text-green-400">{approvedSubmissions}</p>
              <p className="text-gray-300 text-sm">Submissões aprovadas</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">⏳ Pendentes</h3>
              <p className="text-3xl font-bold text-yellow-400">{pendingSubmissions}</p>
              <p className="text-gray-300 text-sm">Aguardando aprovação</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🎨 Portfólio</h3>
              <p className="text-3xl font-bold text-purple-400">{totalPortfolioItems}</p>
              <p className="text-gray-300 text-sm">Itens no portfólio</p>
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
                  <span className="text-cyan-400 font-semibold">Audiovisual</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Verificação:</span>
                  <span className="text-green-400 font-semibold">✓ Verificado</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: SUBMISSÕES RECENTES */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📤 Submissões Recentes</h2>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{submission.tipo}</h3>
                        <p className="text-gray-400 text-sm">
                          Enviado em {submission.submittedAt.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {submission.status === 'approved' ? '✅ Aprovado' :
                         submission.status === 'pending' ? '⏳ Pendente' : '❌ Rejeitado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhuma submissão encontrada. 
                <button 
                  onClick={() => router.push('/audiovisual')}
                  className="text-cyan-400 hover:text-cyan-300 ml-2 underline"
                >
                  Fazer primeira submissão
                </button>
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: STATUS VISUAL */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Status Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status da Submissão */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
                <h3 className="text-cyan-400 font-semibold mb-2">📤 Status da Submissão</h3>
                <div className="space-y-2">
                  {submissions.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Total:</span>
                        <span className="text-white font-semibold">{submissions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Aprovadas:</span>
                        <span className="text-green-400 font-semibold">{approvedSubmissions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Pendentes:</span>
                        <span className="text-yellow-400 font-semibold">{pendingSubmissions}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-red-400 font-semibold">❌ Nenhuma submissão</span>
                      <p className="text-gray-400 text-sm mt-1">Faça sua primeira submissão</p>
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
                {submissions.length === 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>📤</span>
                    <span>Fazer primeira submissão audiovisual</span>
                  </div>
                ) : pendingSubmissions > 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>⏳</span>
                    <span>Aguardar aprovação de {pendingSubmissions} submissão(ões)</span>
                  </div>
                ) : approvedSubmissions > 0 ? (
                  <div className="flex items-center space-x-2 text-green-300">
                    <span>✅</span>
                    <span>Todas as submissões aprovadas! Prepare-se para o evento</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span>📝</span>
                    <span>Atualizar portfólio e informações</span>
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
                onClick={() => router.push('/audiovisual')}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                📹 Nova Submissão
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                👤 Meu Perfil
              </button>
              <button
                onClick={() => router.push('/audiovisual/form')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                📝 Formulário Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 