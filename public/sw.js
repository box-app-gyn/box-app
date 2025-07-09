const CACHE_NAME = 'cerrado-app-v8';
const STATIC_CACHE = 'cerrado-static-v8';

// URLs críticas para cache imediato
const CRITICAL_URLS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Assets estáticos para cache (apenas os que existem)
const STATIC_ASSETS = [
  '/logos/logo_circulo.png',
  '/logos/nome_hrz.png',
  '/logos/oficial_logo.png',
  '/df.ico',
  '/favicon.ico',
  '/images/bg_main.png',
  '/images/corner.png',
  '/images/liner.png',
  '/images/twolines.png',
  '/images/offline-placeholder.png'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First: para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First: para páginas
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: para dados dinâmicos
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Função para adicionar recursos ao cache com tratamento de erro
async function addToCache(cache, urls) {
  console.log('Tentando adicionar URLs ao cache:', urls);
  
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        console.log('Adicionando ao cache:', url);
        await cache.add(url);
        console.log('Sucesso ao adicionar:', url);
        return url;
      } catch (error) {
        console.error('Erro ao adicionar ao cache:', url, error);
        throw error;
      }
    })
  );
  
  const successful = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.filter(result => result.status === 'rejected').length;
  
  if (failed > 0) {
    console.warn(`${failed} recursos falharam ao serem adicionados ao cache`);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error('Falha no recurso:', urls[index], result.reason);
      }
    });
  }
  
  console.log(`${successful} recursos adicionados ao cache com sucesso`);
  return successful;
}

// Estratégia Cache First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Erro na estratégia cache-first:', error);
    throw error;
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName, fallbackUrl = '/offline.html') {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Erro na estratégia network-first:', error);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return cache.match(fallbackUrl);
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalação iniciada');
  
  event.waitUntil(
    Promise.all([
      // Cache de assets críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Cache estático aberto');
        return addToCache(cache, CRITICAL_URLS);
      }),
      // Cache de assets estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Cache principal aberto');
        return addToCache(cache, STATIC_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker instalado com sucesso');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Erro na instalação do SW:', error);
      // Mesmo com erro, continuar com a instalação
      return self.skipWaiting();
    })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativação iniciada');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        console.log('Caches encontrados:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE].includes(cacheName)) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle imediato
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker ativado');
    }).catch((error) => {
      console.error('Erro na ativação do SW:', error);
    })
  );
});

// Interceptação de requisições com estratégias de cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições para React DevTools, HMR e outras ferramentas de desenvolvimento
  if (url.port === '8097' || 
      url.hostname === 'localhost' && url.port !== '3000' ||
      url.hostname === '127.0.0.1' && url.port !== '3000' ||
      url.pathname.includes('/_next/webpack-hmr') ||
      url.pathname.includes('/_next/static/webpack') ||
      url.pathname.includes('/_next/static/development')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Permitir sempre APIs externas (Firebase, Google, etc.)
  if (url.hostname !== self.location.hostname) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Não fazer cache de vídeos ou APIs locais
  if (url.pathname.includes('/videos/') || 
      event.request.url.includes('.mp4') ||
      event.request.url.includes('.webm') ||
      event.request.url.includes('.avi') ||
      event.request.url.includes('.mov') ||
      event.request.url.includes('.m4v') ||
      url.pathname.startsWith('/api/')) {
    // Para estes casos, apenas fazer fetch sem cache
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para assets estáticos, usar Cache First
  if (event.request.destination === 'image' || 
      event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'font') {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }
  
  // Para páginas, usar Network First
  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

// Mensagens do app
self.addEventListener('message', (event) => {
  // Verificar se event.data existe e é um objeto
  if (!event.data || typeof event.data !== 'object') {
    console.warn('Mensagem recebida com estrutura inesperada:', event.data);
    return;
  }

  // Get the type, checking for both 'type' and 'eventType'
  const type = event.data.type || event.data.eventType;

  // Verificar se type está definido antes de usar no switch
  if (typeof type === 'undefined') {
    console.warn('Tipo de mensagem indefinido:', event.data);
    return;
  }

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    case 'keyChanged':
    case 'ping':
    case 'pong':
    case 'heartbeat':
      // Mensagens de sistema que não precisam de ação
      break;
    default:
      console.warn('Tipo de mensagem desconhecido:', type);
  }
});

// Função para limpar todos os caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Todos os caches foram limpos');
  } catch (error) {
    console.error('Erro ao limpar caches:', error);
  }
} 