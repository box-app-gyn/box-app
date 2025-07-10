#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎬 TESTE DO SPLASH SCREEN - CERRADØ');
console.log('=====================================\n');

// 1. Verificar se o arquivo de vídeo existe
console.log('1️⃣ Verificando arquivo de vídeo...');
const videoPath = path.join(process.cwd(), 'public', 'videos', 'intro.mp4');
if (fs.existsSync(videoPath)) {
  const stats = fs.statSync(videoPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Vídeo encontrado: intro.mp4 (${sizeMB} MB)`);
} else {
  console.log('❌ Vídeo não encontrado: intro.mp4');
}

// 2. Verificar se o componente VideoSplashScreen existe
console.log('\n2️⃣ Verificando componente VideoSplashScreen...');
const componentPath = path.join(process.cwd(), 'components', 'VideoSplashScreen.tsx');
if (fs.existsSync(componentPath)) {
  console.log('✅ Componente VideoSplashScreen.tsx encontrado');
  
  // Verificar se tem as funcionalidades essenciais
  const componentContent = fs.readFileSync(componentPath, 'utf8');
  const checks = [
    { name: 'Loading spinner', pattern: 'animate-spin' },
    { name: 'Logo overlay', pattern: 'logo_circulo.png' },
    { name: 'Botão pular', pattern: 'Pular' },
    { name: 'Barra de progresso', pattern: 'Progress Bar' },
    { name: 'Fallback', pattern: 'videoError' },
    { name: 'AutoPlay', pattern: 'autoPlay' },
    { name: 'PlaysInline', pattern: 'playsInline' },
    { name: 'Muted', pattern: 'muted' }
  ];
  
  checks.forEach(check => {
    if (componentContent.includes(check.pattern)) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
} else {
  console.log('❌ Componente VideoSplashScreen.tsx não encontrado');
}

// 3. Verificar se o logo existe
console.log('\n3️⃣ Verificando logo...');
const logoPath = path.join(process.cwd(), 'public', 'logos', 'logo_circulo.png');
if (fs.existsSync(logoPath)) {
  console.log('✅ Logo encontrado: logo_circulo.png');
} else {
  console.log('❌ Logo não encontrado: logo_circulo.png');
}

// 4. Verificar se o servidor está rodando
console.log('\n4️⃣ Verificando servidor...');
const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Servidor rodando em http://localhost:3000');
  } else {
    console.log(`❌ Servidor retornou status: ${res.statusCode}`);
  }
});

req.on('error', (err) => {
  console.log('❌ Servidor não está rodando');
});

req.on('timeout', () => {
  console.log('❌ Timeout ao conectar com servidor');
  req.destroy();
});

req.end();

// 5. Informações de teste
console.log('\n5️⃣ Informações para teste:');
console.log('📱 URL Mobile: http://192.168.1.101:3000');
console.log('💻 URL Desktop: http://localhost:3000');

console.log('\n📋 CHECKLIST PARA TESTE MANUAL:');
console.log('==============================');
console.log('□ Vídeo carrega automaticamente');
console.log('□ Loading spinner aparece durante carregamento');
console.log('□ Logo overlay aparece no canto superior esquerdo');
console.log('□ Botão "Pular" funciona');
console.log('□ Barra de progresso animada');
console.log('□ Fallback funciona se vídeo falhar');
console.log('□ Animações suaves');
console.log('□ App abre em modo standalone');

console.log('\n🚨 PROBLEMAS COMUNS:');
console.log('===================');
console.log('• Vídeo não carrega: Verificar formato e tamanho');
console.log('• Loop infinito: Verificar meta tags viewport');
console.log('• Não acessa mobile: Verificar IP e rede Wi-Fi');
console.log('• PWA não instala: Usar HTTPS (ngrok)');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('==================');
console.log('1. Acesse http://192.168.1.101:3000/test-splash no Safari mobile');
console.log('2. Teste cada item do checklist acima');
console.log('3. Se houver problemas, execute: npm run dev:mobile:https');
console.log('4. Para debug: npm run check:pwa');
console.log('5. URL de teste: http://192.168.1.101:3000/test-splash');

console.log('\n✨ Teste concluído!'); 