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

async function importGamificationData() {
  try {
    console.log('🚀 Iniciando importação dos dados de gamificação...');
    
    // Ler arquivo JSON
    const jsonPath = path.join(__dirname, '../gamification-import.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Importar recompensas
    console.log('📦 Importando recompensas...');
    for (const [docId, rewardData] of Object.entries(data.gamification_rewards)) {
      // Converter timestamps
      const processedData = {
        ...rewardData,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(rewardData.createdAt.value)),
        updatedAt: admin.firestore.Timestamp.fromDate(new Date(rewardData.updatedAt.value))
      };
      
      await db.collection('gamification_rewards').doc(docId).set(processedData);
      console.log(`✅ Recompensa "${rewardData.title}" importada`);
    }
    
    // Importar conquistas
    console.log('🏆 Importando conquistas...');
    for (const [docId, achievementData] of Object.entries(data.gamification_achievements)) {
      const processedData = {
        ...achievementData,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(achievementData.createdAt.value))
      };
      
      await db.collection('gamification_achievements').doc(docId).set(processedData);
      console.log(`✅ Conquista "${achievementData.title}" importada`);
    }
    
    // Importar destaques da comunidade
    console.log('🌟 Importando destaques da comunidade...');
    for (const [docId, highlightData] of Object.entries(data.gamification_community_highlights)) {
      const processedData = {
        ...highlightData,
        expiresAt: admin.firestore.Timestamp.fromDate(new Date(highlightData.expiresAt.value)),
        createdAt: admin.firestore.Timestamp.fromDate(new Date(highlightData.createdAt.value))
      };
      
      await db.collection('gamification_community_highlights').doc(docId).set(processedData);
      console.log(`✅ Destaque "${highlightData.title}" importado`);
    }
    
    console.log('🎉 Importação concluída com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   - ${Object.keys(data.gamification_rewards).length} recompensas`);
    console.log(`   - ${Object.keys(data.gamification_achievements).length} conquistas`);
    console.log(`   - ${Object.keys(data.gamification_community_highlights).length} destaques`);
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  } finally {
    process.exit(0);
  }
}

importGamificationData(); 