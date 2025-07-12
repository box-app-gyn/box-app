#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build sem funcionalidades de pagamento...');

// Configurar variáveis de ambiente
process.env.DISABLE_FLOWPAY = 'true';
process.env.DISABLE_PAYMENTS = 'true';
process.env.NODE_ENV = 'production';

try {
  // Limpar build anterior
  console.log('🧹 Limpando build anterior...');
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }

  // Fazer build com configuração sem flowpay
  console.log('🔨 Fazendo build com configuração sem flowpay...');
  execSync('next build -c next.config.no-flowpay.js', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Build concluído com sucesso!');
  console.log('📁 Arquivos gerados em: ./out/');
  
  // Verificar se os arquivos foram gerados
  if (fs.existsSync('out')) {
    const files = fs.readdirSync('out');
    console.log(`📊 Total de arquivos gerados: ${files.length}`);
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
} 