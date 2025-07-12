import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
        
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cerrado Interbox 2025" />
        <meta property="og:description" content="O Maior Evento de Times da América Latina - 24, 25 e 26 de outubro" />
        <meta property="og:image" content="/images/og-interbox.png" />
        <meta property="og:url" content="https://cerrado-interbox.web.app" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cerrado Interbox 2025" />
        <meta name="twitter:description" content="O Maior Evento de Times da América Latina - 24, 25 e 26 de outubro" />
        <meta name="twitter:image" content="/images/og-interbox.png" />
        
        <link rel="canonical" href="https://cerrado-interbox.web.app" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </div>
    </>
  );
} 