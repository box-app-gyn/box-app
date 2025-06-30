const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'interbox-app-8d400'
  });
}

const db = admin.firestore();

// Dados de exemplo para inicializar as coleções
const sampleData = {
  users: [
    {
      uid: 'admin-example',
      email: 'admin@interbox.com',
      displayName: 'Admin Interbox',
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  teams: [
    {
      id: 'team-example',
      nome: 'Time Exemplo',
      captainId: 'admin-example',
      atletas: ['admin-example'],
      status: 'incomplete',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  fotografos: [
    {
      id: 'fotografo-example',
      userId: 'admin-example',
      userEmail: 'fotografo@interbox.com',
      nome: 'Fotógrafo Exemplo',
      telefone: '+5511999999999',
      tipo: 'fotografo',
      portfolio: {
        urls: ['https://example.com/portfolio1.jpg'],
        descricao: 'Fotógrafo profissional com 5 anos de experiência',
        experiencia: '5 anos',
        equipamentos: ['Canon EOS R5', 'Canon RF 24-70mm f/2.8']
      },
      termosAceitos: true,
      termosAceitosEm: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  pedidos: [
    {
      id: 'pedido-example',
      userId: 'admin-example',
      userEmail: 'admin@interbox.com',
      userName: 'Admin Interbox',
      tipo: 'ingresso',
      quantidade: 1,
      valorUnitario: 150.00,
      valorTotal: 150.00,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  adminLogs: [
    {
      id: 'log-example',
      adminId: 'admin-example',
      adminEmail: 'admin@interbox.com',
      acao: 'criacao_pedido',
      targetId: 'pedido-example',
      targetType: 'pedido',
      detalhes: { message: 'Pedido de exemplo criado' },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

async function initializeFirestore() {
  console.log('🚀 Inicializando coleções do Firestore...');
  
  try {
    // Criar dados de exemplo para cada coleção
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      console.log(`📝 Criando coleção: ${collectionName}`);
      
      for (const docData of documents) {
        const docId = docData.id || docData.uid;
        const docRef = db.collection(collectionName).doc(docId);
        
        // Remover campos id/uid antes de salvar
        const { id, uid, ...dataToSave } = docData;
        
        await docRef.set(dataToSave);
        console.log(`  ✅ Documento criado: ${collectionName}/${docId}`);
      }
    }
    
    console.log('🎉 Firestore inicializado com sucesso!');
    console.log('\n📊 Coleções criadas:');
    console.log('  - users');
    console.log('  - teams');
    console.log('  - fotografos');
    console.log('  - pedidos');
    console.log('  - adminLogs');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firestore:', error);
  } finally {
    process.exit(0);
  }
}

// Executar inicialização
initializeFirestore(); 