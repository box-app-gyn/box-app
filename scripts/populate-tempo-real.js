const admin = require('firebase-admin');

// Inicializa usando as credenciais do Firebase CLI (sem serviceAccount)
admin.initializeApp();

const db = admin.firestore();

async function populateTempoReal() {
  try {
    console.log('🚀 Populando dados em tempo real...');

    // Dados iniciais para o componente TempoReal
    const tempoRealData = {
      ingressos: {
        status: 'em_breve', // 'em_breve' | 'disponivel' | 'esgotado'
        dataAbertura: '2025-07-13T00:00:00-03:00',
        loteAtual: 1,
        vagasRestantes: 120
      },
      indicacoes: {
        total: 0,
        hoje: 0
      },
      fotografos: {
        total: 0,
        aprovados: 0
      },
      xp: {
        total: 0,
        media: 0
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Criar documento na coleção 'config'
    await db.collection('config').doc('tempo_real').set(tempoRealData);

    console.log('✅ Dados em tempo real populados com sucesso!');
    console.log('📊 Dados criados:', JSON.stringify(tempoRealData, null, 2));

    // Criar também dados de gamificação se não existirem
    const gamificationData = {
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      topUsers: [],
      recentActivities: [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('config').doc('gamification_stats').set(gamificationData, { merge: true });
    console.log('✅ Estatísticas de gamificação criadas!');

  } catch (error) {
    console.error('❌ Erro ao popular dados em tempo real:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o script
populateTempoReal(); 