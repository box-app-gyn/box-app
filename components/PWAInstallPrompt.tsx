'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PWAInstallPromptProps {
  onClose: () => void;
}

export default function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar se é iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se é Android
    const android = /Android/i.test(navigator.userAgent);
    setIsAndroid(android);

    // Detectar se já está em modo standalone (já instalado)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Desabilitado temporariamente para evitar popup intrusivo
    // Mostrar popup apenas se for iOS ou Android e não estiver em modo standalone
    // if ((iOS || android) && !standalone) {
    //   // Aguarda um pouco para não aparecer imediatamente
    //   const timer = setTimeout(() => {
    //     setIsVisible(true);
    //   }, 2000);

    //   return () => clearTimeout(timer);
    // }
  }, []);

  const handleInstall = () => {
    // Instruções específicas para iOS
    if (isIOS) {
      setIsVisible(false);
      // Aqui você pode adicionar lógica para mostrar instruções específicas do iOS
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        style={{ zIndex: 10000 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-4">
            <Image src="/logos/logo_circulo.png" 
              alt="CERRADØ" 
              width={64}
              height={64}
              className="w-16 h-16 mx-auto mb-3"
             priority/>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Instalar CERRADØ
            </h2>
            <p className="text-gray-600 text-sm">
              Adicione à tela inicial para uma experiência completa
            </p>
          </div>

          {/* Instruções específicas por plataforma */}
          {isIOS && (
            <div className="mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Como instalar no iOS:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Toque no ícone <span className="font-bold">Compartilhar</span> <span className="text-lg">&quot;⎋&quot;</span></li>
                  <li>2. Selecione <span className="font-bold">&quot;Adicionar à Tela Inicial&quot;</span></li>
                  <li>3. Toque em <span className="font-bold">&quot;Adicionar&quot;</span></li>
                </ol>
              </div>
            </div>
          )}

          {isAndroid && (
            <div className="mb-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Como instalar no Android:
                </h3>
                <p className="text-sm text-green-800">
                  Toque no menu do navegador <span className="font-bold text-lg">⋮</span> e selecione <span className="font-bold">&quot;Adicionar à tela inicial&quot;</span>.
                </p>
              </div>
            </div>
          )}

          {/* Benefícios */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Benefícios:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Acesso rápido direto da tela inicial
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Experiência de app nativo
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Splash screen animada
              </li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Agora não
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
            >
              {isAndroid ? 'Entendi' : 'Instalar'}
            </button>
          </div>

          {/* Botão fechar */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 