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

// Lista de emails dos usuários admin
const adminEmails = [
  'gopersonal82@gmail.com',
  'melloribeiro.lara@gmail.com', 
  'nettoaeb1@gmail.com'
];

async function addExistingAdmins() {
  console.log('🚀 Iniciando adição de usuários admin existentes...\n');

  for (const email of adminEmails) {
    try {
      console.log(`📝 Processando: ${email}`);
      
      // Buscar usuário no Authentication
      const userRecord = await admin.auth().getUserByEmail(email);
      console.log(`✅ Usuário encontrado no Auth: ${userRecord.uid}`);

      // Verificar se já existe no Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      
      if (userDoc.exists) {
        console.log(`⚠️  Usuário já existe no Firestore, atualizando...`);
        
        // Atualizar documento existente
        await db.collection('users').doc(userRecord.uid).update({
          role: 'admin',
          isActive: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Documento atualizado no Firestore\n`);
      } else {
        console.log(`📝 Criando novo documento no Firestore...`);
        
        // Criar novo documento
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || email.split('@')[0],
          photoURL: userRecord.photoURL || '',
          role: 'admin',
          isActive: true,
          mfaEnabled: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Documento criado no Firestore\n`);
      }

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error(`❌ Usuário não encontrado no Authentication: ${email}\n`);
      } else {
        console.error(`❌ Erro ao processar ${email}: ${error.message}\n`);
      }
    }
  }

  console.log('🎉 Processo concluído!');
  console.log('\n📋 Resumo:');
  console.log('✅ Usuários admin adicionados/atualizados no Firestore');
  console.log('✅ Role "admin" definido para todos');
  console.log('✅ Status "ativo" configurado');
  console.log('\n🔗 Acesse: https://interbox-app-8d400.web.app/login');
}

// Executar se chamado diretamente
if (require.main === module) {
  addExistingAdmins()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no script:', error);
      process.exit(1);
    });
}

module.exports = { addExistingAdmins }; 