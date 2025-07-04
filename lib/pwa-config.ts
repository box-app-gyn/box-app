export const PWA_UTILS = {
  // Detectar plataforma
  detectPlatform(): 'ios' | 'android' | 'desktop' | null {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    if (/android/.test(userAgent)) {
      return 'android';
    }
    if (/windows|mac|linux/.test(userAgent)) {
      return 'desktop';
    }
    return null;
  },

  // Verificar se está em modo standalone (instalado)
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Verificar se pode instalar
  canInstall(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Verificar se já está instalado
  isInstalled(): boolean {
    return this.isStandalone() || 
           localStorage.getItem('pwa_installed') === 'true';
  },

  // Marcar como instalado
  markAsInstalled(): void {
    localStorage.setItem('pwa_installed', 'true');
  }
};
