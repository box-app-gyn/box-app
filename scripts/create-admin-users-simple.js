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

// Dados dos usuários admin
const adminUsers = [
  {
    email: 'gopersonal82@gmail.com',
    password: 'Interbox2025!GS',
    displayName: 'Guilherme Souza',
    role: 'admin'
  },
  {
    email: 'melloribeiro.lara@gmail.com', 
    password: 'Interbox2025!LR',
    displayName: 'Lara Ribeiro',
    role: 'marketing'
  },
  {
    email: 'nettoaeb1@gmail.com',
    password: 'Interbox2025!NM', 
    displayName: 'Mello',
    role: 'admin'
  },
  {
    email: 'avanticrossfit@gmail.com',
    password: 'Interbox2025!RB',
    displayName: 'Rodrigo Bittencourt',
    role: 'admin'
  }
];

async function createAdminUsers() {
  console.log('🚀 Iniciando criação de usuários admin...\n');

  for (const userData of adminUsers) {
    try {
      console.log(`📝 Criando usuário: ${userData.displayName} (${userData.email})`);
      
      // Criar usuário no Authentication
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: true
      });

      console.log(`✅ Usuário criado no Auth: ${userRecord.uid}`);

      // Criar documento no Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        isActive: true,
        mfaEnabled: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Documento criado no Firestore`);
      console.log(`🔑 Credenciais: ${userData.email} / ${userData.password}\n`);

    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  Usuário já existe: ${userData.email}`);
        
        // Atualizar documento no Firestore se necessário
        try {
          const userRecord = await admin.auth().getUserByEmail(userData.email);
          await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role,
            isActive: true,
            mfaEnabled: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
          
          console.log(`✅ Documento atualizado no Firestore\n`);
        } catch (updateError) {
          console.error(`❌ Erro ao atualizar documento: ${updateError.message}\n`);
        }
      } else {
        console.error(`❌ Erro ao criar usuário ${userData.email}: ${error.message}\n`);
      }
    }
  }

  console.log('🎉 Processo concluído!');
  console.log('\n📋 Resumo das credenciais:');
  adminUsers.forEach(user => {
    console.log(`   ${user.displayName}: ${user.email} / ${user.password}`);
  });
  console.log('\n🔗 Acesse: https://interbox-app-8d400.web.app/login');
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUsers()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no script:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUsers }; 