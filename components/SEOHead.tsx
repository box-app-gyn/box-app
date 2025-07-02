import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

export default function SEOHead({
  title = 'CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina',
  description = '24, 25 e 26 de outubro. O CERRADØ INTERBOX vai além da arena. Aqui você não se inscreve. Você assume seu chamado.',
  image = '/images/og-interbox.png',
  url = 'https://cerradointerbox.com.br',
  type = 'website',
  keywords = 'CERRADØ, INTERBOX, 2025, fitness, competição, times, crossfit, evento, Goiânia, Goiás, Centro-Oeste, Brasil, América Latina, competição de times, crossfit competition, Praça Cívica',
  author = 'CERRADØ INTERBOX',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noIndex = false,
  canonical
}: SEOHeadProps) {
  const fullUrl = canonical || `${url}${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  const fullImageUrl = `${url}${image}`;
  const allKeywords = tags.length > 0 ? `${keywords}, ${tags.join(', ')}` : keywords;

  return (
    <Head>
      {/* Meta tags básicas */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Favicon */}
      <link rel="icon" href="/df.ico" />
      <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/logos/logo_circulo.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/logos/logo_circulo.png" />
      
      {/* PWA Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* iOS PWA Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="CERRADØ" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="CERRADØ INTERBOX" />
      
      {/* iOS Icons */}
      <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/logos/logo_circulo.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/logos/logo_circulo.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/logos/logo_circulo.png" />
      
      {/* iOS Splash Screens */}
      <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/images/splash/iPhone_14_Pro_Max_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/images/splash/iPhone_14_Pro_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/images/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/images/splash/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/images/splash/iPhone_XS__iPhone_X__iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/iPhone_XR__iPhone_11_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/images/splash/iPhone_XS_Max__iPhone_11_Pro_Max_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/12.9__iPad_Pro_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/11__iPad_Pro__10.5__iPad_Pro_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/10.9__iPad_Air_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/10.5__iPad_Air_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/10.2__iPad_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png" />
      <link rel="apple-touch-startup-image" media="screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)" href="/images/splash/8.3__iPad_mini_landscape.png" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina" />
      <meta property="og:site_name" content="CERRADØ INTERBOX" />
      <meta property="og:locale" content="pt_BR" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:image:alt" content="CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina" />
      
      {/* Meta tags adicionais */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="application-name" content="CERRADØ INTERBOX" />
      
      {/* Geolocalização */}
      <meta name="geo.region" content="BR-GO" />
      <meta name="geo.placename" content="Goiânia" />
      <meta name="geo.position" content="-16.6864;-49.2653" />
      <meta name="ICBM" content="-16.6864, -49.2653" />
      <meta name="DC.title" content="CERRADØ INTERBOX 2025 - Goiânia" />
      <meta name="geo.region" content="BR-GO" />
      <meta name="geo.placename" content="Goiânia, Goiás" />
      <meta name="geo.position" content="-16.6864;-49.2653" />
      <meta name="ICBM" content="-16.6864, -49.2653" />
      
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "CERRADØ INTERBOX 2025",
            "description": description,
            "startDate": "2025-10-24T00:00:00-03:00",
            "endDate": "2025-10-26T23:59:59-03:00",
            "location": {
              "@type": "Place",
              "name": "Praça Cívica",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Praça Cívica",
                "addressLocality": "Goiânia",
                "addressRegion": "GO",
                "postalCode": "74000-000",
                "addressCountry": "BR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -16.6864,
                "longitude": -49.2653
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "CERRADØ INTERBOX",
              "url": "https://cerradointerbox.com.br",
              "logo": "https://cerradointerbox.com.br/logos/oficial_logo.png"
            },
            "image": fullImageUrl,
            "url": "https://cerradointerbox.com.br",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "offers": {
              "@type": "Offer",
              "availability": "https://schema.org/InStock",
              "price": "0",
              "priceCurrency": "BRL",
              "validFrom": "2024-01-01T00:00:00-03:00"
            },
            "performer": {
              "@type": "Organization",
              "name": "CERRADØ INTERBOX"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": "Atletas de CrossFit e Fitness",
              "geographicArea": {
                "@type": "Place",
                "name": "Centro-Oeste do Brasil",
                "description": "Raio de 200km a partir de Goiânia - Goiás, DF, MG, TO, BA"
              }
            }
          })
        }}
      />
      
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CERRADØ INTERBOX",
            "url": "https://cerradointerbox.com.br",
            "logo": "https://cerradointerbox.com.br/logos/oficial_logo.png",
            "description": "O Maior Evento de Times da América Latina",
            "sameAs": [
              "https://www.instagram.com/cerradointerbox",
              "https://www.facebook.com/cerradointerbox"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": "Portuguese"
            }
          })
        }}
      />
      
      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://firestore.googleapis.com" />
      <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      
      {/* DNS prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//firestore.googleapis.com" />
      <link rel="dns-prefetch" href="//identitytoolkit.googleapis.com" />
      
      {/* Preload critical resources */}
      {/* Removido preload da imagem OG para evitar avisos de recurso não utilizado */}
    </Head>
  );
} 