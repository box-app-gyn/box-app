#!/usr/bin/env node

/**
 * Script para adicionar domínio personalizado ao Firebase
 * Execute este script após configurar o domínio no Firebase Console
 */

const { execSync } = require('child_process');

console.log('🔧 Configurando domínio personalizado no Firebase...\n');

try {
  // Verificar se o Firebase CLI está logado
  console.log('1. Verificando login do Firebase...');
  execSync('firebase projects:list', { stdio: 'inherit' });
  
  console.log('\n2. Domínio atual configurado:');
  console.log('   - interbox-app-8d400.web.app (padrão)');
  console.log('   - cerradointerbox.com.br (personalizado)');
  
  console.log('\n3. Para resolver o erro de CORS, você precisa:');
  console.log('   a) Acessar: https://console.firebase.google.com/project/interbox-app-8d400/authentication/settings');
  console.log('   b) Ir em "Authorized domains"');
  console.log('   c) Adicionar: cerradointerbox.com.br');
  console.log('   d) Clicar em "Add"');
  
  console.log('\n4. Após adicionar o domínio, o erro de CORS deve desaparecer.');
  console.log('   O Firestore poderá se conectar normalmente.');
  
  console.log('\n✅ Script concluído! Siga os passos acima para resolver o problema.');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  console.log('\n💡 Solução:');
  console.log('1. Execute: firebase login');
  console.log('2. Execute este script novamente');
} 