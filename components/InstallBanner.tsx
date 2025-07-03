'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePWA } from '@/hooks/usePWA';

export default function InstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { platform, isStandalone, canInstall } = usePWA();

  useEffect(() => {
    // Mostrar banner apenas para Android/Chrome que podem instalar
    if (platform === 'android' && canInstall && !isStandalone) {
      // Verificar se já foi mostrado recentemente
      const lastShown = localStorage.getItem('install-banner-last-shown');
      const now = Date.now();
      const threeHours = 3 * 60 * 60 * 1000; // 3 horas

      if (!lastShown || now - parseInt(lastShown) > threeHours) {
        const timer = setTimeout(() => {
          setIsVisible(true);
          localStorage.setItem('install-banner-last-shown', now.toString());
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [platform, canInstall, isStandalone]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleInstall = () => {
    // Trigger instalação PWA
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Mostrar instruções ou trigger instalação
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
        style={{ zIndex: 10002 }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Image src="/logos/logo_circulo.png" 
              alt="CERRADØ" 
              width={32}
              height={32}
              className="w-8 h-8"
             priority/>
            <div>
              <p className="text-sm font-medium">Instalar CERRADØ</p>
              <p className="text-xs opacity-90">Acesso rápido à tela inicial</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-white text-green-600 text-xs font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 