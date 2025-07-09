const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cerrado-interbox-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();

async function checkGamificationPermissions() {
  console.log('🔐 Verificando permissões para gamificação...\n');

  try {
    // 1. Verificar se as coleções existem
    console.log('📋 Verificando coleções de gamificação...');
    
    const collections = [
      'gamification_actions',
      'gamification_leaderboard', 
      'gamification_rewards',
      'gamification_user_rewards',
      'gamification_achievements',
      'gamification_community_highlights'
    ];

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(1).get();
        console.log(`✅ ${collectionName}: ${snapshot.size} documentos`);
      } catch (error) {
        console.log(`❌ ${collectionName}: Erro de acesso - ${error.message}`);
      }
    }

    // 2. Verificar usuários com dados de gamificação
    console.log('\n👥 Verificando usuários com gamificação...');
    const usersSnapshot = await db.collection('users').limit(5).get();
    let usersWithGamification = 0;
    let totalUsers = 0;

    usersSnapshot.forEach(doc => {
      totalUsers++;
      const userData = doc.data();
      if (userData.gamification) {
        usersWithGamification++;
        console.log(`✅ Usuário ${userData.email || userData.displayName}: ${userData.gamification.points} $BOX (${userData.gamification.level})`);
      }
    });

    console.log(`\n📊 Resumo: ${usersWithGamification}/${totalUsers} usuários com gamificação`);

    // 3. Testar criação de documento de gamificação
    console.log('\n🧪 Testando criação de documento de gamificação...');
    
    const testUserId = 'test-gamification-user';
    const testActionData = {
      userId: testUserId,
      userEmail: 'test@example.com',
      userName: 'Test User',
      action: 'cadastro',
      points: 10,
      description: 'Teste de gamificação',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      processed: true,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    try {
      await db.collection('gamification_actions').add(testActionData);
      console.log('✅ Criação de ação de gamificação: SUCESSO');
      
      // Limpar documento de teste
      const testDocs = await db.collection('gamification_actions')
        .where('userId', '==', testUserId)
        .get();
      
      testDocs.forEach(doc => doc.ref.delete());
      console.log('🧹 Documento de teste removido');
      
    } catch (error) {
      console.log(`❌ Criação de ação de gamificação: FALHA - ${error.message}`);
    }

    // 4. Verificar regras do Firestore
    console.log('\n📜 Verificando regras do Firestore...');
    console.log('ℹ️  As regras foram atualizadas no arquivo firestore.rules');
    console.log('ℹ️  Execute: firebase deploy --only firestore:rules');

    // 5. Verificar Cloud Functions
    console.log('\n⚡ Verificando Cloud Functions...');
    console.log('ℹ️  As Cloud Functions foram atualizadas para incluir gamificação');
    console.log('ℹ️  Execute: firebase deploy --only functions');

    // 6. Recomendações
    console.log('\n🎯 RECOMENDAÇÕES:');
    console.log('1. Deploy das regras do Firestore: firebase deploy --only firestore:rules');
    console.log('2. Deploy das Cloud Functions: firebase deploy --only functions');
    console.log('3. Executar script de população: node scripts/populate-gamification.js');
    console.log('4. Testar gamificação com usuário real');

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  } finally {
    process.exit(0);
  }
}

// Executar verificação
checkGamificationPermissions(); 