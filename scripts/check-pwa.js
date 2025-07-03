const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Iniciando verificação PWA...\n');

// Verificar arquivos essenciais
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/offline.html',
  'public/images/offline-placeholder.png'
];

console.log('📋 Verificando arquivos essenciais...');
const missingFiles = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
    console.log(`❌ ${file} não encontrado`);
  } else {
    console.log(`✅ ${file} encontrado`);
  }
}

// Verificar manifest.json
console.log('\n📦 Verificando manifest.json...');
const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));

const requiredManifestFields = [
  'name',
  'short_name',
  'start_url',
  'display',
  'background_color',
  'theme_color',
  'icons'
];

const missingFields = [];
for (const field of requiredManifestFields) {
  if (!manifest[field]) {
    missingFields.push(field);
    console.log(`❌ Campo obrigatório ausente: ${field}`);
  } else {
    console.log(`✅ Campo ${field} presente`);
  }
}

// Verificar ícones
console.log('\n🖼️ Verificando ícones...');
const requiredSizes = ['192x192', '512x512'];
const missingIcons = [];

for (const size of requiredSizes) {
  const hasSize = manifest.icons.some(icon => icon.sizes === size);
  if (!hasSize) {
    missingIcons.push(size);
    console.log(`❌ Ícone ${size} ausente`);
  } else {
    console.log(`✅ Ícone ${size} presente`);
  }
}

// Verificar Service Worker
console.log('\n⚙️ Verificando Service Worker...');
const sw = fs.readFileSync('public/sw.js', 'utf8');

const requiredSWFeatures = [
  { name: 'Cache API', pattern: /caches\./ },
  { name: 'Fetch Handler', pattern: /fetch/ },
  { name: 'Cache Strategy', pattern: /(networkFirst|cacheFirst|staleWhileRevalidate)/ },
  { name: 'Error Handling', pattern: /catch/ },
  { name: 'Offline Fallback', pattern: /offline/ }
];

const missingSWFeatures = [];
for (const feature of requiredSWFeatures) {
  if (!feature.pattern.test(sw)) {
    missingSWFeatures.push(feature.name);
    console.log(`❌ Feature ausente: ${feature.name}`);
  } else {
    console.log(`✅ Feature presente: ${feature.name}`);
  }
}

// Verificar meta tags
console.log('\n🏷️ Verificando meta tags...');
const pages = ['pages/_app.tsx', 'pages/_document.tsx'];
let hasRequiredMetaTags = false;
const requiredMetaTags = [
  'viewport',
  'theme-color',
  'apple-mobile-web-app-capable',
  'apple-mobile-web-app-status-bar-style'
];

for (const page of pages) {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, 'utf8');
    for (const tag of requiredMetaTags) {
      if (content.includes(tag)) {
        console.log(`✅ Meta tag ${tag} encontrada em ${page}`);
        hasRequiredMetaTags = true;
      } else {
        console.log(`❌ Meta tag ${tag} ausente em ${page}`);
      }
    }
  }
}

// Resumo
console.log('\n📊 RESUMO DA VERIFICAÇÃO:');
console.log('------------------------');

if (missingFiles.length > 0) {
  console.log('❌ Arquivos ausentes:', missingFiles.join(', '));
} else {
  console.log('✅ Todos os arquivos essenciais presentes');
}

if (missingFields.length > 0) {
  console.log('❌ Campos do manifest ausentes:', missingFields.join(', '));
} else {
  console.log('✅ Manifest.json completo');
}

if (missingIcons.length > 0) {
  console.log('❌ Ícones ausentes:', missingIcons.join(', '));
} else {
  console.log('✅ Todos os ícones presentes');
}

if (missingSWFeatures.length > 0) {
  console.log('❌ Features do SW ausentes:', missingSWFeatures.join(', '));
} else {
  console.log('✅ Service Worker completo');
}

if (!hasRequiredMetaTags) {
  console.log('❌ Meta tags PWA ausentes');
} else {
  console.log('✅ Meta tags PWA presentes');
}

// Sugestões de melhoria
console.log('\n💡 SUGESTÕES DE MELHORIA:');
console.log('------------------------');

if (!manifest.shortcuts) {
  console.log('- Adicionar atalhos no manifest.json');
}

if (!manifest.file_handlers) {
  console.log('- Adicionar file handlers para melhor integração');
}

if (!sw.includes('workbox')) {
  console.log('- Considerar usar Workbox para gerenciamento de cache');
}

if (!manifest.screenshots) {
  console.log('- Adicionar screenshots para melhor experiência de instalação');
}

console.log('\n✨ Verificação concluída!'); 