const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Inicializar Firebase Admin com variáveis de ambiente
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    }),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
  });
}

const db = admin.firestore();

// Dados realistas para o evento Cerrado
const sampleData = {
  users: [
    {
      uid: 'admin-cerrado',
      email: 'admin@cerrado.com',
      displayName: 'Admin Cerrado',
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'atleta-joao',
      email: 'joao.silva@email.com',
      displayName: 'João Silva',
      role: 'atleta',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'atleta-maria',
      email: 'maria.santos@email.com',
      displayName: 'Maria Santos',
      role: 'atleta',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'atleta-pedro',
      email: 'pedro.costa@email.com',
      displayName: 'Pedro Costa',
      role: 'atleta',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'atleta-ana',
      email: 'ana.oliveira@email.com',
      displayName: 'Ana Oliveira',
      role: 'atleta',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'atleta-carlos',
      email: 'carlos.rodrigues@email.com',
      displayName: 'Carlos Rodrigues',
      role: 'atleta',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  teams: [
    {
      id: 'team-cerrado-1',
      nome: 'Cerrado Warriors',
      captainId: 'atleta-joao',
      atletas: ['atleta-joao', 'atleta-maria', 'atleta-pedro'],
      status: 'complete',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'team-cerrado-2',
      nome: 'Cerrado Legends',
      captainId: 'atleta-ana',
      atletas: ['atleta-ana', 'atleta-carlos'],
      status: 'incomplete',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  audiovisual: [
    {
      id: 'fotografo-rafael',
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
      termosAceitosEm: admin.firestore.FieldValue.serverTimestamp(),
      status: 'approved',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'videomaker-julia',
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
      termosAceitosEm: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  pedidos: [
    {
      id: 'pedido-001',
      userId: 'atleta-joao',
      userEmail: 'joao.silva@email.com',
      userName: 'João Silva',
      tipo: 'ingresso',
      quantidade: 1,
      valorUnitario: 150.00,
      valorTotal: 150.00,
      status: 'paid',
      paymentId: 'flowpay_123456',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'pedido-002',
      userId: 'atleta-maria',
      userEmail: 'maria.santos@email.com',
      userName: 'Maria Santos',
      tipo: 'ingresso',
      quantidade: 2,
      valorUnitario: 150.00,
      valorTotal: 300.00,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'pedido-003',
      userId: 'atleta-pedro',
      userEmail: 'pedro.costa@email.com',
      userName: 'Pedro Costa',
      tipo: 'ingresso',
      quantidade: 1,
      valorUnitario: 150.00,
      valorTotal: 150.00,
      status: 'cancelled',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  adminLogs: [
    {
      id: 'log-001',
      adminId: 'admin-cerrado',
      adminEmail: 'admin@cerrado.com',
      acao: 'criacao_pedido',
      targetId: 'pedido-001',
      targetType: 'pedido',
      detalhes: { message: 'Pedido criado automaticamente pelo sistema' },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'log-002',
      adminId: 'admin-cerrado',
      adminEmail: 'admin@cerrado.com',
      acao: 'aprovacao_fotografo',
      targetId: 'fotografo-rafael',
      targetType: 'audiovisual',
      detalhes: { message: 'Fotógrafo aprovado para o evento' },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],
  patrocinadores: [
    {
      id: 'patrocinador-ouro-1',
      nome: 'CrossFit Brasil',
      nomeFantasia: 'CF Brasil',
      categoria: 'Ouro',
      status: 'ativo',
      valorPatrocinio: 50000.00,
      logoUrl: 'https://example.com/logos/crossfit-brasil.png',
      website: 'https://crossfitbrasil.com.br',
      email: 'contato@crossfitbrasil.com.br',
      telefone: '+5511999999999',
      contato: {
        nome: 'João Silva',
        cargo: 'Diretor de Marketing',
        email: 'joao.silva@crossfitbrasil.com.br',
        telefone: '+5511999999999'
      },
      beneficios: {
        descricao: 'Patrocínio Ouro - Máxima exposição',
        itens: [
          'Logo em destaque no evento',
          'Stand exclusivo na arena',
          'Mentions em todas as transmissões',
          'Kit do atleta com marca',
          'Acesso VIP ao evento',
          'Direito de uso das imagens'
        ],
        valorEstimado: 150000.00
      },
      contrato: {
        numero: 'CON-2025-001',
        dataInicio: admin.firestore.FieldValue.serverTimestamp(),
        dataFim: admin.firestore.Timestamp.fromDate(new Date('2025-12-31')),
        valorTotal: 50000.00,
        parcelas: 3,
        valorParcela: 16666.67,
        proximoVencimento: admin.firestore.Timestamp.fromDate(new Date('2025-02-15'))
      },
      pagamentos: [
        {
          parcela: 1,
          valor: 16666.67,
          vencimento: admin.firestore.Timestamp.fromDate(new Date('2025-01-15')),
          status: 'paid',
          pagoEm: admin.firestore.Timestamp.fromDate(new Date('2025-01-10'))
        },
        {
          parcela: 2,
          valor: 16666.67,
          vencimento: admin.firestore.Timestamp.fromDate(new Date('2025-02-15')),
          status: 'pending'
        },
        {
          parcela: 3,
          valor: 16666.66,
          vencimento: admin.firestore.Timestamp.fromDate(new Date('2025-03-15')),
          status: 'pending'
        }
      ],
      observacoes: 'Patrocinador principal do evento',
      criadoPor: 'admin-cerrado',
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      ativadoEm: admin.firestore.FieldValue.serverTimestamp(),
      ativadoPor: 'admin-cerrado'
    },
    {
      id: 'patrocinador-prata-1',
      nome: 'Proteína Brasil Ltda',
      nomeFantasia: 'ProBrasil',
      categoria: 'Prata',
      status: 'ativo',
      valorPatrocinio: 25000.00,
      logoUrl: 'https://example.com/logos/probrasil.png',
      website: 'https://probrasil.com.br',
      email: 'marketing@probrasil.com.br',
      telefone: '+5511888888888',
      contato: {
        nome: 'Maria Santos',
        cargo: 'Gerente de Eventos',
        email: 'maria.santos@probrasil.com.br',
        telefone: '+5511888888888'
      },
      beneficios: {
        descricao: 'Patrocínio Prata - Exposição média',
        itens: [
          'Logo no material do evento',
          'Stand na arena',
          'Mentions nas transmissões',
          'Amostras no kit do atleta'
        ],
        valorEstimado: 75000.00
      },
      contrato: {
        numero: 'CON-2025-002',
        dataInicio: admin.firestore.FieldValue.serverTimestamp(),
        dataFim: admin.firestore.Timestamp.fromDate(new Date('2025-12-31')),
        valorTotal: 25000.00,
        parcelas: 2,
        valorParcela: 12500.00,
        proximoVencimento: admin.firestore.Timestamp.fromDate(new Date('2025-02-01'))
      },
      pagamentos: [
        {
          parcela: 1,
          valor: 12500.00,
          vencimento: admin.firestore.Timestamp.fromDate(new Date('2025-01-01')),
          status: 'paid',
          pagoEm: admin.firestore.Timestamp.fromDate(new Date('2024-12-28'))
        },
        {
          parcela: 2,
          valor: 12500.00,
          vencimento: admin.firestore.Timestamp.fromDate(new Date('2025-02-01')),
          status: 'pending'
        }
      ],
      observacoes: 'Fornecedor oficial de suplementos',
      criadoPor: 'admin-cerrado',
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      ativadoEm: admin.firestore.FieldValue.serverTimestamp(),
      ativadoPor: 'admin-cerrado'
    },
    {
      id: 'patrocinador-bronze-1',
      nome: 'Equipamentos Fitness Ltda',
      nomeFantasia: 'EquipFit',
      categoria: 'Bronze',
      status: 'pendente',
      valorPatrocinio: 10000.00,
      logoUrl: 'https://example.com/logos/equipfit.png',
      website: 'https://equipfit.com.br',
      email: 'comercial@equipfit.com.br',
      telefone: '+5511777777777',
      contato: {
        nome: 'Pedro Costa',
        cargo: 'Diretor Comercial',
        email: 'pedro.costa@equipfit.com.br',
        telefone: '+5511777777777'
      },
      beneficios: {
        descricao: 'Patrocínio Bronze - Exposição básica',
        itens: [
          'Logo no site do evento',
          'Mention nas redes sociais',
          'Banner na arena'
        ],
        valorEstimado: 30000.00
      },
      contrato: {
        dataInicio: admin.firestore.FieldValue.serverTimestamp(),
        dataFim: admin.firestore.Timestamp.fromDate(new Date('2025-12-31')),
        valorTotal: 10000.00,
        parcelas: 1,
        valorParcela: 10000.00,
        proximoVencimento: admin.firestore.Timestamp.fromDate(new Date('2025-01-31'))
      },
      pagamentos: [
        {
          parcela: 1,
          valor: 10000.00,
          vencimento: admin.firestore.Timestamp.fromDate(new Date('2025-01-31')),
          status: 'pending'
        }
      ],
      observacoes: 'Aguardando aprovação da diretoria',
      criadoPor: 'admin-cerrado',
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp()
    }
  ]
};

async function populateCollections() {
  console.log('🚀 Populando coleções do Firestore com dados do evento Cerrado...');
  
  try {
    // Criar dados de exemplo para cada coleção
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      console.log(`📝 Populando coleção: ${collectionName}`);
      
      for (const docData of documents) {
        const docId = docData.id || docData.uid;
        const docRef = db.collection(collectionName).doc(docId);
        
        // Remover campos id/uid antes de salvar
        const { id, uid, ...dataToSave } = docData;
        
        await docRef.set(dataToSave);
        console.log(`  ✅ Documento criado: ${collectionName}/${docId}`);
      }
    }
    
    console.log('\n🎉 Coleções populadas com sucesso!');
    console.log('\n📊 Resumo das coleções:');
    console.log('  - users: 6 documentos (1 admin + 5 atletas)');
    console.log('  - teams: 2 documentos (1 completo + 1 incompleto)');
    console.log('  - audiovisual: 2 documentos (1 fotógrafo + 1 videomaker)');
    console.log('  - pedidos: 3 documentos (1 pago + 1 pendente + 1 cancelado)');
    console.log('  - adminLogs: 2 documentos (logs de ações)');
    console.log('  - patrocinadores: 3 documentos (1 ouro, 1 prata, 1 bronze)');
    
  } catch (error) {
    console.error('❌ Erro ao popular coleções:', error);
    process.exit(1);
  }
}

// Executar população
populateCollections(); 