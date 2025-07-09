import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import ChatButton from '../components/ChatButton';
import SplashScreen from '../components/SplashScreen';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  
  // Refs para evitar memory leaks
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const installPromptTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Função para detectar plataforma de forma segura
  const detectPlatform = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userAgent = navigator.userAgent.toLowerCase();
      const iOS = /ipad|iphone|ipod/.test(userAgent);
      const safari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isMobile = /iphone|ipad|ipod|android|blackberry|iemobile|opera mini/i.test(userAgent);
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as { standalone?: boolean }).standalone === true;
      
      return { iOS, safari, isMobile, standalone };
    } catch (error) {
      console.error('Erro ao detectar plataforma:', error);
      return null;
    }
  }, []);

  // Função para registrar Service Worker de forma segura
  const registerServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Evitar registro duplo usando ref
    if (swRegistrationRef.current) {
      console.log('Service Worker já registrado anteriormente');
      return;
    }

    try {
      // Verificar se já existe um SW registrado
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration && existingRegistration.active) {
        swRegistrationRef.current = existingRegistration;
        console.log('Service Worker já registrado:', existingRegistration);
        return;
      }

      // Registrar novo SW apenas se não existir
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      swRegistrationRef.current = registration;
      console.log('Service Worker registrado com sucesso:', registration);

      // Listener para atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versão do SW disponível');
            }
          });
        }
      });

      // Listener para erros
      registration.addEventListener('error', (error) => {
        console.error('Erro no Service Worker:', error);
      });

    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }, []);

  // Função para verificar se deve mostrar splash (desabilitada - gerenciado pelo index.tsx)
  const shouldShowSplash = useCallback(() => {
    return false; // Desabilitado - o intro é gerenciado pelo index.tsx
  }, []);

  // Função para mostrar prompt de instalação
  const triggerInstallPrompt = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const platform = detectPlatform();
      if (!platform) return;

      const { iOS, safari, isMobile, standalone } = platform;
      
      if (iOS && safari && isMobile && !standalone) {
        // Limpar timeout anterior se existir
        if (installPromptTimeoutRef.current) {
          clearTimeout(installPromptTimeoutRef.current);
        }
        
        installPromptTimeoutRef.current = setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000);
      }
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
    }
  }, [detectPlatform]);

  // Inicialização principal
  useEffect(() => {
    setIsClient(true);
    
    // Proteção contra ataques de clickjacking
    if (typeof window !== 'undefined') {
      try {
        // Verificar se está em um iframe
        if (window.self !== window.top && window.top) {
          // Tentativa de clickjacking detectada
          window.top.location.href = window.self.location.href;
        }
      } catch (error) {
        console.error('Erro na verificação de clickjacking:', error);
      }
    }
    
    // Registrar Service Worker
    registerServiceWorker();
    
    // Verificar splash screen
    if (shouldShowSplash()) {
      setShowSplash(true);
    }
  }, [registerServiceWorker, shouldShowSplash]);

  // Listener para redimensionamento otimizado
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      // Debounce para evitar muitas execuções
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        // Verificação silenciosa do tamanho da tela
        if (typeof window !== 'undefined') {
          const isDesktop = window.innerWidth > 768;
          const isMobilePage = router.pathname === '/acesso-mobile-obrigatorio';
          
          // Redirecionar desktop para página mobile obrigatório
          if (isDesktop && !isMobilePage && router.pathname !== '/admin') {
            router.replace('/acesso-mobile-obrigatorio');
          }
        }
      }, 250); // 250ms debounce
    };

    // Verificar tamanho da tela inicialmente
    handleResize();

    // Adicionar listener
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [isClient, router, router.pathname]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      if (installPromptTimeoutRef.current) {
        clearTimeout(installPromptTimeoutRef.current);
      }
    };
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    
    try {
      localStorage.setItem('pwa-installed', 'true');
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
    
    // Mostrar prompt de instalação
    triggerInstallPrompt();
  }, [triggerInstallPrompt]);

  const handleCloseInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
  }, []);

  // Função de atualização comentada - será usada quando UpdateNotification for reativado
  // const handleUpdate = useCallback(() => {
  //   if (swRegistrationRef.current) {
  //     swRegistrationRef.current.update();
  //   }
  // }, []);

  if (!isClient) {
    return null; // Evita hidratação
  }

  return (
    <>
      <Head>
        {/* Headers de Segurança */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CERRADØ" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/logos/logo_circulo.png" />
        
        {/* Apple Touch Startup Images */}
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
        
        {/* Configurações de privacidade */}
        <meta name="robots" content="index, follow" />
        
        {/* Configurações de viewport seguras */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* Configurações de tema */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark light" />
      </Head>


      
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      <div className="bg-animated-gradient" />
      <Component {...pageProps} />
      
      {/* Chat Button */}
      <ChatButton />
      
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <PWAInstallPrompt onClose={handleCloseInstallPrompt} />
      )}
      
      {/* Update Notification - Desabilitado temporariamente */}
      {/* <UpdateNotification onUpdate={handleUpdate} /> */}
    </>
  );
} 