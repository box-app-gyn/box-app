import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* React DevTools - apenas em desenvolvimento - DEVE SER O PRIMEIRO */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <Script src="http://localhost:8097" />
            <Script src="http://192.168.1.130:8097" />
          </>
        )}

        {/* Meta tags PWA essenciais */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000332" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logos/logo_circulo.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/logos/logo_circulo.png" />
      </Head>
      <body className="bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 