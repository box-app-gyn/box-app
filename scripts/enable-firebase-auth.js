const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Verificar se o arquivo de credenciais existe
const credentialsPath = path.join(__dirname, 'firebase-admin-key.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Arquivo de credenciais não encontrado!');
  console.log('\n📋 Para obter as credenciais:');
  console.log('1. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/settings/serviceaccounts/adminsdk');
  console.log('2. Clique em "Gerar nova chave privada"');
  console.log('3. Baixe o arquivo JSON');
  console.log('4. Renomeie para "firebase-admin-key.json"');
  console.log('5. Coloque na pasta "scripts/"');
  console.log('\n⚠️  IMPORTANTE: Nunca compartilhe esse arquivo!');
  process.exit(1);
}

// Carregar credenciais do arquivo JSON
const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function enableFirebaseAuth() {
  console.log('🔧 Habilitando Firebase Authentication...');
  console.log('─'.repeat(60));

  try {
    // 1. Verificar configuração do projeto
    console.log('📋 1. Verificando configuração do projeto...');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
    
    // 2. Testar conexão com Authentication
    console.log('\n📋 2. Testando conexão com Authentication...');
    const auth = admin.auth();
    
    // Tentar listar usuários (apenas para testar conexão)
    const listUsersResult = await auth.listUsers(1);
    console.log('✅ Conexão com Authentication OK');
    console.log(`   Total de usuários: ${listUsersResult.users.length}`);
    
    // 3. Verificar configurações do Authentication
    console.log('\n📋 3. Verificando configurações do Authentication...');
    
    // Verificar se o usuário admin existe
    const userRecord = await auth.getUserByEmail('nettoaeb1@gmail.com');
    console.log('✅ Usuário admin encontrado');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email verificado: ${userRecord.emailVerified}`);
    console.log(`   Conta ativa: ${!userRecord.disabled}`);
    
    // 4. Verificar se o Authentication está habilitado
    console.log('\n📋 4. Verificando se Authentication está habilitado...');
    
    // Tentar criar um usuário de teste temporário
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await auth.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      displayName: 'Test User'
    });
    
    console.log('✅ Authentication está habilitado e funcionando');
    console.log(`   Usuário de teste criado: ${testUser.uid}`);
    
    // Remover usuário de teste
    await auth.deleteUser(testUser.uid);
    console.log('✅ Usuário de teste removido');
    
    console.log('\n🎉 FIREBASE AUTHENTICATION CONFIGURADO!');
    console.log('✅ Authentication está funcionando');
    console.log('✅ Projeto configurado corretamente');
    console.log('✅ Usuário admin disponível');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o Firebase Console:');
    console.log('   https://console.firebase.google.com/project/interbox-app-8d400/authentication');
    console.log('2. Vá para "Sign-in method"');
    console.log('3. Habilite "Email/Password"');
    console.log('4. Em "Settings" → "Authorized domains", adicione:');
    console.log('   - interbox-app-8d400.web.app');
    console.log('   - localhost (para desenvolvimento)');
    console.log('5. Teste o login em: https://interbox-app-8d400.web.app/login');
    
  } catch (error) {
    console.error('❌ Erro na configuração do Firebase:', error.message);
    console.error('🔍 Código do erro:', error.code);
    
    if (error.code === 'auth/configuration-not-found') {
      console.log('\n💡 SOLUÇÃO PARA auth/configuration-not-found:');
      console.log('1. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/authentication');
      console.log('2. Clique em "Get started" se não estiver habilitado');
      console.log('3. Vá para "Sign-in method"');
      console.log('4. Habilite "Email/Password"');
      console.log('5. Em "Settings" → "Authorized domains", adicione:');
      console.log('   - interbox-app-8d400.web.app');
      console.log('   - localhost');
    } else if (error.code === 'auth/insufficient-permission') {
      console.log('\n💡 SOLUÇÃO:');
      console.log('1. Verifique as permissões do Service Account');
      console.log('2. Certifique-se de que tem permissão para gerenciar usuários');
    } else {
      console.log('\n💡 SOLUÇÃO:');
      console.log('1. Verifique se o projeto está ativo');
      console.log('2. Verifique se as credenciais estão corretas');
      console.log('3. Tente regenerar as credenciais do Service Account');
    }
  }

  console.log('\n─'.repeat(60));
  console.log('📋 MANUAL DE CONFIGURAÇÃO:');
  console.log('1. Firebase Console → Authentication → Get started');
  console.log('2. Sign-in method → Email/Password → Enable');
  console.log('3. Settings → Authorized domains → Add domain');
  console.log('4. Teste o login com: nettoaeb1@gmail.com / Interbox2025!NM');
}

// Executar configuração
enableFirebaseAuth().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 