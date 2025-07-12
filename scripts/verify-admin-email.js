import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function verifyAdminEmail() {
  console.log('🔍 Verificando e corrigindo email do admin:', targetEmail);
  console.log('─'.repeat(60));

  try {
    // 1. Buscar usuário no Firebase Authentication
    console.log('📋 1. Buscando usuário no Authentication...');
    
    const userRecord = await admin.auth().getUserByEmail(targetEmail);
    
    console.log('✅ Usuário encontrado no Authentication!');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Email verificado: ${userRecord.emailVerified ? '✅ Sim' : '❌ Não'}`);
    
    // 2. Se o email não está verificado, marcar como verificado
    if (!userRecord.emailVerified) {
      console.log('\n📋 2. Email não está verificado. Marcando como verificado...');
      
      await admin.auth().updateUser(userRecord.uid, {
        emailVerified: true
      });
      
      console.log('✅ Email marcado como verificado!');
      
      // 3. Verificar novamente
      const updatedUserRecord = await admin.auth().getUserByEmail(targetEmail);
      console.log(`   Status atual: ${updatedUserRecord.emailVerified ? '✅ Verificado' : '❌ Não verificado'}`);
      
    } else {
      console.log('\n✅ Email já está verificado!');
    }

    // 4. Verificar documento no Firestore
    console.log('\n📋 3. Verificando documento no Firestore...');
    
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ Documento encontrado no Firestore!');
      console.log(`   Role: ${userData.role || 'Não definido'}`);
      console.log(`   Status ativo: ${userData.isActive ? '✅ Sim' : '❌ Não'}`);
      
      if (userData.role === 'admin') {
        console.log('\n🎉 STATUS: USUÁRIO ADMIN TOTALMENTE CONFIGURADO!');
        console.log('✅ Email verificado');
        console.log('✅ Role admin definido');
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
  console.log('1. Teste o login em: https://interbox-app-8d400.web.app/login');
  console.log('2. Use as credenciais:');
  console.log(`   Email: ${targetEmail}`);
  console.log('   Senha: Interbox2025!NM');
  console.log('3. Se ainda não funcionar, verifique o console do navegador');
}

// Executar verificação
verifyAdminEmail().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 