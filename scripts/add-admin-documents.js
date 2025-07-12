const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBu4_B3-_MrnrPz-xBDi9-0j6bzK8kE2w",
  authDomain: "interbox-app.firebaseapp.com",
  projectId: "interbox-app",
  storageBucket: "interbox-app.firebasestorage.app",
  messagingSenderId: "1050684826861",
  appId: "1:1050684826861:web:65d236440ebb1f3d2fd8e4",
  measurementId: "G-LGZQQ90SQ2"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dados dos admins (você precisa me passar os UIDs dos usuários criados)
const adminUsers = [
  {
    email: 'gopersonal82@gmail.com',
    displayName: 'Guilherme Souza',
    role: 'admin'
  },
  {
    email: 'melloribeiro.lara@gmail.com',
    displayName: 'Lara Ribeiro',
    role: 'admin'
  },
  {
    email: 'nettoaeb1@gmail.com',
    displayName: 'Mello',
    role: 'admin'
  }
];

async function addAdminDocuments() {
  console.log('🚀 Adicionando documentos admin no Firestore...\n');

  for (const userData of adminUsers) {
    try {
      console.log(`📧 Processando: ${userData.email}`);
      
      // Primeiro, vamos buscar o UID do usuário pelo email
      // Como não temos acesso direto ao Auth, vamos criar um documento temporário
      // e você pode me passar os UIDs depois
      
      const tempDocId = `temp-${Date.now()}-${userData.email.replace('@', '-').replace('.', '-')}`;
      
      const adminDocument = {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        tempDoc: true // Marca como documento temporário
      };

      await setDoc(doc(db, 'users', tempDocId), adminDocument);
      
      console.log(`✅ Documento temporário criado com ID: ${tempDocId}`);
      console.log(`📧 Email: ${userData.email}`);
      console.log(`👤 Nome: ${userData.displayName}`);
      console.log(`⚡ Role: ${userData.role}`);
      console.log('─'.repeat(50));

    } catch (error) {
      console.error(`❌ Erro ao criar documento para ${userData.email}:`, error.message);
    }
  }

  console.log('\n🎉 Processo concluído!');
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('─'.repeat(50));
  console.log('1. Acesse o Firebase Console');
  console.log('2. Vá para Authentication → Users');
  console.log('3. Copie os UIDs dos usuários criados');
  console.log('4. Me passe os UIDs para eu atualizar os documentos');
  console.log('5. Ou atualize manualmente no Firestore');
}

// Executar o script
addAdminDocuments().catch(console.error); 