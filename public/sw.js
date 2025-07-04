const CACHE_NAME = 'cerrado-app-v3';
const STATIC_CACHE = 'cerrado-static-v3';
const DYNAMIC_CACHE = 'cerrado-dynamic-v3';

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

// Domínios permitidos para cache
const ALLOWED_DOMAINS = [
  'firebasestorage.googleapis.com',
  'lh3.googleusercontent.com',
  'www.googletagmanager.com',
  'www.google-analytics.com'
];

// Configurações de cache
const CACHE_CONFIG = {
  STATIC_TTL: 60 * 60 * 24 * 30, // 30 dias
  DYNAMIC_TTL: 60 * 60 * 24, // 1 dia
  MAX_ENTRIES: 100,
  MAX_SIZE: 50 * 1024 * 1024 // 50MB
};

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
            if (![CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Limpar entradas expiradas do cache dinâmico
      cleanupExpiredCache(),
      // Tomar controle imediato
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker ativado');
    }).catch((error) => {
      console.error('Erro na ativação do SW:', error);
    })
  );
});

// Função para limpar cache expirado
async function cleanupExpiredCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    const now = Date.now();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = response.headers.get('sw-cache-time');
        if (cacheTime && (now - parseInt(cacheTime)) > CACHE_CONFIG.DYNAMIC_TTL * 1000) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao limpar cache expirado:', error);
  }
}

// Função para validar URL
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname.endsWith(domain)) ||
           urlObj.origin === self.location.origin;
  } catch {
    return false;
  }
}

// Função para sanitizar URL
function sanitizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remover parâmetros suspeitos
    const suspiciousParams = ['javascript:', 'data:', 'vbscript:'];
    for (const param of suspiciousParams) {
      if (urlObj.href.toLowerCase().includes(param)) {
        return null;
      }
    }
    return urlObj.href;
  } catch {
    return null;
  }
}

// Estratégias de Cache melhoradas
const cacheStrategies = {
  // Cache First: para assets estáticos
  cacheFirst: async (request) => {
    try {
      const sanitizedUrl = sanitizeUrl(request.url);
      if (!sanitizedUrl) {
        throw new Error('URL inválida');
      }

      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }

      const response = await fetch(request);
      if (response && response.ok) {
        const clonedResponse = response.clone();
        await cache.put(request, clonedResponse);
      }
      return response;
    } catch (error) {
      console.error('Erro no cache first:', error);
      // Fallback para imagens
      if (request.destination === 'image') {
        const fallbackCache = await caches.open(CACHE_NAME);
        return fallbackCache.match('/images/offline-placeholder.png');
      }
      throw error;
    }
  },

  // Network First: para APIs e conteúdo dinâmico
  networkFirst: async (request) => {
    try {
      const sanitizedUrl = sanitizeUrl(request.url);
      if (!sanitizedUrl) {
        throw new Error('URL inválida');
      }

      const response = await fetch(request);
      if (response && response.ok) {
        const clonedResponse = response.clone();
        const cache = await caches.open(DYNAMIC_CACHE);
        
        // Adicionar timestamp para controle de expiração
        const headers = new Headers(clonedResponse.headers);
        headers.set('sw-cache-time', Date.now().toString());
        
        const cachedResponse = new Response(await clonedResponse.blob(), {
          status: clonedResponse.status,
          statusText: clonedResponse.statusText,
          headers: headers
        });
        
        await cache.put(request, cachedResponse);
        return response;
      }
      throw new Error('Network response was not ok');
    } catch (error) {
      console.error('Erro no network first:', error);
      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
      
      // Fallback para páginas
      if (request.destination === 'document') {
        const fallbackCache = await caches.open(STATIC_CACHE);
        return fallbackCache.match('/offline.html');
      }
      throw error;
    }
  },

  // Stale While Revalidate: para conteúdo que pode ser atualizado em background
  staleWhileRevalidate: async (request) => {
    try {
      const sanitizedUrl = sanitizeUrl(request.url);
      if (!sanitizedUrl) {
        throw new Error('URL inválida');
      }

      const cache = await caches.open(DYNAMIC_CACHE);
      const cached = await cache.match(request);

      const networkPromise = fetch(request).then(async (response) => {
        if (response && response.ok) {
          const clonedResponse = response.clone();
          const headers = new Headers(clonedResponse.headers);
          headers.set('sw-cache-time', Date.now().toString());
          
          const cachedResponse = new Response(await clonedResponse.blob(), {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: headers
          });
          
          await cache.put(request, cachedResponse);
        }
        return response;
      }).catch((error) => {
        console.error('Erro na revalidação:', error);
        return cached;
      });

      return cached || networkPromise;
    } catch (error) {
      console.error('Erro no stale while revalidate:', error);
      throw error;
    }
  }
};

// Interceptação de requisições com validação de segurança
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Validar URL
  if (!isValidUrl(url.href)) {
    console.warn('URL bloqueada por segurança:', url.href);
    event.respondWith(new Response('URL não permitida', { status: 403 }));
    return;
  }

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

// Mensagens do app com validação
self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') {
    return;
  }

  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0]?.postMessage(info);
      });
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

// Função para obter informações do cache
async function getCacheInfo() {
  try {
    const cacheNames = await caches.keys();
    const info = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      info[cacheName] = {
        entries: requests.length,
        urls: requests.map(req => req.url)
      };
    }
    
    return info;
  } catch (error) {
    console.error('Erro ao obter informações do cache:', error);
    return { error: error.message };
  }
}

// Background sync para operações offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    // Implementar sincronização em background
    console.log('Sincronização em background iniciada');
    
    // Limpar cache expirado
    await cleanupExpiredCache();
    
    console.log('Sincronização em background concluída');
  } catch (error) {
    console.error('Erro na sincronização em background:', error);
  }
}

// Push notifications (se implementado no futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Nova notificação do CERRADØ',
        icon: '/logos/logo_circulo.png',
        badge: '/logos/logo_circulo.png',
        tag: 'cerrado-notification',
        data: data
      };

      event.waitUntil(
        self.registration.showNotification('CERRADØ INTERBOX 2025', options)
      );
    } catch (error) {
      console.error('Erro ao processar push notification:', error);
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
}); 