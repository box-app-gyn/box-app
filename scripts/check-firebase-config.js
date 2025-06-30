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

async function checkFirebaseConfig() {
  console.log('🔍 Verificando configuração do Firebase...');
  console.log('─'.repeat(60));

  try {
    // 1. Verificar configuração do projeto
    console.log('📋 1. Verificando configuração do projeto...');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
    console.log(`   Private Key ID: ${serviceAccount.private_key_id}`);
    
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
    
    // 4. Verificar configurações do projeto
    console.log('\n📋 4. Verificando configurações do projeto...');
    
    // Tentar acessar configurações do projeto
    const projectConfig = await admin.app().options;
    console.log('✅ Configuração do projeto OK');
    console.log(`   Project ID: ${projectConfig.projectId}`);
    
    // 5. Verificar se o Authentication está habilitado
    console.log('\n📋 5. Verificando se Authentication está habilitado...');
    
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
    
    console.log('\n🎉 CONFIGURAÇÃO DO FIREBASE OK!');
    console.log('✅ Todas as verificações passaram');
    console.log('✅ Authentication está funcionando');
    console.log('✅ Projeto configurado corretamente');
    
  } catch (error) {
    console.error('❌ Erro na configuração do Firebase:', error.message);
    console.error('🔍 Código do erro:', error.code);
    
    if (error.code === 'auth/configuration-not-found') {
      console.log('\n💡 SOLUÇÃO:');
      console.log('1. Verifique se o Authentication está habilitado no Firebase Console');
      console.log('2. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/authentication');
      console.log('3. Clique em "Get started" se não estiver habilitado');
      console.log('4. Habilite o provedor "Email/Password"');
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
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Se tudo OK: teste o login novamente');
  console.log('2. Se erro persistir: verifique o console do navegador');
  console.log('3. URL de teste: https://interbox-app-8d400.web.app/login');
}

// Executar verificação
checkFirebaseConfig().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 