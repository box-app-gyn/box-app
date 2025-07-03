const CACHE_NAME = 'cerrado-app-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logos/logo_circulo.png',
  '/logos/nome_hrz.png',
  '/logos/oficial_logo.png',
  '/df.ico',
  '/favicon.ico',
  '/styles/globals.css',
  '/videos/intro.mp4',
  '/images/bg_main.png',
  '/images/corner.png',
  '/images/liner.png',
  '/images/twolines.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégias de Cache
const cacheStrategies = {
  // Cache First: para assets estáticos
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Fallback para imagens
      if (request.destination === 'image') {
        return cache.match('/images/offline-placeholder.png');
      }
      throw error;
    }
  },

  // Network First: para APIs e conteúdo dinâmico
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      }
      throw new Error('Network response was not ok');
    } catch (error) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      
      // Fallback para páginas
      if (request.destination === 'document') {
        return cache.match('/offline.html');
      }
      throw error;
    }
  },

  // Stale While Revalidate: para conteúdo que pode ser atualizado em background
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const networkPromise = fetch(request).then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    });

    return cached || networkPromise;
  }
};

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Escolher estratégia baseada no tipo de requisição
  let strategy;
  
  if (event.request.destination === 'image' || 
      event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'font') {
    strategy = cacheStrategies.cacheFirst;
  } else if (url.pathname.startsWith('/api/')) {
    strategy = cacheStrategies.networkFirst;
  } else {
    strategy = cacheStrategies.staleWhileRevalidate;
  }

  event.respondWith(strategy(event.request));
});

// Mensagens do app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 