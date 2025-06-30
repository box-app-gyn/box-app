import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = 'CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina',
  description = '24, 25 e 26 de outubro. O CERRADØ INTERBOX vai além da arena. Aqui você não se inscreve. Você assume seu chamado.',
  image = '/images/og-interbox.png',
  url = 'https://cerradointerbox.com.br',
  type = 'website'
}: SEOHeadProps) {
  const fullUrl = `${url}${typeof window !== 'undefined' ? window.location.pathname : ''}`;
  const fullImageUrl = `${url}${image}`;

  return (
    <Head>
      {/* Meta tags básicas */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/logos/logo_circulo.png" />
      
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
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:image:alt" content="CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina" />
      
      {/* Meta tags adicionais */}
      <meta name="author" content="CERRADØ INTERBOX" />
      <meta name="keywords" content="CERRADØ, INTERBOX, 2025, fitness, competição, times, crossfit, evento, Brasil, América Latina" />
      
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
              "name": "Local a ser definido",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BR"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "CERRADØ INTERBOX",
              "url": "https://cerradointerbox.com.br"
            },
            "image": fullImageUrl,
            "url": "https://cerradointerbox.com.br",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode"
          })
        }}
      />
      
      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* DNS prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
    </Head>
  );
} 