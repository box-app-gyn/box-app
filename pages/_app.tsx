import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import GoogleAnalytics from '../components/GoogleAnalytics';
import ChatButton from '../components/ChatButton';
import SplashScreen from '../components/SplashScreen';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import UpdateNotification from '../components/UpdateNotification';

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Registrar Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registrado:', registration);
          })
          .catch((error) => {
            console.log('SW falhou:', error);
          });
      });
    }
    
    // Detectar se deve mostrar splash (apenas iOS + Safari mobile)
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as { standalone?: boolean }).standalone === true;
      const isInstalled = localStorage.getItem('pwa-installed') === 'true';
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const safari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Mostrar splash apenas para iOS mobile + Safari que não estão em modo standalone
      if (iOS && safari && isMobile && !standalone && !isInstalled) {
        setShowSplash(true);
      }
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    localStorage.setItem('pwa-installed', 'true');
    
    // Mostrar prompt de instalação após 3 segundos (apenas iOS mobile + Safari)
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const safari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as { standalone?: boolean }).standalone === true;
        
        if (iOS && safari && isMobile && !standalone) {
          setTimeout(() => {
            setShowInstallPrompt(true);
          }, 5000);
        }
      }
    }, 3000);
  };

  const handleCloseInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  const handleUpdate = () => {
    // Atualização será feita pelo componente
  };

  if (!isClient) {
    return null; // Evita hidratação
  }

  return (
    <>
      {/* Google Analytics - apenas em produção */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
      
      {/* Splash Screen */}
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : null}
      
      <div className="bg-animated-gradient" />
      <Component {...pageProps} />
      
      {/* Chat Button */}
      <ChatButton />
      
      {/* PWA Install Prompt */}
      {showInstallPrompt ? (
        <PWAInstallPrompt onClose={handleCloseInstallPrompt} />
      ) : null}
      
      {/* Update Notification */}
      <UpdateNotification onUpdate={handleUpdate} />
    </>
  );
} 