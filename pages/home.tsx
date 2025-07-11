import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Head from 'next/head';
import Image from 'next/image';

// Tipos
interface GamificationData {
  level: number;
  experience: number;
  points: number;
  achievements: string[];
}

interface SecureUserData {
  displayName?: string;
  email?: string;
  uid?: string;
  photoURL?: string;
  providerData?: Array<{ providerId?: string }>;
  loginTime?: number;
}

interface AuthState {
  isAuthenticated: boolean;
  userData: SecureUserData | null;
  isLoading: boolean;
  error: string | null;
}

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userData: null,
    isLoading: true,
    error: null
  });
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Sanitizar dados do usuário
  const sanitizeUserData = (userData: any): SecureUserData | null => {
    if (!userData || typeof userData !== 'object') return null;
    
    return {
      displayName: typeof userData.displayName === 'string' ? userData.displayName.slice(0, 100) : undefined,
      email: typeof userData.email === 'string' ? userData.email.slice(0, 100) : undefined,
      uid: typeof userData.uid === 'string' ? userData.uid.slice(0, 100) : undefined,
      photoURL: typeof userData.photoURL === 'string' ? userData.photoURL.slice(0, 500) : undefined,
      providerData: Array.isArray(userData.providerData) ? userData.providerData.slice(0, 5) : undefined,
      loginTime: typeof userData.loginTime === 'number' ? userData.loginTime : Date.now()
    };
  };

  // Verificar se é dispositivo móvel
  const isMobileDevice = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Verificação de autenticação simplificada
  useEffect(() => {
    // Verificar dispositivo móvel
    if (typeof window !== 'undefined' && !isMobileDevice()) {
      router.replace('/acesso-mobile-obrigatorio');
      return;
    }

    // Listener de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Usuário autenticado
        const sanitizedData = sanitizeUserData({
          ...currentUser,
          loginTime: Date.now()
        });

        setUser(currentUser);
        setAuthState({
          isAuthenticated: true,
          userData: sanitizedData,
          isLoading: false,
          error: null
        });
      } else {
        // Usuário não autenticado
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          userData: null,
          isLoading: false,
          error: 'Usuário não autenticado'
        });
      }
    });

    return () => unsubscribe();
  }, [router, isMobileDevice, sanitizeUserData]);

  // Logout seguro
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 Iniciando logout seguro...');
      
      // Logout do Firebase
      await signOut(auth);
      
      // Resetar estado
      setAuthState({
        isAuthenticated: false,
        userData: null,
        isLoading: false,
        error: null
      });

      // Redirecionar
      router.replace('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Forçar redirecionamento mesmo com erro
      router.replace('/login');
    }
  }, [router]);

  // Navegação segura
  const handleContinue = useCallback((): void => {
    try {
      console.log('🚀 Navegando para dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro na navegação:', error);
      // Fallback
      window.location.href = '/dashboard';
    }
  }, [router]);

  // Loading state seguro
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl">Verificando autenticação...</p>
          <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (authState.error || !authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="bg-red-600 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold mb-2">❌ Erro de Autenticação</h2>
            <p className="text-sm">{authState.error || 'Usuário não autenticado'}</p>
          </div>
          <button
            onClick={() => router.replace('/login')}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors"
          >
            🔐 Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>🏠 Home - CERRADØ</title>
        <meta name="description" content="Página inicial do CERRADØ INTERBOX 2025" />
        <meta name="robots" content="noindex, nofollow" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Seguro */}
          <div className="text-center mb-12">
            <Image 
              src="/logos/logo_circulo.png" 
              alt="CERRADØ" 
              width={96}
              height={96}
              className="mx-auto mb-6"
              priority
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              CERRADØ
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              INTERBOX 2025
            </p>
            <div className="bg-green-600 text-white px-6 py-2 rounded-full inline-block">
              ✅ LOGADO COM SUCESSO
            </div>
          </div>

          {/* Informações do Usuário Seguras */}
          {authState.userData && (
            <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">👤 Informações do Usuário</h2>
              <div className="space-y-3 text-white">
                <div className="flex items-center space-x-3">
                  <Image 
                    src={authState.userData.photoURL || '/logos/logo_circulo.png'} 
                    alt="Avatar" 
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{authState.userData.displayName || 'Usuário'}</p>
                    <p className="text-sm text-gray-300">{authState.userData.email}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>ID:</strong> {authState.userData.uid}</p>
                  <p><strong>Provedor:</strong> {authState.userData.providerData?.[0]?.providerId || 'Google'}</p>
                  <p><strong>Logado em:</strong> {authState.userData.loginTime ? new Date(authState.userData.loginTime).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* STATUS VISUAL COMPACTO */}
          {authState.isAuthenticated && authState.userData && (
            <StatusVisualHome userId={authState.userData.uid!} />
          )}

          {/* Ações Seguras */}
          <div className="max-w-md mx-auto space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              🚀 CONTINUAR PARA O APP
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              🚪 SAIR
            </button>
          </div>

          {/* Debug Info Seguro */}
          <div className="max-w-md mx-auto mt-8 bg-black bg-opacity-50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">🐛 Debug Info</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p><strong>Auth State:</strong> {authState.isAuthenticated ? 'Autenticado' : 'Não autenticado'}</p>
              <p><strong>User Data:</strong> {authState.userData ? 'Presente' : 'Ausente'}</p>
              <p><strong>Router pathname:</strong> {router.pathname}</p>
              <p><strong>Firebase User:</strong> {user ? 'Presente' : 'Ausente'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 

function StatusVisualHome({ userId }: { userId: string }) {
  const [userType, setUserType] = useState<string>('');
  const [gamification, setGamification] = useState<any>(null);
  const [teamStatus, setTeamStatus] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<string>('');
  const [campaignStatus, setCampaignStatus] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Buscar tipo de usuário
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      setUserType(userData?.role || 'publico');
      setGamification(userData?.gamification || null);

      // Atleta/Judge: status do time
      if (userData?.role === 'atleta' || userData?.role === 'judge') {
        const teamsQuery = query(collection(db, 'teams'), where('atletas', 'array-contains', userId));
        const teamsSnap = await getDocs(teamsQuery);
        const teams = teamsSnap.docs.map(doc => doc.data());
        if (teams.length === 0) {
          setTeamStatus('Sem time');
          setNextAction('Entrar ou criar um time');
        } else {
          const approved = teams.filter((t: any) => t.status === 'approved').length;
          const pending = teams.filter((t: any) => t.status === 'pending').length;
          if (approved > 0) {
            setTeamStatus('Completo');
            setNextAction('Acompanhe seu time');
          } else if (pending > 0) {
            setTeamStatus('Pendente');
            setNextAction('Aguardar aprovação do time');
          } else {
            setTeamStatus('Incompleto');
            setNextAction('Completar informações do time');
          }
        }
      }
      // Audiovisual: status da submissão
      else if (userData?.role === 'fotografo' || userData?.role === 'videomaker') {
        const subQuery = query(collection(db, 'audiovisual'), where('userId', '==', userId));
        const subSnap = await getDocs(subQuery);
        const subs = subSnap.docs.map(doc => doc.data());
        if (subs.length === 0) {
          setSubmissionStatus('Nenhuma submissão');
          setNextAction('Fazer primeira submissão');
        } else {
          const approved = subs.filter((s: any) => s.status === 'approved').length;
          const pending = subs.filter((s: any) => s.status === 'pending').length;
          if (approved > 0) {
            setSubmissionStatus('Aprovado');
            setNextAction('Acompanhe o evento');
          } else if (pending > 0) {
            setSubmissionStatus('Pendente');
            setNextAction('Aguardar aprovação da submissão');
          } else {
            setSubmissionStatus('Rejeitado');
            setNextAction('Reenviar submissão');
          }
        }
      }
      // Marketing: status de campanhas
      else if (userData?.role === 'marketing') {
        const campQuery = query(collection(db, 'marketing_campaigns'), where('userId', '==', userId));
        const campSnap = await getDocs(campQuery);
        const camps = campSnap.docs.map(doc => doc.data());
        if (camps.length === 0) {
          setCampaignStatus('Sem campanhas');
          setNextAction('Criar primeira campanha');
        } else {
          const active = camps.filter((c: any) => c.status === 'active').length;
          const paused = camps.filter((c: any) => c.status === 'paused').length;
          if (active > 0) {
            setCampaignStatus('Ativa');
            setNextAction('Acompanhe os resultados');
          } else if (paused > 0) {
            setCampaignStatus('Pausada');
            setNextAction('Reativar campanha');
          } else {
            setCampaignStatus('Inativa');
            setNextAction('Criar nova campanha');
          }
        }
      } else {
        setNextAction('Explorar o app');
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  // Layout sóbrio, compacto
  if (loading) return null;
  return (
    <div className="max-w-md mx-auto bg-gray-900/80 border border-gray-700 rounded-lg p-4 mb-8 text-gray-100">
      <div className="flex flex-col gap-2">
        {/* Nível de gamificação */}
        {gamification && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Nível:</span>
            <span className="font-semibold capitalize text-green-400">{gamification.level || 'iniciante'}</span>
            <span className="text-xs text-gray-400 ml-2">{gamification.points} pts</span>
          </div>
        )}
        {/* Status do time */}
        {userType === 'atleta' || userType === 'judge' ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Status do time:</span>
            <span className={`font-semibold ${teamStatus === 'Completo' ? 'text-green-400' : teamStatus === 'Pendente' ? 'text-yellow-400' : 'text-gray-400'}`}>{teamStatus}</span>
          </div>
        ) : null}
        {/* Status da submissão */}
        {(userType === 'fotografo' || userType === 'videomaker') && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Status da submissão:</span>
            <span className={`font-semibold ${submissionStatus === 'Aprovado' ? 'text-green-400' : submissionStatus === 'Pendente' ? 'text-yellow-400' : submissionStatus === 'Rejeitado' ? 'text-red-400' : 'text-gray-400'}`}>{submissionStatus}</span>
          </div>
        )}
        {/* Status de campanhas */}
        {userType === 'marketing' && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Status das campanhas:</span>
            <span className={`font-semibold ${campaignStatus === 'Ativa' ? 'text-green-400' : campaignStatus === 'Pausada' ? 'text-yellow-400' : 'text-gray-400'}`}>{campaignStatus}</span>
          </div>
        )}
        {/* Próxima ação */}
        {nextAction && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-400">Próxima ação:</span>
            <span className="font-semibold text-blue-300">{nextAction}</span>
          </div>
        )}
      </div>
    </div>
  );
} 