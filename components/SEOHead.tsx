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
      <link rel="preload" href="/logos/oficial_logo.png" as="image" />
      <link rel="preload" href="/images/og-interbox.png" as="image" />
    </Head>
  );
} 