#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Iniciando desenvolvimento sem PWA...');

const configSource = path.join(process.cwd(), 'next.config.no-pwa.js');
const configTarget = path.join(process.cwd(), 'next.config.js');

try {
  fs.copyFileSync(configSource, configTarget);
  console.log('✅ Configuração sem PWA aplicada');
} catch (error) {
  console.error('❌ Erro ao copiar configuração:', error);
  process.exit(1);
}

console.log('📱 Acesse: http://localhost:3000');
console.log('🧪 Teste de pagamento: http://localhost:3000/teste-pagamento');
console.log('💳 Pagamento normal: http://localhost:3000/pagamento');
console.log('');

const dev = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

dev.on('error', (error) => {
  console.error('❌ Erro ao iniciar o servidor:', error);
  process.exit(1);
});

dev.on('close', (code) => {
  console.log(`\n👋 Servidor encerrado com código: ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  dev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  dev.kill('SIGTERM');
}); 