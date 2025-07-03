'use client';

import { useState, useEffect } from 'react';
import { PWA_UTILS } from '@/lib/pwa-config';

interface PWAState {
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | null;
  canInstall: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
}

interface PWAHookReturn {
  isStandalone: boolean;
  platform: 'ios' | 'android' | 'desktop' | null;
  canInstall: boolean;
  isInstalled: boolean;
  showInstallPrompt: boolean;
  markAsInstalled: () => void;
  triggerInstallPrompt: () => void;
  hideInstallPrompt: () => void;
}

export function usePWA(): PWAHookReturn {
  const [state, setState] = useState<PWAState>({
    isStandalone: false,
    platform: null,
    canInstall: false,
    isInstalled: false,
    showInstallPrompt: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateState = () => {
      const platform = PWA_UTILS.detectPlatform();
      const isStandalone = PWA_UTILS.isStandalone();
      const canInstall = PWA_UTILS.canInstall();
      const isInstalled = PWA_UTILS.isInstalled();

      setState({
        isStandalone,
        platform,
        canInstall,
        isInstalled,
        showInstallPrompt: false,
      });
    };

    // Verificação inicial
    updateState();

    // Listener para mudanças no modo de exibição
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      updateState();
    };

    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Listener para mudanças no storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pwa-installed') {
        updateState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const markAsInstalled = () => {
    PWA_UTILS.markAsInstalled();
    setState(prev => ({ ...prev, isInstalled: true }));
  };

  const triggerInstallPrompt = () => {
    setState(prev => ({ ...prev, showInstallPrompt: true }));
  };

  const hideInstallPrompt = () => {
    setState(prev => ({ ...prev, showInstallPrompt: false }));
  };

  return {
    ...state,
    markAsInstalled,
    triggerInstallPrompt,
    hideInstallPrompt,
  };
} 