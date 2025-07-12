#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy no Netlify...');

// Configurar variáveis de ambiente
process.env.NODE_ENV = 'production';

try {
  // Verificar se o Netlify CLI está instalado
  console.log('🔍 Verificando Netlify CLI...');
  try {
    execSync('netlify --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️  Netlify CLI não encontrado. Instalando...');
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
  }

  // Verificar se está logado no Netlify
  console.log('🔐 Verificando login do Netlify...');
  try {
    execSync('netlify status', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️  Não está logado no Netlify. Faça login primeiro:');
    console.log('   netlify login');
    process.exit(1);
  }

  // Fazer build
  console.log('🔨 Fazendo build...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Verificar se o build foi bem-sucedido
  if (!fs.existsSync('out')) {
    throw new Error('Build não gerou a pasta out/');
  }

  // Fazer deploy no Netlify
  console.log('🚀 Fazendo deploy no Netlify...');
  execSync('netlify deploy --prod --dir=out', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Deploy no Netlify concluído com sucesso!');
  console.log('🌐 Site disponível no Netlify');
  console.log('📝 Para ver o URL, execute: netlify status');

} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
} 