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
import InstallBanner from "@/components/InstallBanner";
import { usePWA } from "@/hooks/usePWA";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';

function LinhaDelicada() {
  return (
    <div className="flex justify-center">
              <Image src="/images/liner.png" alt="" className="h-0.5 w-full max-w-[400px] object-cover select-none pointer-events-none" draggable="false" width={400} height={1} style={{ width: 'auto', height: 'auto' }} />
    </div>
  );
}

// Componente de Modal de Inscrição
function InscricaoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    categoria: 'atleta',
    mensagem: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inscrição realizada:', formData);
    // Aqui você pode adicionar a lógica para salvar a inscrição
    onClose();
  };

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
            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decoração de canto */}
            <Image 
              src="/images/corner.png" 
              alt="" 
              className="absolute top-0 left-0 w-24 h-auto z-10" 
              width={96} 
              height={96} 
              style={{ height: 'auto' }} 
            />
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                🏆 Inscreva-se no CERRADØ INTERBOX 2025
              </h2>
              <p className="text-neutral-300">
                24, 25 e 26 de outubro - O maior evento de times da América Latina
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-neutral-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-neutral-300 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-neutral-300 mb-2">
                  Categoria *
                </label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                >
                  <option value="atleta">Atleta</option>
                  <option value="coach">Coach</option>
                  <option value="espectador">Espectador</option>
                  <option value="midia">Mídia</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensagem" className="block text-sm font-medium text-neutral-300 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  placeholder="Conte-nos mais sobre você..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Inscrever-se
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-neutral-600 text-neutral-300 hover:bg-neutral-800 rounded-lg transition-colors duration-200"
                >
                  Depois
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showInscricao, setShowInscricao] = useState(false);
  const { platform, isStandalone, markAsInstalled } = usePWA();

  const handleSplashComplete = () => {
    setShowSplash(false);
    markAsInstalled();
    // Mostrar modal de inscrição após 1 segundo
    setTimeout(() => {
      setShowInscricao(true);
    }, 1000);
  };

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

      {/* Install Toasts */}
      {platform === 'ios' && !isStandalone && <InstallToast platform="ios" />}
      {platform === 'android' && !isStandalone && <InstallToast platform="android" />}
      
      {/* Install Banner */}
      <InstallBanner />
    </>
  );
} 