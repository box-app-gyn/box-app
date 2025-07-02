export const PWA_CONFIG = {
  name: 'CERRADØ INTERBOX 2025',
  shortName: 'CERRADØ',
  description: 'O Maior Evento de Times da América Latina - 24, 25 e 26 de outubro',
  themeColor: '#000000',
  backgroundColor: '#000000',
  display: 'standalone' as const,
  orientation: 'portrait-primary' as const,
  scope: '/',
  startUrl: '/',
  lang: 'pt-BR',
  dir: 'ltr',
  
  // Configurações de cache
  cacheName: 'cerrado-app-v1',
  cacheUrls: [
    '/',
    '/manifest.json',
    '/logos/logo_circulo.png',
    '/df.ico',
    '/styles/globals.css'
  ],
  
  // Configurações de instalação
  installPromptDelay: 2000, // 2 segundos
  splashDelay: 3000, // 3 segundos
  installInstructionsDelay: 5000, // 5 segundos
  
  // Configurações de detecção
  userAgents: {
    iOS: /iPad|iPhone|iPod/,
    Safari: /Safari/,
    Chrome: /Chrome/
  },
  
  // Configurações de ícones
  icons: {
    sizes: [72, 96, 128, 144, 152, 192, 384, 512],
    src: '/logos/logo_circulo.png',
    type: 'image/png',
    purpose: 'any maskable'
  },
  
  // Configurações de splash screens
  splashScreens: [
    {
      device: 'iPhone 14 Pro Max',
      media: 'screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      src: '/images/splash/iPhone_14_Pro_Max_landscape.png'
    },
    {
      device: 'iPhone 14 Pro',
      media: 'screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      src: '/images/splash/iPhone_14_Pro_landscape.png'
    },
    {
      device: 'iPhone 14 Plus / 13 Pro Max / 12 Pro Max',
      media: 'screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)',
      src: '/images/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png'
    },
    {
      device: 'iPhone 14 / 13 Pro / 13 / 12 Pro / 12',
      media: 'screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      src: '/images/splash/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png'
    },
    {
      device: 'iPhone XS / X / 8 Plus / 7 Plus / 6s Plus / 6 Plus',
      media: 'screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      src: '/images/splash/iPhone_XS__iPhone_X__iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png'
    },
    {
      device: 'iPhone XR / 11',
      media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
      src: '/images/splash/iPhone_XR__iPhone_11_landscape.png'
    },
    {
      device: 'iPhone XS Max / 11 Pro Max',
      media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
      src: '/images/splash/iPhone_XS_Max__iPhone_11_Pro_Max_landscape.png'
    },
    {
      device: 'iPhone 8 / 7 / 6s / 6 / SE',
      media: 'screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      src: '/images/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png'
    },
    {
      device: 'iPhone SE / iPod touch',
      media: 'screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      src: '/images/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png'
    }
  ],
  
  // Configurações de shortcuts
  shortcuts: [
    {
      name: 'Inscrições',
      shortName: 'Inscrições',
      description: 'Acessar inscrições do evento',
      url: '/audiovisual',
      icons: [{ src: '/logos/logo_circulo.png', sizes: '96x96' }]
    },
    {
      name: 'Times',
      shortName: 'Times',
      description: 'Ver times formados',
      url: '/times',
      icons: [{ src: '/logos/logo_circulo.png', sizes: '96x96' }]
    }
  ]
};

// Funções utilitárias
export const detectDevice = () => {
  if (typeof window === 'undefined') return { isIOS: false, isSafari: false, isStandalone: false };
  
  const userAgent = navigator.userAgent;
  const isIOS = PWA_CONFIG.userAgents.iOS.test(userAgent);
  const isSafari = PWA_CONFIG.userAgents.Safari.test(userAgent) && !PWA_CONFIG.userAgents.Chrome.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as { standalone?: boolean }).standalone === true;
  
  return { isIOS, isSafari, isStandalone };
};

export const shouldShowPWAFeatures = () => {
  const { isIOS, isSafari, isStandalone } = detectDevice();
  return isIOS && isSafari && !isStandalone;
};

export const getPWAStatus = () => {
  const { isIOS, isSafari, isStandalone } = detectDevice();
  const isInstalled = localStorage.getItem('pwa-installed') === 'true';
  
  return {
    isIOS,
    isSafari,
    isStandalone,
    isInstalled: isInstalled || isStandalone,
    canInstall: isIOS && isSafari && !isStandalone,
    showSplash: isIOS && isSafari && !isStandalone && !isInstalled
  };
}; 