import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
          
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Cerrado Interbox" />
          
          <meta name="theme-color" content="#1a1a1a" />
          <meta name="msapplication-TileColor" content="#1a1a1a" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/logos/logo_circulo.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/logos/logo_circulo.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/logos/logo_circulo.png" />
          
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
          
          <meta name="application-name" content="Cerrado Interbox" />
          <meta name="msapplication-TileImage" content="/logos/logo_circulo.png" />
          
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https:; connect-src 'self' https://www.google-analytics.com https://maps.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com wss://s-usc1c-nss-2077.firebaseio.com; frame-src 'self' https://www.google.com https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;" />
          
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
          <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=()" />
          
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          
          <link rel="mask-icon" href="/logos/logo_circulo.png" color="#1a1a1a" />
          
          <meta name="msapplication-TileImage" content="/logos/logo_circulo.png" />
          <meta name="msapplication-TileColor" content="#1a1a1a" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@cerradointerbox" />
          <meta name="twitter:title" content="Cerrado Interbox 2025" />
          <meta name="twitter:description" content="O Maior Evento de Times da América Latina - 24, 25 e 26 de outubro" />
          <meta name="twitter:image" content="/images/og-interbox.png" />
          
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Cerrado Interbox 2025" />
          <meta property="og:description" content="O Maior Evento de Times da América Latina - 24, 25 e 26 de outubro" />
          <meta property="og:image" content="/images/og-interbox.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:url" content="https://cerrado-interbox.web.app" />
          <meta property="og:site_name" content="Cerrado Interbox" />
          <meta property="og:locale" content="pt_BR" />
          
          <link rel="canonical" href="https://cerrado-interbox.web.app" />
          
          <noscript>
            <meta httpEquiv="refresh" content="0;url=/noscript" />
          </noscript>
        </Head>
        <body>
          <Main />
          <NextScript />
          <noscript>
            <div style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#1a1a1a', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center',
              padding: '20px',
              zIndex: 9999
            }}>
              <div>
                <h1>JavaScript Necessário</h1>
                <p>Este aplicativo requer JavaScript para funcionar corretamente.</p>
                <p>Por favor, habilite o JavaScript no seu navegador e recarregue a página.</p>
              </div>
            </div>
          </noscript>
        </body>
      </Html>
    );
  }
}

export default MyDocument; 