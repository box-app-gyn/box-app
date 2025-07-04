const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cerrado-interbox-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

// 🎁 RECOMPENSAS INICIAIS
const initialRewards = [
  {
    id: 'spoiler_workout',
    title: 'Spoiler do Workout',
    description: 'Acesso antecipado ao primeiro workout do evento',
    type: 'spoiler',
    requiredPoints: 50,
    requiredLevel: 'iniciante',
    maxRedemptions: null,
    currentRedemptions: 0,
    isActive: true,
    expiresAt: null,
    metadata: {
      content: 'Workout "Cerrado Spirit" - Prepare-se para o desafio que definirá os verdadeiros guerreiros.',
      instructions: 'O spoiler será enviado por email 24h antes do evento.'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'enquete_categoria',
    title: 'Voto na Categoria',
    description: 'Participe da enquete para definir uma categoria especial',
    type: 'enquete',
    requiredPoints: 100,
    requiredLevel: 'bronze',
    maxRedemptions: null,
    currentRedemptions: 0,
    isActive: true,
    expiresAt: null,
    metadata: {
      content: 'Ajude a definir a próxima categoria do Interbox 2026!',
      externalLink: '/enquete-categoria'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'destaque_perfil',
    title: 'Destaque no Perfil',
    description: 'Seu nome aparecerá em destaque na comunidade por 24h',
    type: 'destaque',
    requiredPoints: 200,
    requiredLevel: 'bronze',
    maxRedemptions: 100,
    currentRedemptions: 0,
    isActive: true,
    expiresAt: null,
    metadata: {
      content: 'Seu perfil será destacado na seção "Comunidade Ativa"',
      instructions: 'O destaque será ativado automaticamente após o resgate.'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'acesso_vip_preview',
    title: 'Acesso VIP Preview',
    description: 'Acesso exclusivo ao preview do evento',
    type: 'acesso_vip',
    requiredPoints: 500,
    requiredLevel: 'prata',
    maxRedemptions: 50,
    currentRedemptions: 0,
    isActive: true,
    expiresAt: null,
    metadata: {
      content: 'Acesso exclusivo ao preview do evento com 48h de antecedência',
      instructions: 'Link exclusivo será enviado por email.'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// 🏆 CONQUISTAS INICIAIS
const initialAchievements = [
  {
    id: 'first_blood',
    title: 'Primeiro Sangue',
    description: 'Primeira ação realizada',
    icon: '🩸',
    requiredActions: [{ action: 'cadastro', count: 1 }],
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'social_butterfly',
    title: 'Borboleta Social',
    description: 'Indicou 5 pessoas para a comunidade',
    icon: '🦋',
    requiredActions: [{ action: 'indicacao_confirmada', count: 5 }],
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'content_creator',
    title: 'Criador de Conteúdo',
    description: 'Enviou 3 conteúdos',
    icon: '📸',
    requiredActions: [{ action: 'envio_conteudo', count: 3 }],
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Comprou ingresso no primeiro lote',
    icon: '🐦',
    requiredActions: [{ action: 'compra_ingresso', count: 1 }],
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'streak_master',
    title: 'Mestre da Sequência',
    description: '7 dias consecutivos de login',
    icon: '🔥',
    requiredPoints: 50,
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'bronze_warrior',
    title: 'Guerreiro Bronze',
    description: 'Atingiu nível Bronze',
    icon: '🥉',
    requiredLevel: 'bronze',
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'silver_champion',
    title: 'Campeão Prata',
    description: 'Atingiu nível Prata',
    icon: '🥈',
    requiredLevel: 'prata',
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'gold_legend',
    title: 'Lenda Dourada',
    description: 'Atingiu nível Ouro',
    icon: '🥇',
    requiredLevel: 'ouro',
    isSecret: false,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// 🔥 DESTAQUES DA COMUNIDADE INICIAIS
const initialHighlights = [
  {
    id: 'welcome_highlight',
    title: 'Bem-vindos ao Interbox 2025!',
    subtitle: 'A comunidade está crescendo',
    type: 'community_event',
    users: [],
    isActive: true,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 dias
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function populateGamification() {
  console.log('🎯 Iniciando população das coleções de gamificação...');

  try {
    // 1. Popular recompensas
    console.log('📦 Populando recompensas...');
    for (const reward of initialRewards) {
      await db.collection('gamification_rewards').doc(reward.id).set(reward);
      console.log(`✅ Recompensa criada: ${reward.title}`);
    }

    // 2. Popular conquistas
    console.log('🏆 Populando conquistas...');
    for (const achievement of initialAchievements) {
      await db.collection('gamification_achievements').doc(achievement.id).set(achievement);
      console.log(`✅ Conquista criada: ${achievement.title}`);
    }

    // 3. Popular destaques da comunidade
    console.log('🔥 Populando destaques da comunidade...');
    for (const highlight of initialHighlights) {
      await db.collection('gamification_community_highlights').doc(highlight.id).set(highlight);
      console.log(`✅ Destaque criado: ${highlight.title}`);
    }

    // 4. Atualizar usuários existentes com dados de gamificação
    console.log('👥 Atualizando usuários existentes...');
    const usersSnapshot = await db.collection('users').get();
    let updatedUsers = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Verificar se já tem dados de gamificação
      if (!userData.gamification) {
        await userDoc.ref.update({
          gamification: {
            points: 10, // Pontos iniciais
            level: 'iniciante',
            totalActions: 1,
            lastActionAt: admin.firestore.FieldValue.serverTimestamp(),
            achievements: ['first_blood'],
            rewards: [],
            streakDays: 1,
            lastLoginStreak: admin.firestore.FieldValue.serverTimestamp(),
            referralCode: `REF${userData.uid.substring(0, 8).toUpperCase()}`,
            referrals: [],
            referralPoints: 0
          }
        });
        updatedUsers++;
        console.log(`✅ Usuário atualizado: ${userData.email || userData.displayName}`);
      }
    }

    console.log(`\n🎉 Gamificação populada com sucesso!`);
    console.log(`📊 Resumo:`);
    console.log(`   - ${initialRewards.length} recompensas criadas`);
    console.log(`   - ${initialAchievements.length} conquistas criadas`);
    console.log(`   - ${initialHighlights.length} destaques criados`);
    console.log(`   - ${updatedUsers} usuários atualizados`);

  } catch (error) {
    console.error('❌ Erro ao popular gamificação:', error);
  } finally {
    process.exit(0);
  }
}

// Executar script
populateGamification(); 