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

interface JudgeAssignment {
  id: string;
  categoria: string;
  box: string;
  horario: string;
  status: 'pending' | 'confirmed' | 'completed';
  times: string[];
  observacoes?: string;
  data: Date;
}

interface UserData {
  name: string;
  userType: string;
  email: string;
  photoURL?: string;
  telefone?: string;
  experiencia?: string;
  certificacoes?: string[];
}

export default function JudgeDashboard() {
  return (
    <ProtectedRoute>
      <JudgeDashboardContent />
    </ProtectedRoute>
  );
}

function JudgeDashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
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

  const loadAssignments = useCallback(async (userId: string) => {
    try {
      const assignmentsQuery = query(
        collection(db, 'judge_assignments'), 
        where('judgeId', '==', userId)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JudgeAssignment));
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
        await loadAssignments(currentUser.uid);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData, loadAssignments]);

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

  const confirmedAssignments = assignments.filter(a => a.status === 'confirmed').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const totalTimes = assignments.reduce((sum, a) => sum + a.times.length, 0);

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
                  className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500"
                />
                <label className="absolute bottom-0 right-0 bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded-full cursor-pointer transition-colors">
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
                <h1 className="text-3xl font-bold text-white">⚖️ Dashboard Judge</h1>
                <p className="text-yellow-300">Gerencie suas atribuições de julgamento</p>
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
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">⚖️ Atribuições</h3>
              <p className="text-3xl font-bold text-yellow-400">{assignments.length}</p>
              <p className="text-gray-300 text-sm">Total de atribuições</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">✅ Confirmadas</h3>
              <p className="text-3xl font-bold text-green-400">{confirmedAssignments}</p>
              <p className="text-gray-300 text-sm">Atribuições confirmadas</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">🏆 Completadas</h3>
              <p className="text-3xl font-bold text-blue-400">{completedAssignments}</p>
              <p className="text-gray-300 text-sm">Atribuições finalizadas</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-white mb-2">👥 Times</h3>
              <p className="text-3xl font-bold text-purple-400">{totalTimes}</p>
              <p className="text-gray-300 text-sm">Times julgados</p>
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
                  <span className="text-yellow-400 font-semibold">Judge</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Certificação:</span>
                  <span className="text-yellow-400 font-semibold">✓ Certificado</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: PRÓXIMAS ATRIBUIÇÕES */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📅 Próximas Atribuições</h2>
            {assignments.filter(a => a.status === 'confirmed').length > 0 ? (
              <div className="space-y-4">
                {assignments
                  .filter(a => a.status === 'confirmed')
                  .slice(0, 3)
                  .map((assignment) => (
                  <div key={assignment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{assignment.categoria}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-400">Box:</span>
                            <p className="text-white">{assignment.box}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Horário:</span>
                            <p className="text-white">{assignment.horario}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Times:</span>
                            <p className="text-white">{assignment.times.length}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Data:</span>
                            <p className="text-white">{assignment.data.toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                        ✅ Confirmada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhuma atribuição confirmada encontrada.
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: HISTÓRICO DE JULGAMENTOS */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🏆 Histórico de Julgamentos</h2>
            {completedAssignments > 0 ? (
              <div className="space-y-3">
                {assignments
                  .filter(a => a.status === 'completed')
                  .slice(0, 3)
                  .map((assignment) => (
                  <div key={assignment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">{assignment.categoria}</h3>
                        <p className="text-gray-400 text-sm">
                          {assignment.box} • {assignment.times.length} times • {assignment.data.toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                        🏆 Completada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhum julgamento completado ainda.
              </p>
            )}
          </div>

          {/* SEÇÃO ESPECÍFICA: FERRAMENTAS DE JUDGE */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">🛠️ Ferramentas de Judge</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 font-semibold mb-2">📋 Checklist</h3>
                <p className="text-gray-300 text-sm mb-3">Lista de verificação para julgamentos</p>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                  Acessar
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                <h3 className="text-blue-400 font-semibold mb-2">📊 Resultados</h3>
                <p className="text-gray-300 text-sm mb-3">Visualizar resultados dos times</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                  Acessar
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <h3 className="text-green-400 font-semibold mb-2">📞 Suporte</h3>
                <p className="text-gray-300 text-sm mb-3">Canal de comunicação com organização</p>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors">
                  Contatar
                </button>
              </div>
            </div>
          </div>

          {/* SEÇÃO ESPECÍFICA: STATUS VISUAL */}
          <div className="mt-8 bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Status Visual</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status das Atribuições */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 font-semibold mb-2">⚖️ Status das Atribuições</h3>
                <div className="space-y-2">
                  {assignments.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Total:</span>
                        <span className="text-white font-semibold">{assignments.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Confirmadas:</span>
                        <span className="text-green-400 font-semibold">{confirmedAssignments}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Completadas:</span>
                        <span className="text-blue-400 font-semibold">{completedAssignments}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Status Geral:</span>
                        <span className={`font-semibold ${confirmedAssignments > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {confirmedAssignments > 0 ? '✅ Ativo' : '⏳ Aguardando'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-red-400 font-semibold">❌ Sem atribuições</span>
                      <p className="text-gray-400 text-sm mt-1">Aguarde atribuições</p>
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
                {assignments.length === 0 ? (
                  <div className="flex items-center space-x-2 text-yellow-300">
                    <span>⚖️</span>
                    <span>Aguardar atribuições de julgamento</span>
                  </div>
                ) : confirmedAssignments > 0 ? (
                  <div className="flex items-center space-x-2 text-green-300">
                    <span>✅</span>
                    <span>{confirmedAssignments} atribuição(ões) confirmada(s)! Prepare-se para julgar</span>
                  </div>
                ) : completedAssignments > 0 ? (
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span>🏆</span>
                    <span>{completedAssignments} julgamento(s) completado(s)! Excelente trabalho</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-blue-300">
                    <span>📋</span>
                    <span>Revisar critérios e preparar para julgamentos</span>
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
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                ⚖️ Painel Judge
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