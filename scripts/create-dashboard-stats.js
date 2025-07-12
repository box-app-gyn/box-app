#!/usr/bin/env node

const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../vertex-ai-sa-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'cerrado-interbox'
});

const db = admin.firestore();

async function createDashboardStats() {
  try {
    console.log('📊 Criando documento config/dashboard_stats...');

    const dashboardStats = {
      // 📈 ESTATÍSTICAS GERAIS
      totalUsers: 0,
      totalTeams: 0,
      totalAudiovisual: 0,
      totalOrders: 0,
      totalRevenue: 0,
      
      // 🎯 GAMIFICAÇÃO
      gamification: {
        totalPoints: 0,
        totalActions: 0,
        totalAchievements: 0,
        totalRewards: 0,
        activeUsers: 0,
        averageLevel: 'iniciante',
        topLevel: 'iniciante',
        levelDistribution: {
          iniciante: 0,
          bronze: 0,
          prata: 0,
          ouro: 0,
          platina: 0,
          diamante: 0
        }
      },
      
      // 🏆 TIMES E COMPETIÇÃO
      teams: {
        total: 0,
        complete: 0,
        incomplete: 0,
        confirmed: 0,
        byCategory: {
          'Iniciante': 0,
          'Scale': 0,
          'Amador': 0,
          'Master 145+': 0,
          'RX': 0
        },
        byLote: {
          'pre_venda': 0,
          'primeiro': 0,
          'segundo': 0,
          'terceiro': 0,
          'quarto': 0,
          'quinto': 0
        }
      },
      
      // 📸 AUDIOVISUAL
      audiovisual: {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        byType: {
          fotografo: 0,
          videomaker: 0,
          editor: 0,
          drone: 0,
          audio: 0,
          iluminacao: 0
        }
      },
      
      // 💰 FINANCEIRO
      financial: {
        totalRevenue: 0,
        revenueByLote: {
          'pre_venda': 0,
          'primeiro': 0,
          'segundo': 0,
          'terceiro': 0,
          'quarto': 0,
          'quinto': 0
        },
        revenueByCategory: {
          'Iniciante': 0,
          'Scale': 0,
          'Amador': 0,
          'Master 145+': 0,
          'RX': 0
        },
        revenueByGateway: {
          pix: 0,
          cartao: 0,
          cripto: 0
        },
        averageTicket: 0,
        upsellsSold: {
          camiseta_extra: 0,
          kit_premium: 0,
          acesso_vip: 0,
          foto_profissional: 0,
          video_highlights: 0,
          recovery: 0
        }
      },
      
      // 📊 USUÁRIOS
      users: {
        total: 0,
        active: 0,
        byRole: {
          atleta: 0,
          audiovisual: 0,
          publico: 0,
          marketing: 0,
          parceiro: 0,
          judge: 0,
          espectador: 0,
          midia: 0,
          admin: 0
        },
        byCategory: {
          'Iniciante': 0,
          'Scale': 0,
          'Amador': 0,
          'Master 145+': 0,
          'RX': 0
        }
      },
      
      // 🎯 METAS E OBJETIVOS
      goals: {
        targetTeams: 100,
        targetRevenue: 50000,
        targetUsers: 500,
        targetAudiovisual: 20,
        currentProgress: {
          teams: 0,
          revenue: 0,
          users: 0,
          audiovisual: 0
        }
      },
      
      // 📅 TEMPORAL
      temporal: {
        lastUpdated: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now(),
        dailyStats: {
          newUsers: 0,
          newTeams: 0,
          newOrders: 0,
          revenue: 0
        },
        weeklyStats: {
          newUsers: 0,
          newTeams: 0,
          newOrders: 0,
          revenue: 0
        },
        monthlyStats: {
          newUsers: 0,
          newTeams: 0,
          newOrders: 0,
          revenue: 0
        }
      },
      
      // 🔧 CONFIGURAÇÕES
      settings: {
        autoUpdate: true,
        updateInterval: 300000, // 5 minutos
        lastCalculation: admin.firestore.Timestamp.now(),
        enabled: true
      }
    };

    // Criar documento
    await db.collection('config').doc('dashboard_stats').set(dashboardStats);
    
    console.log('✅ Documento config/dashboard_stats criado com sucesso!');
    console.log('📊 Estrutura criada:');
    console.log('   - Estatísticas gerais');
    console.log('   - Gamificação');
    console.log('   - Times e competição');
    console.log('   - Audiovisual');
    console.log('   - Financeiro');
    console.log('   - Usuários');
    console.log('   - Metas e objetivos');
    console.log('   - Estatísticas temporais');
    console.log('   - Configurações');
    
  } catch (error) {
    console.error('❌ Erro ao criar dashboard_stats:', error);
  } finally {
    process.exit(0);
  }
}

createDashboardStats(); 