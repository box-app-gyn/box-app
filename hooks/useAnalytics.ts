import { useCallback } from 'react';

// Tipos para eventos específicos do CERRADØ
export interface CerradoEvent {
  action: 'click' | 'submit' | 'view' | 'scroll' | 'download' | 'share';
  category: 'engagement' | 'conversion' | 'navigation' | 'social' | 'audiovisual' | 'times' | 'admin';
  label?: string;
  value?: number;
}

// Função para rastrear eventos com gtag
const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Função para rastrear pageviews
const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (measurementId) {
      window.gtag('config', measurementId, {
        page_path: url,
        page_title: document.title,
      });
    }
  }
};

// Hook principal para analytics
export const useAnalytics = () => {
  // Rastrear eventos gerais
  const track = useCallback((event: CerradoEvent) => {
    trackEvent(event.action, event.category, event.label, event.value);
  }, []);

  // Rastrear cliques em CTAs
  const trackCTA = useCallback((ctaName: string, page?: string) => {
    track({
      action: 'click',
      category: 'conversion',
      label: `${ctaName}${page ? `_${page}` : ''}`,
      value: 1
    });
  }, []);

  // Rastrear visualizações de página
  const trackPage = useCallback((pageName: string) => {
    trackPageView(`/${pageName}`);
    track({
      action: 'view',
      category: 'navigation',
      label: pageName
    });
  }, []);

  // Rastrear envios de formulário
  const trackFormSubmit = useCallback((formName: string) => {
    track({
      action: 'submit',
      category: 'conversion',
      label: formName,
      value: 1
    });
  }, []);

  // Rastrear scroll
  const trackScroll = useCallback((section: string, depth: number) => {
    track({
      action: 'scroll',
      category: 'engagement',
      label: section,
      value: depth
    });
  }, []);

  // Rastrear downloads
  const trackDownload = useCallback((fileName: string) => {
    track({
      action: 'download',
      category: 'engagement',
      label: fileName
    });
  }, []);

  // Rastrear compartilhamentos
  const trackShare = useCallback((platform: string, content: string) => {
    track({
      action: 'share',
      category: 'social',
      label: `${platform}_${content}`
    });
  }, []);

  // Rastrear conversões específicas
  const trackCerradoConversion = useCallback((conversionType: string) => {
    track({
      action: 'submit',
      category: 'conversion',
      label: conversionType,
      value: 1
    });
  }, []);

  // Rastrear eventos específicos do audiovisual
  const trackAudiovisual = useCallback((action: string, details?: string) => {
    track({
      action: action as any,
      category: 'audiovisual',
      label: details
    });
  }, []);

  // Rastrear eventos específicos de times
  const trackTimes = useCallback((action: string, teamName?: string) => {
    track({
      action: action as any,
      category: 'times',
      label: teamName
    });
  }, []);

  // Rastrear eventos do admin
  const trackAdmin = useCallback((action: string, adminUser?: string) => {
    track({
      action: action as any,
      category: 'admin',
      label: adminUser
    });
  }, []);

  return {
    track,
    trackCTA,
    trackPage,
    trackFormSubmit,
    trackScroll,
    trackDownload,
    trackShare,
    trackCerradoConversion,
    trackAudiovisual,
    trackTimes,
    trackAdmin
  };
}; 