import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Tipos para Google Analytics
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

// Função para sanitizar measurementId
const sanitizeMeasurementId = (id: string): string => {
  // Permitir apenas caracteres válidos para GA ID (G-XXXXXXXXXX)
  // return id.replace(/[^G-0-9]/g, '').slice(0, 15);
  return id.slice(0, 15);
};

// Função para inicializar o Google Analytics
export const initGA = (measurementId: string) => {
  if (typeof window !== 'undefined') {
    // Configurar dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Função gtag
    window.gtag = function(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    
    // Configuração inicial
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      cookie_domain: 'cerradointerbox.com.br'
    });
  }
};

// Função para rastrear eventos
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Função para rastrear pageviews
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const router = useRouter();
  const sanitizedId = sanitizeMeasurementId(measurementId);

  useEffect(() => {
    // Inicializar GA apenas em produção
    if (process.env.NODE_ENV === 'production') {
      // Suprimir warnings do Firebase Analytics
      const originalConsoleWarn = console.warn;
      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('Failed to fetch this Firebase app')) {
          return; // Ignorar este warning específico
        }
        originalConsoleWarn.apply(console, args);
      };
      
      initGA(sanitizedId);
      
      // Restaurar console.warn após inicialização
      setTimeout(() => {
        console.warn = originalConsoleWarn;
      }, 1000);
    }
  }, [sanitizedId]);

  useEffect(() => {
    // Rastrear mudanças de rota
    const handleRouteChange = (url: string) => {
      if (process.env.NODE_ENV === 'production') {
        trackPageView(url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Script do Google Analytics
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${sanitizedId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${sanitizedId}', {
              page_title: document.title,
              page_location: window.location.href,
              cookie_domain: 'cerradointerbox.com.br',
              custom_map: {
                'custom_parameter_1': 'event_category',
                'custom_parameter_2': 'event_label'
              }
            });
          `,
        }}
      />
    </>
  );
} 