// Carregar variáveis de ambiente
require('dotenv').config();

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Configuração do Firebase Admin
const serviceAccount = {
  "type": "service_account",
  "project_id": "interbox-app-8d400",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
};

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
    role: 'admin'
  },
  {
    email: 'nettoaeb1@gmail.com',
    password: 'Interbox2025!NM', 
    displayName: 'Mello',
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