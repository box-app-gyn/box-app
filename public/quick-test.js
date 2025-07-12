
// Script de teste rápido para PWA
console.log('🔧 Teste PWA iniciado');

// Função para limpar cache do HMR
async function clearHMRCache() {
  console.log('🧹 Limpando cache do HMR...');
  
  try {
    // Limpar cache do service worker
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // Limpar localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpar cache do navegador para arquivos de desenvolvimento
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
    }
    
    console.log('✅ Cache do HMR limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar cache do HMR:', error);
  }
}

// Função para forçar atualização do Service Worker
async function forceUpdateServiceWorker() {
  console.log('🔄 Forçando atualização do Service Worker...');
  
  if ('serviceWorker' in navigator) {
    try {
      // Desregistrar todos os Service Workers existentes
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('Service Worker desregistrado');
      }
      
      // Limpar caches
      await clearCaches();
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Registrar novo SW
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('✅ Service Worker atualizado:', registration);
      
      // Aguardar instalação
      if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          console.log('SW state:', e.target.state);
        });
      }
      
      return registration;
    } catch (error) {
      console.error('❌ Erro ao atualizar Service Worker:', error);
      return null;
    }
  } else {
    console.log('❌ Service Worker não suportado');
    return null;
  }
}

// Função para testar Service Worker
async function testServiceWorker() {
  console.log('📱 Testando Service Worker...');
  
  if ('serviceWorker' in navigator) {
    try {
      // Limpar registros existentes
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
        console.log('Service Worker desregistrado');
      }
      
      // Registrar novo SW
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('✅ Service Worker registrado:', registration);
      
      // Aguardar instalação
      if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          console.log('SW state:', e.target.state);
        });
      }
      
      return registration;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      return null;
    }
  } else {
    console.log('❌ Service Worker não suportado');
    return null;
  }
}

// Função para limpar caches
async function clearCaches() {
  console.log('🧹 Limpando caches...');
  
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Caches limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar caches:', error);
    }
  }
}

// Função para testar PWA
async function testPWA() {
  console.log('🚀 Testando PWA...');
  
  // Limpar cache do HMR primeiro
  await clearHMRCache();
  
  // Forçar atualização do Service Worker
  await forceUpdateServiceWorker();
  
  // Testar manifest
  try {
    const response = await fetch('/manifest.json');
    if (response.ok) {
      const manifest = await response.json();
      console.log('✅ Manifest carregado:', manifest.name);
    } else {
      console.log('❌ Manifest não encontrado');
    }
  } catch (error) {
    console.error('❌ Erro ao carregar manifest:', error);
  }
  
  // Testar offline
  try {
    const response = await fetch('/offline.html');
    if (response.ok) {
      console.log('✅ Página offline carregada');
    } else {
      console.log('❌ Página offline não encontrada');
    }
  } catch (error) {
    console.error('❌ Erro ao carregar página offline:', error);
  }
}

// Executar teste
testPWA();
