import React, { useState } from 'react';
import VideoSplashScreen from '../components/VideoSplashScreen';
import Head from 'next/head';

export default function TestSplashPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashCompleted, setSplashCompleted] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashCompleted(true);
  };

  const resetSplash = () => {
    setShowSplash(true);
    setSplashCompleted(false);
  };

  return (
    <>
      <Head>
        <title>Teste Splash Screen - CERRADØ</title>
        <meta name="description" content="Página de teste do splash screen" />
      </Head>

      {showSplash ? (
        <VideoSplashScreen onComplete={handleSplashComplete} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-700 flex items-center justify-center p-6">
          <div className="text-center text-white max-w-md">
            <h1 className="text-4xl font-bold mb-6">🎬 Splash Screen Testado!</h1>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">✅ Checklist Concluído</h2>
              <ul className="text-left space-y-2">
                <li>✅ Vídeo carregou automaticamente</li>
                <li>✅ Loading spinner apareceu</li>
                <li>✅ Logo overlay funcionou</li>
                <li>✅ Botão "Pular" funcionou</li>
                <li>✅ Barra de progresso animada</li>
                <li>✅ Transição suave</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={resetSplash}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                🔄 Testar Novamente
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                🏠 Voltar ao Início
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-300">
              <p><strong>URL de Teste:</strong> http://192.168.1.101:3000/test-splash</p>
              <p><strong>Status:</strong> {splashCompleted ? 'Concluído' : 'Em andamento'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 