import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import IntroVideo from '../components/IntroVideo';
import { saveCategoria } from '../utils/storage';

export default function IndexPage() {
  const router = useRouter();
  const { user, signInWithGoogle } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    // Verificar se já está logado ANTES de tudo
    const logged = localStorage.getItem('logged');
    const userData = localStorage.getItem('user');
    
    if (logged === 'true' && userData) {
      console.log('✅ Usuário já autenticado, redirecionando para /home');
      router.replace('/home');
      return;
    }

    // Se não está logado, verificar se já viu o intro
    const introWatched = localStorage.getItem('intro_watched');
    if (introWatched === 'true') {
      console.log('🎬 Intro já assistido, mostrando tela de login');
      setShowIntro(false);
    }
  }, [router]);

  const handleIntroFinish = () => {
    console.log('🎬 Intro finalizado - chamando onFinish');
    localStorage.setItem('intro_watched', 'true');
    setShowIntro(false);
    setIntroFinished(true);
  };

  const startGoogleAuth = async () => {
    if (isLoading) {
      console.log('⚠️ Login já em andamento, ignorando...');
      return;
    }

    setIsLoading(true);
    console.log('🔐 Iniciando autenticação Google...');

    try {
      const result = await signInWithGoogle();
      console.log('✅ Login bem-sucedido:', result);

      // Salvar dados no localStorage
      localStorage.setItem('logged', 'true');
      localStorage.setItem('authenticated', 'true'); // Flag adicional
      localStorage.setItem('user', JSON.stringify({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        providerData: result.user.providerData,
        loginTime: Date.now()
      }));

      // Salvar categoria padrão
      saveCategoria('atleta');

      console.log('💾 Dados salvos no localStorage');
      console.log('🔄 Redirecionando para /home...');
      
      // Forçar redirecionamento
      window.location.href = '/home';
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setIsLoading(false);
    }
  };

  const handleSkipIntro = () => {
    console.log('⏭️ Intro pulado manualmente');
    localStorage.setItem('intro_watched', 'true');
    setShowIntro(false);
    setIntroFinished(true);
  };

  // Mostrar intro se necessário
  if (showIntro) {
    return <IntroVideo onFinish={handleIntroFinish} />;
  }

  // Se o intro terminou mas ainda não fez login, mostrar tela de login
  if (introFinished && !isLoading) {
    return (
      <>
        <Head>
          <title>CERRADØ INTERBOX 2025</title>
          <meta name="description" content="O maior evento de CrossFit do Centro-Oeste" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-xl mb-2">🔐 Conectando com Google...</p>
                <p className="text-sm text-gray-300">Aguarde um momento</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
              <Image 
                src="/logos/logo_circulo.png" 
                alt="CERRADØ" 
                width={128}
                height={128}
                className="mx-auto mb-6 animate-pulse"
              />
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                CERRADØ
              </h1>
              <p className="text-2xl md:text-3xl text-gray-300 mb-8">
                INTERBOX 2025
              </p>
              <div className="bg-red-600 text-white px-6 py-2 rounded-full inline-block mb-8">
                🚀 FLUXO PRO BRUTO FUNCIONAR
              </div>
            </div>

            {/* Login Section */}
            <div className="max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                🔐 FAÇA LOGIN PARA CONTINUAR
              </h2>
              
              <button
                onClick={startGoogleAuth}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 py-4 px-6 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{isLoading ? 'Conectando...' : 'Entrar com Google'}</span>
              </button>

              <p className="text-center text-gray-300 mt-4 text-sm">
                Clique para iniciar o fluxo de autenticação
              </p>
            </div>

            {/* Debug Info */}
            <div className="max-w-md mx-auto bg-black bg-opacity-50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">🐛 Debug Info</h3>
              <div className="text-xs text-gray-300 space-y-1">
                <p><strong>showIntro:</strong> {showIntro.toString()}</p>
                <p><strong>introFinished:</strong> {introFinished.toString()}</p>
                <p><strong>isLoading:</strong> {isLoading.toString()}</p>
                <p><strong>localStorage.logged:</strong> {localStorage.getItem('logged') || 'null'}</p>
                <p><strong>localStorage.authenticated:</strong> {localStorage.getItem('authenticated') || 'null'}</p>
                <p><strong>localStorage.intro_watched:</strong> {localStorage.getItem('intro_watched') || 'null'}</p>
                <p><strong>localStorage.user:</strong> {localStorage.getItem('user') ? 'Presente' : 'Ausente'}</p>
                <p><strong>User object:</strong> {user ? 'Presente' : 'Ausente'}</p>
              </div>
            </div>

            {/* Skip Intro Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleSkipIntro}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ⏭️ Pular Intro (Debug)
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-xl">Carregando...</p>
      </div>
    </div>
  );
} 