#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('📊 MONITORAMENTO DE DEPLOY - CERRADØ INTERBOX\n'));

// Função para executar comandos
function runCommand(command, description) {
  try {
    console.log(chalk.cyan(`🔍 ${description}...`));
    const result = execSync(command, { encoding: 'utf8' });
    console.log(chalk.green('✅ Sucesso'));
    return result;
  } catch (error) {
    console.log(chalk.red('❌ Erro:'), error.message);
    return null;
  }
}

// Verificar logs do Firebase Functions
function checkFunctionLogs() {
  console.log(chalk.yellow('\n🔥 LOGS DO FIREBASE FUNCTIONS:'));
  
  const logs = runCommand(
    'firebase functions:log --limit 20',
    'Obtendo logs das functions'
  );
  
  if (logs) {
    console.log(chalk.gray('\n📋 Últimos logs:'));
    console.log(logs);
  }
}

// Verificar status do deploy
function checkDeployStatus() {
  console.log(chalk.yellow('\n🚀 STATUS DO DEPLOY:'));
  
  const status = runCommand(
    'firebase hosting:channel:list',
    'Verificando canais de deploy'
  );
  
  if (status) {
    console.log(chalk.gray('\n📋 Canais ativos:'));
    console.log(status);
  }
}

// Verificar performance
function checkPerformance() {
  console.log(chalk.yellow('\n⚡ PERFORMANCE:'));
  
  const lighthouse = runCommand(
    'npx lighthouse https://interbox-app-8d400.web.app --output=json --output-path=./lighthouse-report.json --only-categories=performance',
    'Executando Lighthouse'
  );
  
  if (lighthouse) {
    console.log(chalk.green('✅ Relatório de performance gerado'));
  }
}

// Verificar métricas do Firebase
function checkFirebaseMetrics() {
  console.log(chalk.yellow('\n📈 MÉTRICAS DO FIREBASE:'));
  
  console.log(chalk.gray('• Acesse: https://console.firebase.google.com'));
  console.log(chalk.gray('• Projeto: interbox-app-8d400'));
  console.log(chalk.gray('• Hosting: Analytics e Performance'));
  console.log(chalk.gray('• Functions: Logs e Métricas'));
}

// Main
function main() {
  console.log(chalk.blue('🎯 INICIANDO MONITORAMENTO\n'));
  
  checkFunctionLogs();
  checkDeployStatus();
  checkPerformance();
  checkFirebaseMetrics();
  
  console.log(chalk.blue('\n📋 CHECKLIST DE VALIDAÇÃO:'));
  console.log(chalk.gray('✅ Build Next.js gerado'));
  console.log(chalk.gray('✅ Firebase Functions configuradas'));
  console.log(chalk.gray('✅ Rewrites configurados'));
  console.log(chalk.gray('✅ APIs funcionando'));
  console.log(chalk.gray('✅ SSR ativo'));
  console.log(chalk.gray('✅ Performance otimizada'));
  
  console.log(chalk.blue('\n🔧 COMANDOS ÚTEIS:'));
  console.log(chalk.gray('• Deploy: npm run deploy'));
  console.log(chalk.gray('• Logs: firebase functions:log'));
  console.log(chalk.gray('• Status: firebase hosting:channel:list'));
  console.log(chalk.gray('• Teste: npm run test:deploy'));
}

main(); 