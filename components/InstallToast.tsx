'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePWA } from '@/hooks/usePWA';

interface InstallToastProps {
  platform: 'ios' | 'android';
}

export default function InstallToast({ platform }: InstallToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isStandalone } = usePWA();

  useEffect(() => {
    // Verificar se já foi mostrado recentemente
    const lastShown = localStorage.getItem(`install-toast-${platform}-last-shown`);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 horas

    if (!isStandalone && (!lastShown || now - parseInt(lastShown) > oneDay)) {
      // Aguardar um pouco antes de mostrar
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem(`install-toast-${platform}-last-shown`, now.toString());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [platform, isStandalone]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleInstall = () => {
    setIsVisible(false);
    // Aqui você pode adicionar lógica específica para cada plataforma
  };

  if (!isVisible || isStandalone) return null;

  const getInstructions = () => {
    if (platform === 'ios') {
      return {
        title: 'Instalar no iOS',
        steps: [
          'Toque no ícone Compartilhar ⎋',
          'Selecione "Adicionar à Tela Inicial"',
          'Toque em "Adicionar"'
        ],
        color: 'blue',
        icon: '📱'
      };
    } else {
      return {
        title: 'Instalar no Android',
        steps: [
          'Toque no menu do navegador ⋮',
          'Selecione "Adicionar à tela inicial"',
          'Confirme a instalação'
        ],
        color: 'green',
        icon: '🤖'
      };
    }
  };

  const instructions = getInstructions();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto`}
        style={{ zIndex: 10001 }}
      >
        <div className={`bg-white rounded-2xl shadow-2xl border-2 overflow-hidden ${
          platform === 'ios' ? 'border-blue-200' : 'border-green-200'
        }`}>
          {/* Header */}
          <div className={`text-white p-4 flex items-center justify-between ${
            platform === 'ios' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{instructions.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{instructions.title}</h3>
                <p className="text-sm opacity-90">Adicione à tela inicial</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Image 
                src="/logos/logo_circulo.png" 
                alt="CERRADØ" 
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <h4 className="font-semibold text-gray-900">CERRADØ INTERBOX</h4>
                <p className="text-xs text-gray-600">Experiência completa como app</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2 mb-4">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    platform === 'ios' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handleInstall}
              className={`w-full text-white py-2 px-4 rounded-lg font-semibold transition-colors ${
                platform === 'ios' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Entendi
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 