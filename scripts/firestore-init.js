// Script para executar no console do Firebase
// Acesse: https://console.firebase.google.com/project/interbox-app-8d400/firestore/data
// Vá em "Regras" e clique em "Console" para abrir o console JavaScript

console.log('🚀 Inicializando coleções do Firestore...');

// Função para criar timestamp
function createTimestamp() {
  return firebase.firestore.Timestamp.now();
}

// Dados de exemplo
const sampleData = {
  users: {
    'admin-example': {
      email: 'admin@interbox.com',
      displayName: 'Admin Interbox',
      role: 'admin',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-1': {
      email: 'atleta1@interbox.com',
      displayName: 'João Silva',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-2': {
      email: 'atleta2@interbox.com',
      displayName: 'Maria Santos',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-3': {
      email: 'atleta3@interbox.com',
      displayName: 'Pedro Costa',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-4': {
      email: 'atleta4@interbox.com',
      displayName: 'Ana Oliveira',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  teams: {
    'team-example': {
      nome: 'Time Exemplo',
      captainId: 'atleta-1',
      atletas: ['atleta-1', 'atleta-2', 'atleta-3', 'atleta-4'],
      status: 'incomplete',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  audiovisual: {
    'audiovisual-example': {
      userId: 'admin-example',
      userEmail: 'audiovisual@interbox.com',
      nome: 'Profissional Audiovisual Exemplo',
      telefone: '+5511999999999',
      tipo: 'fotografo',
      portfolio: {
        urls: ['https://example.com/portfolio1.jpg'],
        descricao: 'Profissional audiovisual com 5 anos de experiência',
        experiencia: '5 anos',
        equipamentos: ['Canon EOS R5', 'Canon RF 24-70mm f/2.8'],
        especialidades: ['Fotografia Esportiva', 'Videografia']
      },
      termosAceitos: true,
      termosAceitosEm: createTimestamp(),
      status: 'pending',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  pedidos: {
    'pedido-example': {
      userId: 'admin-example',
      userEmail: 'admin@interbox.com',
      userName: 'Admin Interbox',
      tipo: 'ingresso',
      quantidade: 1,
      valorUnitario: 150.00,
      valorTotal: 150.00,
      status: 'pending',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  adminLogs: {
    'log-example': {
      adminId: 'admin-example',
      adminEmail: 'admin@interbox.com',
      acao: 'criacao_pedido',
      targetId: 'pedido-example',
      targetType: 'pedido',
      detalhes: { message: 'Pedido de exemplo criado' },
      createdAt: createTimestamp()
    }
  }
};

// Função para criar coleções
async function createCollections() {
  const db = firebase.firestore();
  
  for (const [collectionName, documents] of Object.entries(sampleData)) {
    console.log(`📝 Criando coleção: ${collectionName}`);
    
    for (const [docId, docData] of Object.entries(documents)) {
      try {
        await db.collection(collectionName).doc(docId).set(docData);
        console.log(`  ✅ Documento criado: ${collectionName}/${docId}`);
      } catch (error) {
        console.error(`  ❌ Erro ao criar ${collectionName}/${docId}:`, error);
      }
    }
  }
  
  console.log('🎉 Coleções criadas com sucesso!');
  console.log('\n📊 Coleções criadas:');
  console.log('  - users (5 documentos)');
  console.log('  - teams (1 documento)');
  console.log('  - audiovisual (1 documento)');
  console.log('  - pedidos (1 documento)');
  console.log('  - adminLogs (1 documento)');
}

// Executar
createCollections(); 