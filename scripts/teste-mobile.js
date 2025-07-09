#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

console.log('📱 Iniciando teste mobile PWA...');

// 1. Obter IP local
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const port = 3000;
const url = `http://${localIP}:${port}`;

console.log(`🌐 URL para teste mobile: ${url}`);

// 2. Gerar QR Code para fácil acesso
try {
  const qrcode = require('qrcode-terminal');
  console.log('\n📱 QR Code para escanear no mobile:');
  qrcode.generate(url, { small: true });
} catch (error) {
  console.log('💡 Instale qrcode-terminal para QR Code: npm install qrcode-terminal');
}

// 3. Instruções de teste
console.log('\n🧪 ROTEIRO DE TESTE MOBILE:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n1. 📲 ACESSO INICIAL:');
console.log('   • Abra o navegador no mobile');
console.log(`   • Acesse: ${url}`);
console.log('   • Aceite certificado (se necessário)');

console.log('\n2. 🔍 VERIFICAR CARREGAMENTO:');
console.log('   • ✅ Página carrega completamente');
console.log('   • ✅ Splash screen aparece');
console.log('   • ✅ Layout responsivo');
console.log('   • ✅ Sem erros visíveis');

console.log('\n3. 📱 TESTE INSTALAÇÃO PWA:');
console.log('   • ✅ Banner "Adicionar à tela inicial" aparece');
console.log('   • ✅ Ou menu do navegador > "Instalar app"');
console.log('   • ✅ Ícone aparece na home screen');
console.log('   • ✅ Abre em tela cheia (sem barra do navegador)');

console.log('\n4. 🔄 TESTE OFFLINE:');
console.log('   • ✅ Desligar WiFi/dados');
console.log('   • ✅ Navegar entre páginas já visitadas');
console.log('   • ✅ Página offline aparece para novas páginas');
console.log('   • ✅ Religar internet e app funciona normal');

console.log('\n5. 🎯 TESTE FUNCIONALIDADES:');
console.log('   • ✅ Login/cadastro funcionando');
console.log('   • ✅ Navegação entre páginas');
console.log('   • ✅ Botões e toques responsivos');
console.log('   • ✅ Animações suaves');

console.log('\n6. 🚀 TESTE PERFORMANCE:');
console.log('   • ✅ Carregamento < 3 segundos');
console.log('   • ✅ Transições fluidas');
console.log('   • ✅ Sem travamentos');
console.log('   • ✅ Scroll suave');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n💡 DICAS:');
console.log('   • Teste em Android E iOS se possível');
console.log('   • Teste em 3G/4G, não só WiFi');
console.log('   • Limpe cache do navegador entre testes');
console.log('   • Verifique console mobile para erros');

console.log('\n🏁 RESULTADO ESPERADO:');
console.log('   • 📱 App instalável');
console.log('   • ⚡ Rápido e responsivo');
console.log('   • 🔄 Funciona offline');
console.log('   • 🎯 Todas funcionalidades OK');

console.log('\n🆘 SE ALGO FALHAR:');
console.log('   • Verifique certificado SSL');
console.log('   • Limpe cache do navegador');
console.log('   • Reinicie o servidor de desenvolvimento');
console.log('   • Verifique console do navegador');

console.log('\n🚀 PRONTO PARA TESTAR! Acesse pelo mobile agora...');