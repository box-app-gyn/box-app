#!/usr/bin/env node

/**
 * Script para validar se o projeto está pronto para exportação estática
 * Verifica dependências de SSR, API routes, e configurações necessárias
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 Validando projeto para exportação estática...\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// 1. Verificar se next.config.js tem output: 'export'
function checkNextConfig() {
  console.log('📋 Verificando next.config.js...');
  
  try {
    const configPath = path.join(projectRoot, 'next.config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (!configContent.includes("output: 'export'")) {
      errors.push('❌ next.config.js não tem output: "export" configurado');
      hasErrors = true;
    } else {
      console.log('✅ next.config.js configurado para export estático');
    }
    
    if (!configContent.includes('unoptimized: true')) {
      warnings.push('⚠️  Imagens não estão configuradas como unoptimized (necessário para export estático)');
    } else {
      console.log('✅ Imagens configuradas para export estático');
    }
  } catch (error) {
    errors.push('❌ Erro ao ler next.config.js');
    hasErrors = true;
  }
}

// 2. Verificar se existem API routes (não compatíveis com export estático)
function checkAPIRoutes() {
  console.log('🔌 Verificando API routes...');
  
  const apiDir = path.join(projectRoot, 'pages', 'api');
  
  if (fs.existsSync(apiDir)) {
    const apiFiles = fs.readdirSync(apiDir, { recursive: true })
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .filter(file => !file.includes('node_modules'));
    
    if (apiFiles.length > 0) {
      errors.push(`❌ Encontradas ${apiFiles.length} API routes (não compatíveis com export estático):`);
      apiFiles.forEach(file => {
        errors.push(`   - pages/api/${file}`);
      });
      hasErrors = true;
    } else {
      console.log('✅ Nenhuma API route encontrada');
    }
  } else {
    console.log('✅ Pasta pages/api não existe');
  }
}

// 3. Verificar se existem getServerSideProps
function checkServerSideProps() {
  console.log('🖥️  Verificando getServerSideProps...');
  
  const pagesDir = path.join(projectRoot, 'pages');
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('getServerSideProps')) {
            const relativePath = path.relative(projectRoot, filePath);
            errors.push(`❌ getServerSideProps encontrado em: ${relativePath}`);
            hasErrors = true;
          }
        } catch (error) {
          warnings.push(`⚠️  Erro ao ler arquivo: ${filePath}`);
        }
      }
    }
  }
  
  if (fs.existsSync(pagesDir)) {
    scanDirectory(pagesDir);
  }
  
  if (!hasErrors) {
    console.log('✅ Nenhum getServerSideProps encontrado');
  }
}

// 4. Verificar arquivos PWA essenciais
function checkPWAFiles() {
  console.log('📱 Verificando arquivos PWA...');
  
  const pwaFiles = [
    'public/manifest.json',
    'public/sw.js',
    'public/offline.html'
  ];
  
  pwaFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} encontrado`);
    } else {
      warnings.push(`⚠️  ${file} não encontrado`);
    }
  });
}

// 5. Verificar dependências de Node.js no frontend
function checkNodeDependencies() {
  console.log('📦 Verificando dependências...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const nodeOnlyDeps = [
      'fs', 'path', 'crypto', 'http', 'https', 'url', 'querystring',
      'fs-extra', 'nodemailer', 'sharp'
    ];
    
    const foundNodeDeps = nodeOnlyDeps.filter(dep => dependencies[dep]);
    
    if (foundNodeDeps.length > 0) {
      warnings.push(`⚠️  Dependências que podem causar problemas no cliente: ${foundNodeDeps.join(', ')}`);
    } else {
      console.log('✅ Nenhuma dependência problemática encontrada');
    }
  } catch (error) {
    errors.push('❌ Erro ao ler package.json');
    hasErrors = true;
  }
}

// 6. Verificar se o Service Worker está configurado corretamente
function checkServiceWorker() {
  console.log('🔧 Verificando Service Worker...');
  
  const swPath = path.join(projectRoot, 'public', 'sw.js');
  
  if (fs.existsSync(swPath)) {
    try {
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (swContent.includes('fetch') && swContent.includes('cache')) {
        console.log('✅ Service Worker parece estar configurado corretamente');
      } else {
        warnings.push('⚠️  Service Worker pode não estar configurado corretamente');
      }
    } catch (error) {
      warnings.push('⚠️  Erro ao ler Service Worker');
    }
  } else {
    warnings.push('⚠️  Service Worker não encontrado');
  }
}

// Executar todas as verificações
checkNextConfig();
checkAPIRoutes();
checkServerSideProps();
checkPWAFiles();
checkNodeDependencies();
checkServiceWorker();

// Exibir resultados
console.log('\n📊 Resultado da validação:');

if (errors.length > 0) {
  console.log('\n❌ ERROS ENCONTRADOS:');
  errors.forEach(error => console.log(error));
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVISOS:');
  warnings.forEach(warning => console.log(warning));
}

if (!hasErrors && warnings.length === 0) {
  console.log('\n✅ Projeto está pronto para exportação estática!');
  console.log('\n🚀 Para fazer o build:');
  console.log('   npm run export');
  console.log('   ou');
  console.log('   npm run pwa:build');
} else if (!hasErrors) {
  console.log('\n⚠️  Projeto pode ser exportado, mas com avisos.');
  console.log('\n🚀 Para fazer o build:');
  console.log('   npm run export');
} else {
  console.log('\n❌ Corrija os erros antes de fazer a exportação estática.');
  process.exit(1);
}

console.log('\n📁 A pasta /out/ será gerada com os arquivos estáticos.');
console.log('🌐 Para testar localmente: npx serve out'); 