#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build estático para Netlify...');

// Configurar variáveis de ambiente
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

  // Fazer build com configuração estática
  console.log('🔨 Fazendo build estático...');
  execSync('next build -c next.config.static.js', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('✅ Build estático concluído com sucesso!');
  console.log('📁 Arquivos gerados em: ./out/');
  
  // Verificar se os arquivos foram gerados
  if (fs.existsSync('out')) {
    const files = fs.readdirSync('out');
    console.log(`📊 Total de arquivos gerados: ${files.length}`);
    
    // Verificar se o index.html foi gerado
    if (fs.existsSync('out/index.html')) {
      console.log('✅ index.html gerado com sucesso!');
    } else {
      console.log('⚠️  index.html não encontrado');
    }
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
} 