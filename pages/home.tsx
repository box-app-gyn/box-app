import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Constantes de segurança
const AUTH_TIMEOUT_MS = 10000; // 10 segundos
const MAX_RETRY_ATTEMPTS = 3;
const MOBILE_USER_AGENTS = /iphone|ipad|ipod|android|blackberry|iemobile|opera mini/i;

// Tipos de segurança
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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Estados seguros
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userData: null,
    isLoading: true,
    error: null
  });

  // Refs para evitar race conditions
  const authTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isUnmountingRef = useRef(false);

  // Sanitizar dados do usuário
  const sanitizeUserData = useCallback((userData: any): SecureUserData | null => {
    try {
      if (!userData || typeof userData !== 'object') return null;

      return {
        displayName: typeof userData.displayName === 'string' ? userData.displayName.slice(0, 100) : undefined,
        email: typeof userData.email === 'string' && userData.email.includes('@') ? userData.email : undefined,
        uid: typeof userData.uid === 'string' ? userData.uid.slice(0, 128) : undefined,
        photoURL: typeof userData.photoURL === 'string' && userData.photoURL.startsWith('http') ? userData.photoURL : undefined,
        providerData: Array.isArray(userData.providerData) ? userData.providerData.slice(0, 5) : undefined,
        loginTime: typeof userData.loginTime === 'number' ? userData.loginTime : undefined
      };
    } catch (error) {
      console.error('Erro ao sanitizar dados do usuário:', error);
      return null;
    }
  }, []);

  // Verificar se é dispositivo móvel de forma segura
  const isMobileDevice = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const userAgent = navigator.userAgent.toLowerCase();
      return MOBILE_USER_AGENTS.test(userAgent);
    } catch (error) {
      console.error('Erro ao detectar dispositivo móvel:', error);
      return false;
    }
  }, []);

  // Verificar autenticação de forma segura
  const verifyAuthentication = useCallback(async (): Promise<void> => {
    if (isUnmountingRef.current) return;

    try {
      // Timeout de segurança
      const timeoutPromise = new Promise<never>((_, reject) => {
        authTimeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout de autenticação'));
        }, AUTH_TIMEOUT_MS);
      });

      const authCheck = async (): Promise<void> => {
        if (typeof window === 'undefined') {
          throw new Error('Executando no servidor');
        }

        const logged = localStorage.getItem('logged');
        const authenticated = localStorage.getItem('authenticated');
        const userDataStr = localStorage.getItem('user');

        // Validações rigorosas
        if (!logged || logged !== 'true' || !authenticated || authenticated !== 'true' || !userDataStr) {
          throw new Error('Dados de autenticação inválidos');
        }

        // Verificar se os dados não foram manipulados
        if (userDataStr.length > 10000) { // Limite de tamanho
          throw new Error('Dados de usuário muito grandes');
        }

        const parsedUserData = JSON.parse(userDataStr);
        const sanitizedData = sanitizeUserData(parsedUserData);

        if (!sanitizedData || !sanitizedData.uid || !sanitizedData.email) {
          throw new Error('Dados de usuário inválidos após sanitização');
        }

        // Verificar se o login não é muito antigo (24 horas)
        if (sanitizedData.loginTime) {
          const loginAge = Date.now() - sanitizedData.loginTime;
          if (loginAge > 24 * 60 * 60 * 1000) {
            throw new Error('Sessão expirada');
          }
        }

        setAuthState({
          isAuthenticated: true,
          userData: sanitizedData,
          isLoading: false,
          error: null
        });
      };

      await Promise.race([authCheck(), timeoutPromise]);
    } catch (error) {
      if (isUnmountingRef.current) return;

      console.error('Erro na verificação de autenticação:', error);
      
      // Limpar dados corrompidos
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logged');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');
      }

      // Retry logic com backoff exponencial
      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
        
        setTimeout(() => {
          if (!isUnmountingRef.current) {
            verifyAuthentication();
          }
        }, delay);
        return;
      }

      setAuthState({
        isAuthenticated: false,
        userData: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });

      // Redirecionar após falhas
      router.replace('/');
    } finally {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    }
  }, [router, sanitizeUserData]);

  // Logout seguro
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      console.log('🚪 Iniciando logout seguro...');
      
      // Limpar dados locais primeiro
      if (typeof window !== 'undefined') {
        localStorage.removeItem('logged');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('intro_watched');
      }

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

  // Efeitos de segurança
  useEffect(() => {
    // Verificar dispositivo móvel
    if (typeof window !== 'undefined' && !isMobileDevice()) {
      router.replace('/acesso-mobile-obrigatorio');
      return;
    }

    // Verificar autenticação
    verifyAuthentication();

    // Cleanup
    return () => {
      isUnmountingRef.current = true;
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, [router, isMobileDevice, verifyAuthentication]);

  // Loading state seguro
  if (authState.isLoading || authLoading) {
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
              <p><strong>Retry Count:</strong> {retryCountRef.current}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 