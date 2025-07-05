import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    displayName?: string;
    email?: string;
    uid?: string;
    photoURL?: string;
    providerData?: Array<{ providerId?: string }>;
    loginTime?: number;
  } | null>(null);

  // Redireciona para página de QR code se for desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /iphone|ipad|ipod|android|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
      if (!isMobile) {
        router.replace('/acesso-mobile-obrigatorio');
      }
    }
  }, [router]);

  useEffect(() => {
    // Verificar se está logado
    const checkAuth = async () => {
      const logged = localStorage.getItem('logged');
      const authenticated = localStorage.getItem('authenticated');
      const userDataStr = localStorage.getItem('user');
      
      console.log('🔍 Verificando autenticação:', { logged, authenticated, userDataStr });
      
      if (!logged || logged !== 'true' || !authenticated || !userDataStr) {
        console.log('❌ Usuário não autenticado, redirecionando...');
        // Limpar dados inválidos
        localStorage.removeItem('logged');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');
        router.replace('/');
        return;
      }

      try {
        const parsedUserData = JSON.parse(userDataStr);
        console.log('✅ Usuário autenticado:', parsedUserData);
        setUserData(parsedUserData);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Erro ao verificar usuário:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('logged');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('user');
        router.replace('/');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('logged');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('intro_watched'); // Reset intro também
    signOut(auth);
    router.replace('/login');
  };

  const handleContinue = () => {
    console.log('🚀 Continuando para o app...');
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>🏠 Home - CERRADØ</title>
        <meta name="description" content="Página inicial do CERRADØ INTERBOX 2025" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <Image 
              src="/logos/logo_circulo.png" 
              alt="CERRADØ" 
              width={96}
              height={96}
              className="mx-auto mb-6"
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

          {/* User Info */}
          <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">�� Informações do Usuário</h2>
            {userData && (
              <div className="space-y-3 text-white">
                <div className="flex items-center space-x-3">
                  <Image 
                    src={userData.photoURL as string || '/logos/logo_circulo.png'} 
                    alt="Avatar" 
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{userData.displayName || 'Usuário'}</p>
                    <p className="text-sm text-gray-300">{userData.email}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p><strong>ID:</strong> {userData.uid}</p>
                  <p><strong>Provedor:</strong> {userData.providerData?.[0]?.providerId || 'Google'}</p>
                  <p><strong>Logado em:</strong> {userData.loginTime ? new Date(userData.loginTime).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="max-w-md mx-auto space-y-4">
            <button
              onClick={handleContinue}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors"
            >
              🚀 CONTINUAR PARA O APP
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
            >
              🚪 SAIR
            </button>
          </div>

          {/* Debug Info */}
          <div className="max-w-md mx-auto mt-8 bg-black bg-opacity-50 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2">🐛 Debug Info</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p><strong>localStorage.logged:</strong> {localStorage.getItem('logged') || 'null'}</p>
              <p><strong>localStorage.authenticated:</strong> {localStorage.getItem('authenticated') || 'null'}</p>
              <p><strong>localStorage.user:</strong> {localStorage.getItem('user') ? 'Presente' : 'Ausente'}</p>
              <p><strong>localStorage.intro_watched:</strong> {localStorage.getItem('intro_watched') || 'null'}</p>
              <p><strong>Router pathname:</strong> {router.pathname}</p>
              <p><strong>User object:</strong> {user ? 'Presente' : 'Ausente'}</p>
              <p><strong>UserData state:</strong> {userData ? 'Presente' : 'Ausente'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 