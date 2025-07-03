import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import GoogleAnalytics from '../components/GoogleAnalytics';
import ChatButton from '../components/ChatButton';
import SplashScreen from '../components/SplashScreen';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import UpdateNotification from '../components/UpdateNotification';
import { SECURITY_CONSTANTS } from '../constants/security';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Proteção contra ataques de clickjacking
    if (typeof window !== 'undefined') {
      // Verificar se está em um iframe
      if (window.self !== window.top && window.top) {
        // Tentativa de clickjacking detectada
        window.top.location.href = window.self.location.href;
      }
    }
    
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

  // useEffect separado para redirecionamento baseado na largura da tela
  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth > 768;
        const isMobilePage = router.pathname === '/acesso-mobile-obrigatorio';
        
        // Se for desktop e não estiver na página de acesso mobile, redirecionar
        if (isDesktop && !isMobilePage) {
          router.push('/acesso-mobile-obrigatorio');
          return;
        }
        
        // Se for mobile e estiver na página de acesso mobile, redirecionar para home
        if (!isDesktop && isMobilePage) {
          router.push('/');
          return;
        }
      }
    };

    // Verificar tamanho da tela inicialmente
    checkScreenSize();

    // Listener para redimensionamento da janela
    const handleResize = () => {
      checkScreenSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup do listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isClient, router.pathname, router]);

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
      <Head>
        {/* Headers de Segurança */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CERRADØ" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/logos/logo_circulo.png" />
        {/* Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content={`
          default-src 'self';
          script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.gstatic.com;
          img-src 'self' data: https: blob: https://firebasestorage.googleapis.com;
          connect-src 'self' https://api.flowpay.com.br https://www.google-analytics.com https://firestore.googleapis.com;
          frame-src 'none';
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          upgrade-insecure-requests;
        `.replace(/\s+/g, ' ').trim()} />
        
        {/* Prevenção de MIME sniffing */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        
        {/* Prevenção de clickjacking */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        
        {/* Configurações de privacidade */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        {/* Configurações de viewport seguras */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Configurações de tema */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
      </Head>

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