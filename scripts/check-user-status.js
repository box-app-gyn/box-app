const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
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

const db = getFirestore();

// Email do usuário a verificar
const targetEmail = 'nettoaeb1@gmail.com';

async function checkUserStatus() {
  console.log('🔍 Verificando status do usuário:', targetEmail);
  console.log('─'.repeat(60));

  try {
    // 1. Verificar no Firebase Authentication
    console.log('📋 1. Verificando Firebase Authentication...');
    
    const userRecord = await admin.auth().getUserByEmail(targetEmail);
    
    console.log('✅ Usuário encontrado no Authentication!');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Nome: ${userRecord.displayName || 'Não definido'}`);
    console.log(`   Email verificado: ${userRecord.emailVerified ? '✅ Sim' : '❌ Não'}`);
    console.log(`   Conta ativa: ${userRecord.disabled ? '❌ Não' : '✅ Sim'}`);
    console.log(`   Criado em: ${userRecord.metadata.creationTime}`);
    console.log(`   Último login: ${userRecord.metadata.lastSignInTime || 'Nunca'}`);

    // 2. Verificar no Firestore
    console.log('\n📋 2. Verificando Firestore...');
    
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ Documento encontrado no Firestore!');
      console.log(`   Role: ${userData.role || 'Não definido'}`);
      console.log(`   Status ativo: ${userData.isActive ? '✅ Sim' : '❌ Não'}`);
      console.log(`   MFA habilitado: ${userData.mfaEnabled ? '✅ Sim' : '❌ Não'}`);
      console.log(`   Criado em: ${userData.createdAt?.toDate?.() || 'Não definido'}`);
      console.log(`   Atualizado em: ${userData.updatedAt?.toDate?.() || 'Não definido'}`);
      
      // Verificar se é admin
      if (userData.role === 'admin') {
        console.log('\n🎉 STATUS: USUÁRIO ADMIN CONFIGURADO CORRETAMENTE!');
        console.log('✅ Pode fazer login no sistema');
        console.log('✅ Tem acesso ao painel admin');
      } else {
        console.log('\n⚠️  PROBLEMA: Usuário não tem role admin!');
        console.log('❌ Precisa ser configurado como admin');
      }
      
    } else {
      console.log('❌ Documento NÃO encontrado no Firestore!');
      console.log('⚠️  PROBLEMA: Usuário existe no Auth mas não no Firestore');
      console.log('💡 SOLUÇÃO: Execute o script add-existing-admins.js');
    }

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Usuário NÃO encontrado no Firebase Authentication!');
      console.log('⚠️  PROBLEMA: Usuário não foi criado no Auth');
      console.log('💡 SOLUÇÃO: Execute o script create-admin-users.js');
    } else {
      console.error('❌ Erro ao verificar usuário:', error.message);
      console.error('🔍 Código do erro:', error.code);
    }
  }

  console.log('\n─'.repeat(60));
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Se usuário não existe no Auth: execute create-admin-users.js');
  console.log('2. Se usuário não existe no Firestore: execute add-existing-admins.js');
  console.log('3. Se tudo OK mas não consegue logar: verifique as regras do Firestore');
  console.log('4. Teste o login em: https://interbox-app-8d400.web.app/login');
}

// Executar verificação
checkUserStatus().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 