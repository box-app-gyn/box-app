#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 Preparando build sem PWA...');

const configSource = path.join(process.cwd(), 'next.config.no-pwa.js');
const configTarget = path.join(process.cwd(), 'next.config.js');

try {
  fs.copyFileSync(configSource, configTarget);
  console.log('✅ Configuração copiada com sucesso');
  
  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  build.on('error', (error) => {
    console.error('❌ Erro no build:', error);
    process.exit(1);
  });

  build.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build concluído com sucesso');
      
      const deploy = spawn('firebase', ['deploy', '--only', 'hosting'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      deploy.on('error', (error) => {
        console.error('❌ Erro no deploy:', error);
        process.exit(1);
      });

      deploy.on('close', (deployCode) => {
        console.log(`✅ Deploy concluído com código: ${deployCode}`);
        process.exit(deployCode);
      });
    } else {
      console.error(`❌ Build falhou com código: ${code}`);
      process.exit(code);
    }
  });

} catch (error) {
  console.error('❌ Erro ao copiar configuração:', error);
  process.exit(1);
} 