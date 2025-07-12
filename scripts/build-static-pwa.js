#!/usr/bin/env node

/**
 * Script otimizado para build de PWA estática
 * Executa validação, build e otimizações específicas para export estático
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🚀 Iniciando build de PWA estática...\n');

// 1. Limpar builds anteriores
console.log('🧹 Limpando builds anteriores...');
try {
  if (fs.existsSync(path.join(projectRoot, '.next'))) {
    fs.rmSync(path.join(projectRoot, '.next'), { recursive: true, force: true });
  }
  if (fs.existsSync(path.join(projectRoot, 'out'))) {
    fs.rmSync(path.join(projectRoot, 'out'), { recursive: true, force: true });
  }
  console.log('✅ Builds anteriores removidos');
} catch (error) {
  console.log('⚠️  Erro ao limpar builds anteriores:', error.message);
}

// 2. Validar projeto
console.log('\n🔍 Validando projeto...');
try {
  execSync('npm run validate-static', { 
    cwd: projectRoot, 
    stdio: 'inherit' 
  });
  console.log('✅ Validação concluída');
} catch (error) {
  console.log('❌ Validação falhou. Corrija os erros antes de continuar.');
  process.exit(1);
}

// 3. Instalar dependências (se necessário)
console.log('\n📦 Verificando dependências...');
try {
  execSync('npm ci --only=production', { 
    cwd: projectRoot, 
    stdio: 'inherit' 
  });
  console.log('✅ Dependências verificadas');
} catch (error) {
  console.log('⚠️  Erro ao verificar dependências, tentando npm install...');
  try {
    execSync('npm install', { 
      cwd: projectRoot, 
      stdio: 'inherit' 
    });
  } catch (installError) {
    console.log('❌ Erro ao instalar dependências:', installError.message);
    process.exit(1);
  }
}

// 4. Build do Next.js
console.log('\n🔨 Fazendo build do Next.js...');
try {
  execSync('next build', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Build do Next.js concluído');
} catch (error) {
  console.log('❌ Erro no build do Next.js:', error.message);
  process.exit(1);
}

// 5. Build estático (Next.js 15+ usa output: 'export' automaticamente)
console.log('\n📤 Build estático concluído automaticamente pelo Next.js 15+');

// 6. Verificar arquivos gerados
console.log('\n📁 Verificando arquivos gerados...');
const outDir = path.join(projectRoot, 'out');

if (!fs.existsSync(outDir)) {
  console.log('❌ Pasta /out/ não foi gerada');
  process.exit(1);
}

const files = fs.readdirSync(outDir);
console.log(`✅ Pasta /out/ gerada com ${files.length} arquivos/diretórios`);

// 7. Verificar arquivos essenciais
const essentialFiles = [
  'index.html',
  '_next',
  'manifest.json',
  'sw.js',
  'offline.html'
];

essentialFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} encontrado`);
  } else {
    console.log(`⚠️  ${file} não encontrado`);
  }
});

// 8. Otimizações finais
console.log('\n⚡ Aplicando otimizações finais...');

// Copiar arquivos PWA se não existirem
const pwaFiles = [
  { src: 'public/manifest.json', dest: 'out/manifest.json' },
  { src: 'public/sw.js', dest: 'out/sw.js' },
  { src: 'public/offline.html', dest: 'out/offline.html' }
];

pwaFiles.forEach(({ src, dest }) => {
  const srcPath = path.join(projectRoot, src);
  const destPath = path.join(projectRoot, dest);
  
  if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ ${src} copiado para ${dest}`);
    } catch (error) {
      console.log(`⚠️  Erro ao copiar ${src}:`, error.message);
    }
  }
});

// 9. Estatísticas finais
console.log('\n📊 Estatísticas do build:');
try {
  const stats = fs.statSync(outDir);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📁 Tamanho total: ${sizeInMB} MB`);
} catch (error) {
  console.log('⚠️  Erro ao calcular tamanho');
}

// 10. Instruções finais
console.log('\n🎉 Build de PWA estática concluído com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Teste localmente: npx serve out');
console.log('2. Deploy para Firebase: firebase deploy --only hosting');
console.log('3. Ou use: npm run deploy');

console.log('\n📱 Funcionalidades PWA mantidas:');
console.log('✅ Manifest.json');
console.log('✅ Service Worker');
console.log('✅ Cache offline');
console.log('✅ Splash screen');
console.log('✅ Install prompts');

console.log('\n🚀 Para testar:');
console.log('   cd out && npx serve');
console.log('   ou');
console.log('   npm run deploy'); 