#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy de teste sem funcionalidades de pagamento...');

// Configurar variáveis de ambiente
process.env.DISABLE_FLOWPAY = 'true';
process.env.DISABLE_PAYMENTS = 'true';
process.env.NODE_ENV = 'production';

try {
  // Verificar se o Firebase CLI está instalado
  console.log('🔍 Verificando Firebase CLI...');
  execSync('firebase --version', { stdio: 'pipe' });
  
  // Verificar se está logado no Firebase
  console.log('🔐 Verificando login do Firebase...');
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️  Não está logado no Firebase. Faça login primeiro:');
    console.log('   firebase login');
    process.exit(1);
  }

  // Fazer build sem flowpay
  console.log('🔨 Fazendo build sem funcionalidades de pagamento...');
  execSync('npm run build:no-flowpay', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Verificar se o build foi bem-sucedido
  if (!fs.existsSync('out')) {
    throw new Error('Build não gerou a pasta out/');
  }

  // Fazer deploy apenas do hosting
  console.log('🚀 Fazendo deploy no Firebase Hosting...');
  execSync('firebase deploy --only hosting', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Deploy concluído com sucesso!');
  console.log('🌐 Site disponível em: https://[seu-projeto].web.app');
  console.log('📝 Nota: Funcionalidades de pagamento foram desabilitadas para este deploy de teste');

} catch (error) {
  console.error('❌ Erro durante o deploy:', error.message);
  process.exit(1);
} 