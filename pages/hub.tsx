import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Hero from '@/components/Hero';
import Beneficios from '@/components/Beneficios';
import CallToAction from '@/components/CallToAction';
import GamificationDemo from '@/components/GamificationDemo';
import GamifiedRewards from '@/components/GamifiedRewards';
import GamifiedLeaderboard from '@/components/GamifiedLeaderboard';
import TimesFormadosSection from '@/components/TimesFormadosSection';
import Sobre from '@/components/Sobre';

export default function HubPage() {
  return (
    <ProtectedRoute>
      <HubContent />
    </ProtectedRoute>
  );
}

function HubContent() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Hub - Cerrado Interbox</title>
        <meta name="description" content="Painel principal do usuário - Cerrado Interbox" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {/* Header simples */}
      <header className="w-full flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/logos/logo_circulo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="text-lg font-bold text-white">CERRADØ HUB</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sair
        </button>
      </header>
      <main className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen w-full pb-16">
        {/* HERO */}
        <Hero />
        {/* BENEFÍCIOS */}
        <Beneficios />
        {/* GAMIFICAÇÃO */}
        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-4 py-12">
          <GamificationDemo />
          <GamifiedRewards />
        </section>
        {/* LEADERBOARD */}
        <section className="max-w-3xl mx-auto px-4 py-8">
          <GamifiedLeaderboard />
        </section>
        {/* TIMES FORMADOS */}
        <TimesFormadosSection />
        {/* CALL TO ACTION */}
        <CallToAction />
        {/* SOBRE */}
        <Sobre />
      </main>
    </>
  );
} 