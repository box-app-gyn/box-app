#!/usr/bin/env node

import { execSync } from 'child_process';
import fetch from 'node-fetch';
import chalk from 'chalk';

const BASE_URL = process.env.BASE_URL || 'https://interbox-app-8d400.web.app';

console.log(chalk.blue('🧪 TESTE DE DEPLOY - CERRADØ INTERBOX'));
console.log(chalk.gray(`URL Base: ${BASE_URL}\n`));

// Função para fazer requisições HTTP
async function testEndpoint(path, method = 'GET', body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const start = Date.now();
    const response = await fetch(url, options);
    const end = Date.now();
    const responseTime = end - start;
    
    return {
      success: response.ok,
      status: response.status,
      responseTime,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

// Testes
async function runTests() {
  const tests = [
    {
      name: '🏠 Página Inicial',
      test: () => testEndpoint('/')
    },
    {
      name: '💬 API Chat',
      test: () => testEndpoint('/api/chat', 'POST', { message: 'test' })
    },
    {
      name: '❤️ API Health',
      test: () => testEndpoint('/api/health')
    },
    {
      name: '🔐 Página Login',
      test: () => testEndpoint('/login')
    },
    {
      name: '📊 Dashboard',
      test: () => testEndpoint('/dashboard')
    },
    {
      name: '👥 Times',
      test: () => testEndpoint('/times')
    },
    {
      name: '📱 Acesso Mobile',
      test: () => testEndpoint('/acesso-mobile-obrigatorio')
    }
  ];
  
  console.log(chalk.yellow('📋 Executando testes...\n'));
  
  for (const test of tests) {
    process.stdout.write(chalk.cyan(`⏳ ${test.name}... `));
    const result = await test.test();
    
    if (result.success) {
      console.log(chalk.green(`✅ OK (${result.responseTime}ms)`));
    } else {
      console.log(chalk.red(`❌ FALHOU (${result.status || 'ERRO'})`));
      if (result.error) {
        console.log(chalk.gray(`   Erro: ${result.error}`));
      }
    }
  }
  
  console.log(chalk.yellow('\n📊 Resumo dos Testes:'));
  console.log(chalk.gray('• Páginas estáticas devem carregar rapidamente'));
  console.log(chalk.gray('• APIs devem responder em < 2s'));
  console.log(chalk.gray('• SSR deve funcionar para páginas dinâmicas'));
}

// Verificar build
function checkBuild() {
  console.log(chalk.blue('🔨 Verificando build...'));
  
  try {
    // Verificar se .next existe
    const fs = require('fs');
    if (!fs.existsSync('.next')) {
      console.log(chalk.red('❌ Build não encontrado. Execute: npm run build'));
      return false;
    }
    
    console.log(chalk.green('✅ Build encontrado'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Erro ao verificar build'));
    return false;
  }
}

// Verificar Firebase Functions
function checkFunctions() {
  console.log(chalk.blue('\n🔥 Verificando Firebase Functions...'));
  
  try {
    const functionsDir = 'functions/src';
    const fs = require('fs');
    
    if (fs.existsSync(`${functionsDir}/nextjs-server.ts`)) {
      console.log(chalk.green('✅ NextJS Server Function encontrada'));
    } else {
      console.log(chalk.red('❌ NextJS Server Function não encontrada'));
    }
    
    if (fs.existsSync('firebase.json')) {
      console.log(chalk.green('✅ firebase.json configurado'));
    } else {
      console.log(chalk.red('❌ firebase.json não encontrado'));
    }
    
  } catch (error) {
    console.log(chalk.red('❌ Erro ao verificar functions'));
  }
}

// Main
async function main() {
  console.log(chalk.blue('🚀 INICIANDO TESTE DE DEPLOY\n'));
  
  // Verificações locais
  checkBuild();
  checkFunctions();
  
  // Testes de endpoint
  await runTests();
  
  console.log(chalk.blue('\n🎯 PRÓXIMOS PASSOS:'));
  console.log(chalk.gray('1. Deploy: npm run deploy'));
  console.log(chalk.gray('2. Teste mobile: npm run test:mobile'));
  console.log(chalk.gray('3. Monitoramento: Firebase Console'));
  console.log(chalk.gray('4. Logs: firebase functions:log'));
}

main().catch(console.error); 