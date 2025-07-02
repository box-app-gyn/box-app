const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('../vertex-ai-sa-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'cerrado-interbox'
});

const db = admin.firestore();

async function verifyGamificationData() {
  try {
    console.log('🔍 Verificando dados de gamificação...\n');
    
    // Verificar recompensas
    console.log('📦 Verificando recompensas...');
    const rewardsSnapshot = await db.collection('gamification_rewards').get();
    console.log(`   ✅ Encontradas ${rewardsSnapshot.size} recompensas:`);
    rewardsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`      - ${doc.id}: ${data.title}`);
    });
    
    // Verificar conquistas
    console.log('\n🏆 Verificando conquistas...');
    const achievementsSnapshot = await db.collection('gamification_achievements').get();
    console.log(`   ✅ Encontradas ${achievementsSnapshot.size} conquistas:`);
    achievementsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`      - ${doc.id}: ${data.title} ${data.icon}`);
    });
    
    // Verificar destaques da comunidade
    console.log('\n🌟 Verificando destaques da comunidade...');
    const highlightsSnapshot = await db.collection('gamification_community_highlights').get();
    console.log(`   ✅ Encontrados ${highlightsSnapshot.size} destaques:`);
    highlightsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`      - ${doc.id}: ${data.title}`);
    });
    
    // Verificar estrutura de um documento de exemplo
    console.log('\n📋 Verificando estrutura de documentos...');
    const sampleReward = rewardsSnapshot.docs[0];
    if (sampleReward) {
      const data = sampleReward.data();
      console.log(`   ✅ Estrutura da recompensa "${data.title}":`);
      console.log(`      - Campos: ${Object.keys(data).join(', ')}`);
      console.log(`      - Tipo: ${data.type}`);
      console.log(`      - Pontos necessários: ${data.requiredPoints}`);
      console.log(`      - Ativo: ${data.isActive}`);
    }
    
    // Resumo final
    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log(`📊 Resumo:`);
    console.log(`   - Recompensas: ${rewardsSnapshot.size}/4`);
    console.log(`   - Conquistas: ${achievementsSnapshot.size}/8`);
    console.log(`   - Destaques: ${highlightsSnapshot.size}/1`);
    
    const totalExpected = 4 + 8 + 1;
    const totalFound = rewardsSnapshot.size + achievementsSnapshot.size + highlightsSnapshot.size;
    
    if (totalFound === totalExpected) {
      console.log(`\n✅ SUCESSO! Todos os ${totalExpected} documentos foram importados corretamente!`);
      console.log('🚀 A gamificação está pronta para funcionar!');
    } else {
      console.log(`\n⚠️  ATENÇÃO: Faltam ${totalExpected - totalFound} documentos`);
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    
    if (error.code === 7) {
      console.log('\n💡 Dica: O service account pode não ter permissões de leitura.');
      console.log('   Você pode verificar manualmente no Firebase Console:');
      console.log('   - Firestore Database > gamification_rewards');
      console.log('   - Firestore Database > gamification_achievements');
      console.log('   - Firestore Database > gamification_community_highlights');
    }
  } finally {
    process.exit(0);
  }
}

verifyGamificationData(); 