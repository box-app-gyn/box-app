const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function verifyGamificationWithCLI() {
  try {
    console.log('🔍 Verificando dados de gamificação via Firebase CLI...\n');
    
    // Verificar se está logado no Firebase
    console.log('📋 Verificando login do Firebase...');
    try {
      await execAsync('firebase projects:list');
      console.log('✅ Firebase CLI logado');
    } catch (error) {
      console.log('❌ Firebase CLI não logado. Execute: firebase login');
      return;
    }
    
    // Verificar recompensas
    console.log('\n📦 Verificando recompensas...');
    try {
      const { stdout: rewardsOutput } = await execAsync(
        'firebase firestore:get gamification_rewards --project cerrado-interbox'
      );
      console.log('✅ Recompensas encontradas');
      console.log(rewardsOutput);
    } catch (error) {
      console.log('❌ Erro ao verificar recompensas:', error.message);
    }
    
    // Verificar conquistas
    console.log('\n🏆 Verificando conquistas...');
    try {
      const { stdout: achievementsOutput } = await execAsync(
        'firebase firestore:get gamification_achievements --project cerrado-interbox'
      );
      console.log('✅ Conquistas encontradas');
      console.log(achievementsOutput);
    } catch (error) {
      console.log('❌ Erro ao verificar conquistas:', error.message);
    }
    
    // Verificar destaques
    console.log('\n🌟 Verificando destaques...');
    try {
      const { stdout: highlightsOutput } = await execAsync(
        'firebase firestore:get gamification_community_highlights --project cerrado-interbox'
      );
      console.log('✅ Destaques encontrados');
      console.log(highlightsOutput);
    } catch (error) {
      console.log('❌ Erro ao verificar destaques:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

verifyGamificationWithCLI(); 