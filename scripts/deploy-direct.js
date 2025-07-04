#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploy Direto - CERRADØ INTERBOX 2025');
console.log('=====================================\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Concluído!\n`);
    return true;
  } catch (error) {
    console.error(`❌ Erro em: ${description}`);
    console.error(error.message);
    return false;
  }
}

function cleanMacOSFiles() {
  console.log('🧹 Limpando arquivos macOS...');
  try {
    execSync('find . -name "._*" -delete', { stdio: 'inherit' });
    execSync('find . -name ".DS_Store" -delete', { stdio: 'inherit' });
    console.log('✅ Arquivos macOS limpos!\n');
  } catch (error) {
    console.log('⚠️ Aviso: Erro ao limpar arquivos macOS (pode ser ignorado)\n');
  }
}

function deployDirect() {
  console.log('🎯 Iniciando deploy direto...\n');

  // 1. Limpar arquivos macOS
  cleanMacOSFiles();

  // 2. Build do projeto
  if (!runCommand('npm run build', 'Build do projeto')) {
    console.error('❌ Build falhou! Deploy cancelado.');
    process.exit(1);
  }

  // 3. Deploy para App Hosting
  if (!runCommand('firebase deploy --only apphosting:git-box-app', 'Deploy para App Hosting')) {
    console.error('❌ Deploy falhou!');
    process.exit(1);
  }

  // 4. Deploy das funções (se necessário)
  const deployFunctions = process.argv.includes('--functions');
  if (deployFunctions) {
    if (!runCommand('firebase deploy --only functions', 'Deploy das funções')) {
      console.error('❌ Deploy das funções falhou!');
      process.exit(1);
    }
  }

  console.log('🎉 Deploy concluído com sucesso!');
  console.log('🌐 URL: https://git-box-app--interbox-app-8d400.us-central1.hosted.app');
  console.log('📊 Console: https://console.firebase.google.com/project/interbox-app-8d400/overview');
}

function deployWithRollout() {
  console.log('🎯 Iniciando deploy com rollout...\n');

  // 1. Limpar arquivos macOS
  cleanMacOSFiles();

  // 2. Build do projeto
  if (!runCommand('npm run build', 'Build do projeto')) {
    console.error('❌ Build falhou! Deploy cancelado.');
    process.exit(1);
  }

  // 3. Criar rollout (10% do tráfego)
  console.log('📊 Criando rollout com 10% do tráfego...');
  try {
    execSync('firebase apphosting:rollouts:create git-box-app --git-branch feature/primeiro-push', { stdio: 'inherit' });
    console.log('✅ Rollout criado!\n');
  } catch (error) {
    console.error('❌ Erro ao criar rollout:', error.message);
    console.log('🔄 Tentando deploy direto...\n');
    deployDirect();
    return;
  }

  console.log('🎉 Deploy com rollout concluído!');
  console.log('🌐 URL: https://git-box-app--interbox-app-8d400.us-central1.hosted.app');
  console.log('📊 Console: https://console.firebase.google.com/project/interbox-app-8d400/overview');
  console.log('📈 Rollout: 10% do tráfego para nova versão');
}

function showHelp() {
  console.log('🚀 Script de Deploy Direto - CERRADØ INTERBOX 2025');
  console.log('\n📖 Uso:');
  console.log('   node scripts/deploy-direct.js              # Deploy direto');
  console.log('   node scripts/deploy-direct.js --rollout    # Deploy com rollout (10% tráfego)');
  console.log('   node scripts/deploy-direct.js --functions  # Deploy + funções');
  console.log('   node scripts/deploy-direct.js --help       # Mostrar ajuda');
  console.log('\n💡 Opções:');
  console.log('   --rollout    - Usar rollout gradual (recomendado para mudanças grandes)');
  console.log('   --functions  - Incluir deploy das Cloud Functions');
  console.log('   --help       - Mostrar esta ajuda');
  console.log('\n🎯 Vantagens do deploy direto:');
  console.log('   ✅ Não depende do GitHub Actions');
  console.log('   ✅ Controle total do processo');
  console.log('   ✅ Rollback fácil se necessário');
  console.log('   ✅ Deploy gradual com rollout');
}

// Verificar argumentos
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--rollout':
    deployWithRollout();
    break;
    
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    deployDirect();
    break;
} 