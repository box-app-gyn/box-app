const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function testFirestore() {
  console.log('🧪 Testando conexão com Firestore...\n');

  try {
    // Teste 1: Tentar ler uma coleção
    console.log('📖 Tentando ler coleção "users"...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`✅ Sucesso! Encontrados ${usersSnapshot.size} documentos na coleção users`);
    
    // Mostrar documentos existentes
    usersSnapshot.forEach(doc => {
      console.log(`📄 Documento: ${doc.id}`, doc.data());
    });

  } catch (error) {
    console.error('❌ Erro ao conectar com Firestore:', error.message);
    console.error('🔍 Código do erro:', error.code);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 SUGESTÃO: Verifique as regras de segurança do Firestore');
      console.log('   Vá para Firebase Console → Firestore → Rules');
      console.log('   Temporariamente, use regras de teste:');
      console.log('   rules_version = "2";');
      console.log('   service cloud.firestore {');
      console.log('     match /databases/{database}/documents {');
      console.log('       match /{document=**} {');
      console.log('         allow read, write: if true;');
      console.log('       }');
      console.log('     }');
      console.log('   }');
    }
  }
}

// Executar o teste
testFirestore().catch(console.error); 