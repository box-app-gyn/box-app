export const PWA_CONFIG = {
  name: 'CERRADØ INTERBOX 2025',
  shortName: 'CERRADØ',
  description: 'O Maior Evento de Times da América Latina - 24, 25 e 26 de outubro',
  themeColor: '#000000',
  backgroundColor: '#000000',
  display: 'standalone',
  orientation: 'portrait-primary',
  scope: '/',
  startUrl: '/',
  lang: 'pt-BR',
  dir: 'ltr',
  categories: ['sports', 'fitness', 'events'],
  preferRelatedApplications: false,
  
  // Configurações de ícones
  icons: {
    sizes: [72, 96, 128, 144, 152, 192, 384, 512],
    src: '/logos/logo_circulo.png',
    purpose: {
      small: 'any',
      large: 'any maskable'
    }
  },
  
  // Configurações de splash screen
  splash: {
    src: '/logos/logo_circulo.png',
    sizes: [
      { width: 320, height: 568, ratio: 2 },
      { width: 375, height: 667, ratio: 2 },
      { width: 414, height: 736, ratio: 3 },
      { width: 375, height: 812, ratio: 3 },
      { width: 414, height: 896, ratio: 2 },
      { width: 414, height: 896, ratio: 3 },
      { width: 428, height: 926, ratio: 3 },
      { width: 390, height: 844, ratio: 3 },
      { width: 430, height: 932, ratio: 3 }
    ]
  },
  
  // Configurações de cache
  cache: {
    name: 'cerrado-app-v2',
    urls: [
      '/',
      '/manifest.json',
      '/logos/logo_circulo.png',
      '/logos/nome_hrz.png',
      '/logos/oficial_logo.png',
      '/df.ico',
      '/favicon.ico',
      '/styles/globals.css',
      '/videos/intro.mp4',
      '/images/bg_main.png',
      '/images/corner.png',
      '/images/liner.png',
      '/images/twolines.png'
    ]
  },
  
  // Configurações de instalação
  install: {
    promptDelay: 3000, // 3 segundos
    toastDelay: 5000, // 5 segundos
    bannerDelay: 5000, // 5 segundos
    reminderInterval: 24 * 60 * 60 * 1000, // 24 horas
    bannerInterval: 3 * 60 * 60 * 1000, // 3 horas
  },
  
  // Configurações de notificações
  notifications: {
    enabled: true,
    title: 'CERRADØ INTERBOX',
    body: 'Novas atualizações disponíveis!',
    icon: '/logos/logo_circulo.png',
    badge: '/logos/logo_circulo.png'
  }
};

// Configurações específicas por plataforma
export const PLATFORM_CONFIG = {
  ios: {
    metaTags: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'CERRADØ',
      'apple-mobile-web-app-orientations': 'portrait',
      'apple-touch-fullscreen': 'yes'
    },
    installInstructions: [
      'Toque no ícone Compartilhar ⎋',
      'Selecione "Adicionar à Tela Inicial"',
      'Toque em "Adicionar"'
    ]
  },
  android: {
    metaTags: {
      'mobile-web-app-capable': 'yes',
      'application-name': 'CERRADØ',
      'theme-color': '#000000'
    },
    installInstructions: [
      'Toque no menu do navegador ⋮',
      'Selecione "Adicionar à tela inicial"',
      'Confirme a instalação'
    ]
  }
};

// Funções utilitárias
export const PWA_UTILS = {
  // Detectar plataforma
  detectPlatform: (): 'ios' | 'android' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/i.test(userAgent);
    
    if (iOS) return 'ios';
    if (android) return 'android';
    return 'desktop';
  },
  
  // Verificar se está em modo standalone
  isStandalone: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as { standalone?: boolean }).standalone === true;
  },
  
  // Verificar se pode instalar
  canInstall: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return 'serviceWorker' in navigator && 
           'PushManager' in window &&
           !PWA_UTILS.isStandalone();
  },
  
  // Verificar se já foi instalado
  isInstalled: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return localStorage.getItem('pwa-installed') === 'true' || PWA_UTILS.isStandalone();
  },
  
  // Marcar como instalado
  markAsInstalled: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pwa-installed', 'true');
  },
  
  // Verificar se deve mostrar prompt
  shouldShowPrompt: (type: 'toast' | 'banner'): boolean => {
    if (typeof window === 'undefined') return false;
    
    const platform = PWA_UTILS.detectPlatform();
    const isStandalone = PWA_UTILS.isStandalone();
    const canInstall = PWA_UTILS.canInstall();
    
    if (isStandalone || !canInstall) return false;
    
    const lastShown = localStorage.getItem(`install-${type}-last-shown`);
    const now = Date.now();
    const interval = type === 'toast' ? PWA_CONFIG.install.reminderInterval : PWA_CONFIG.install.bannerInterval;
    
    return !lastShown || now - parseInt(lastShown) > interval;
  },
  
  // Marcar prompt como mostrado
  markPromptShown: (type: 'toast' | 'banner'): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`install-${type}-last-shown`, Date.now().toString());
  }
}; 