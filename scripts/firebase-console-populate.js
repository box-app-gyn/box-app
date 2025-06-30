// Script para executar no console do Firebase
// Acesse: https://console.firebase.google.com/project/interbox-app-8d400/firestore/data
// Vá em "Regras" e clique em "Console" para abrir o console JavaScript

console.log('🚀 Populando coleções do Firestore com dados do evento Cerrado...');

// Função para criar timestamp
function createTimestamp() {
  return firebase.firestore.Timestamp.now();
}

// Dados realistas para o evento Cerrado
const sampleData = {
  users: {
    'admin-cerrado': {
      email: 'admin@cerrado.com',
      displayName: 'Admin Cerrado',
      role: 'admin',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-joao': {
      email: 'joao.silva@email.com',
      displayName: 'João Silva',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-maria': {
      email: 'maria.santos@email.com',
      displayName: 'Maria Santos',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-pedro': {
      email: 'pedro.costa@email.com',
      displayName: 'Pedro Costa',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-ana': {
      email: 'ana.oliveira@email.com',
      displayName: 'Ana Oliveira',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'atleta-carlos': {
      email: 'carlos.rodrigues@email.com',
      displayName: 'Carlos Rodrigues',
      role: 'atleta',
      isActive: true,
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  teams: {
    'team-cerrado-1': {
      nome: 'Cerrado Warriors',
      captainId: 'atleta-joao',
      atletas: ['atleta-joao', 'atleta-maria', 'atleta-pedro'],
      status: 'complete',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'team-cerrado-2': {
      nome: 'Cerrado Legends',
      captainId: 'atleta-ana',
      atletas: ['atleta-ana', 'atleta-carlos'],
      status: 'incomplete',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  audiovisual: {
    'fotografo-rafael': {
      userId: 'admin-cerrado',
      userEmail: 'rafael.fotografo@cerrado.com',
      nome: 'Rafael Silva',
      telefone: '+5511999999999',
      tipo: 'fotografo',
      portfolio: {
        urls: ['https://example.com/portfolio1.jpg', 'https://example.com/portfolio2.jpg'],
        descricao: 'Fotógrafo especializado em eventos esportivos com 8 anos de experiência',
        experiencia: '8 anos',
        equipamentos: ['Canon EOS R5', 'Canon RF 24-70mm f/2.8', 'Canon RF 70-200mm f/2.8'],
        especialidades: ['Fotografia Esportiva', 'Eventos', 'Retratos']
      },
      termosAceitos: true,
      termosAceitosEm: createTimestamp(),
      status: 'approved',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'videomaker-julia': {
      userId: 'admin-cerrado',
      userEmail: 'julia.video@cerrado.com',
      nome: 'Julia Mendes',
      telefone: '+5511888888888',
      tipo: 'videomaker',
      portfolio: {
        urls: ['https://example.com/video1.mp4', 'https://example.com/video2.mp4'],
        descricao: 'Videomaker profissional com foco em eventos esportivos e documentários',
        experiencia: '6 anos',
        equipamentos: ['Sony FX3', 'DJI RS 3 Pro', 'Canon RF 15-35mm f/2.8'],
        especialidades: ['Videografia Esportiva', 'Documentários', 'Eventos']
      },
      termosAceitos: true,
      termosAceitosEm: createTimestamp(),
      status: 'pending',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  pedidos: {
    'pedido-001': {
      userId: 'atleta-joao',
      userEmail: 'joao.silva@email.com',
      userName: 'João Silva',
      tipo: 'ingresso',
      quantidade: 1,
      valorUnitario: 150.00,
      valorTotal: 150.00,
      status: 'paid',
      paymentId: 'flowpay_123456',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'pedido-002': {
      userId: 'atleta-maria',
      userEmail: 'maria.santos@email.com',
      userName: 'Maria Santos',
      tipo: 'ingresso',
      quantidade: 2,
      valorUnitario: 150.00,
      valorTotal: 300.00,
      status: 'pending',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    },
    'pedido-003': {
      userId: 'atleta-pedro',
      userEmail: 'pedro.costa@email.com',
      userName: 'Pedro Costa',
      tipo: 'ingresso',
      quantidade: 1,
      valorUnitario: 150.00,
      valorTotal: 150.00,
      status: 'cancelled',
      createdAt: createTimestamp(),
      updatedAt: createTimestamp()
    }
  },
  adminLogs: {
    'log-001': {
      adminId: 'admin-cerrado',
      adminEmail: 'admin@cerrado.com',
      acao: 'criacao_pedido',
      targetId: 'pedido-001',
      targetType: 'pedido',
      detalhes: { message: 'Pedido criado automaticamente pelo sistema' },
      createdAt: createTimestamp()
    },
    'log-002': {
      adminId: 'admin-cerrado',
      adminEmail: 'admin@cerrado.com',
      acao: 'aprovacao_fotografo',
      targetId: 'fotografo-rafael',
      targetType: 'audiovisual',
      detalhes: { message: 'Fotógrafo aprovado para o evento' },
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
  
  console.log('\n🎉 Coleções populadas com sucesso!');
  console.log('\n📊 Resumo das coleções:');
  console.log('  - users: 6 documentos (1 admin + 5 atletas)');
  console.log('  - teams: 2 documentos (1 completo + 1 incompleto)');
  console.log('  - audiovisual: 2 documentos (1 fotógrafo + 1 videomaker)');
  console.log('  - pedidos: 3 documentos (1 pago + 1 pendente + 1 cancelado)');
  console.log('  - adminLogs: 2 documentos (logs de ações)');
}

// Executar
createCollections(); 