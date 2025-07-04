import React, { useEffect, useState } from 'react';
import ParallaxWrapper from "@/components/ParallaxWrapper";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "@/components/Sobre";
import TempoReal from "@/components/TempoReal";
import Beneficios from "@/components/Beneficios";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import VideoSplashScreen from "@/components/VideoSplashScreen";
import InstallToast from "@/components/InstallToast";
import { usePWA } from "@/hooks/usePWA";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';

function LinhaDelicada() {
  return (
    <div className="flex justify-center">
              <Image src="/images/liner.png" alt="" className="h-0.5 w-full max-w-[400px] object-cover select-none pointer-events-none" draggable="false" width={400} height={1} style={{ width: 'auto', height: 'auto' }} priority />
    </div>
  );
}

// Componente de Modal de Inscrição
function InscricaoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decoração de canto */}
            <Image 
              src="/images/corner.png" 
              alt="" 
              className="absolute top-0 left-0 w-24 h-auto z-10" 
              width={96} 
              height={96} 
              style={{ width: 'auto', height: 'auto' }} 
            />
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                🏆 Entre na Arena do CERRADØ INTERBOX 2025
              </h2>
              <p className="text-neutral-300">
                24, 25 e 26 de outubro - Crie sua conta e comece sua jornada
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                <p className="text-pink-300 text-sm">
                  🎯 <strong>Bônus:</strong> Você ganhará <strong>10 XP</strong> por criar sua conta!
                </p>
              </div>

              {/* Botão Google */}
              <button
                type="button"
                onClick={() => window.location.href = '/cadastro'}
                className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar com Google</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
                >
                  Já tem conta? Entrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showInscricao, setShowInscricao] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { platform, isStandalone, markAsInstalled } = usePWA();
  const router = useRouter();

  // Verificar autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    markAsInstalled();
    
    // Se usuário não está logado, mostrar modal de inscrição
    if (!user && !isLoading) {
      setTimeout(() => {
        setShowInscricao(true);
      }, 1000);
    }
  };

  // Se usuário está logado e não está carregando, não redirecionar - deixar na home
  // O usuário pode navegar livremente pela home e usar o menu para acessar dashboard/perfil

  return (
    <>
      <SEOHead 
        title="CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina"
        description="24, 25 e 26 de outubro. O CERRADØ INTERBOX vai além da arena. Aqui você não se inscreve. Você assume seu chamado."
        image="/images/og-interbox.png"
        type="website"
        keywords="CERRADØ INTERBOX, competição de times, crossfit competition, fitness event, Brasil, América Latina, 2025"
        tags={["crossfit", "competição", "times", "fitness", "evento", "Brasil"]}
        canonical="https://cerradointerbox.com.br"
      />
      {showSplash && (
        <VideoSplashScreen onComplete={handleSplashComplete} />
      )}
      <ParallaxWrapper>
        {/* Topo visual */}
        <LinhaDelicada />
        <Header />
        <Hero />
        <LinhaDelicada />
        <Sobre />
        <LinhaDelicada />
        <TempoReal />
        <LinhaDelicada />
        <Beneficios />
        <LinhaDelicada />
        <CallToAction />
        <Footer />
      </ParallaxWrapper>

      {/* Modal de Inscrição */}
      <InscricaoModal 
        isOpen={showInscricao} 
        onClose={() => setShowInscricao(false)} 
      />

      {/* Install Toast - Apenas um componente de instalação */}
      {platform === 'ios' && !isStandalone && <InstallToast platform="ios" />}
      {platform === 'android' && !isStandalone && <InstallToast platform="android" />}
    </>
  );
} 