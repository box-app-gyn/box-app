import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import VideoSplashScreen from '../components/VideoSplashScreen';
import InscricoesSection from '../components/InscricoesSection';

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Splash só na primeira visita
    const alreadySeen = window.localStorage.getItem('splash_seen');
    if (alreadySeen) setShowSplash(false);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    window.localStorage.setItem('splash_seen', '1');
  };

  if (showSplash) {
    return <VideoSplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-700 p-6 relative z-10"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <Image
        src="/logos/oficial_logo.png"
        alt="Logo Cerrado Interbox"
        width={120}
        height={120}
        className="mb-8 drop-shadow-lg"
        priority
      />
      <h1 className="text-3xl font-bold text-white mb-2 text-center">INTERBØX 2025</h1>
      <p className="text-green-300 font-tech mb-8 text-center">Inscreva-se para competir ou cobrir o evento!</p>

      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={() => router.push('/login')}
          className="w-full flex items-center justify-center bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Entrar / Cadastrar
        </button>
        <button
          onClick={() => router.push('/teste-pagamento')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow"
        >
          🧪 Teste de Pagamento
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-8 text-center">Ao continuar, você concorda com os <Link href="/termos-uso" className="underline">Termos de Uso</Link>.</p>

      {/* Seção Inscreva-se Destacada */}
      <section className="w-full max-w-2xl mx-auto mt-16 mb-8 flex flex-col items-center">
        <div className="bg-white/10 border border-green-400/30 rounded-2xl shadow-lg p-8 w-full flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-green-300 mb-2 text-center">Ainda não faz parte?</h2>
          <p className="text-gray-200 mb-6 text-center">Garanta sua vaga no maior evento esportivo do Cerrado.<br/>Inscreva seu time ou sua equipe de mídia agora mesmo!</p>
          <Link href="/cadastro" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow transition-all duration-200">
            Inscreva-se
          </Link>
        </div>
      </section>

      {/* Seção de Links Rápidos */}
      <section className="w-full max-w-2xl mx-auto mt-8 flex flex-col items-center">
        <div className="bg-white/5 border border-white/20 rounded-xl shadow-lg p-6 w-full">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Links Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/hub')}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              🏠 Hub
            </button>
            <button
              onClick={() => router.push('/pagamento')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              💳 Pagamento
            </button>
            <button
              onClick={() => router.push('/audiovisual')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              📹 Audiovisual
            </button>
            <button
              onClick={() => router.push('/times')}
              className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
            >
              🏆 Times
            </button>
          </div>
        </div>
      </section>

      {/* Seção de Inscrições */}
      <InscricoesSection />
    </motion.main>
  );
} 