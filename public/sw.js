const CACHE_NAME = 'cerrado-app-v5';
const STATIC_CACHE = 'cerrado-static-v5';

// URLs críticas para cache imediato
const CRITICAL_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/styles/globals.css'
];

// Assets estáticos para cache
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

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache de assets críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Cache estático aberto');
        return cache.addAll(CRITICAL_URLS);
      }),
      // Cache de assets estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Cache principal aberto');
        return cache.addAll(STATIC_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker instalado com sucesso');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Erro na instalação do SW:', error);
    })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
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

// Interceptação de requisições simplificada
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
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
  
  // Para assets estáticos, usar cache first
  if (event.request.destination === 'image' || 
      event.request.destination === 'style' ||
      event.request.destination === 'script' ||
      event.request.destination === 'font') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
    return;
  }
  
  // Para páginas, usar network first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Não fazer cache de respostas de erro
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Clonar resposta para cache
        const responseToCache = response.clone();
        caches.open(STATIC_CACHE)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Fallback para offline
        return caches.match('/offline.html');
      })
  );
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