#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar se o arquivo de credenciais existe
const credentialsPath = path.join(__dirname, 'firebase-admin-key.json');

if (!fs.existsSync(credentialsPath)) {
  console.error('❌ Arquivo de credenciais não encontrado!');
  console.log('\n📋 Para obter as credenciais:');
  console.log('1. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/settings/serviceaccounts/adminsdk');
  console.log('2. Clique em "Gerar nova chave privada"');
  console.log('3. Baixe o arquivo JSON');
  console.log('4. Renomeie para "firebase-admin-key.json"');
  console.log('5. Coloque na pasta "scripts/"');
  console.log('\n⚠️  IMPORTANTE: Nunca compartilhe esse arquivo!');
  process.exit(1);
}

// Carregar credenciais do arquivo JSON
const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'interbox-app-8d400'
});

const db = admin.firestore();

async function resetGamification() {
  try {
    console.log('🔄 Iniciando reset da gamificação...\n');
    
    // Buscar todos os usuários
    console.log('📋 Buscando usuários...');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }
    
    console.log(`✅ Encontrados ${usersSnapshot.size} usuários`);
    
    // Dados padrão de gamificação
    const defaultGamification = {
      points: 0,
      level: 1,
      experience: 0,
      achievements: [],
      rewards: [],
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      totalActions: 0,
      streak: 0,
      lastStreakDate: null,
      rank: 'Novato',
      badges: [],
      challenges: [],
      leaderboardPosition: null,
      weeklyPoints: 0,
      monthlyPoints: 0,
      totalPointsEarned: 0,
      gamificationEnabled: true,
      preferences: {
        notifications: true,
        sound: true,
        animations: true
      }
    };
    
    let updatedCount = 0;
    let errorCount = 0;
    
    console.log('\n🔄 Atualizando usuários...');
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Verificar se o usuário tem dados de gamificação
        if (userData.gamification) {
          console.log(`   🔄 Resetando gamificação para: ${userData.email || userId}`);
          
          await db.collection('users').doc(userId).update({
            gamification: defaultGamification,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          updatedCount++;
        } else {
          console.log(`   ⏭️  Usuário sem gamificação: ${userData.email || userId}`);
        }
        
      } catch (error) {
        console.error(`   ❌ Erro ao atualizar usuário ${userDoc.id}:`, error.message);
        errorCount++;
      }
    }
    
    // Resetar leaderboard global
    console.log('\n📊 Resetando leaderboard global...');
    try {
      await db.collection('gamification_leaderboard').doc('global').set({
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        topUsers: [],
        totalUsers: 0,
        season: 1,
        seasonStartDate: admin.firestore.FieldValue.serverTimestamp(),
        seasonEndDate: null
      });
      console.log('   ✅ Leaderboard global resetado');
    } catch (error) {
      console.error('   ❌ Erro ao resetar leaderboard:', error.message);
    }
    
    // Resetar estatísticas
    console.log('\n📈 Resetando estatísticas...');
    try {
      await db.collection('gamification_stats').doc('global').set({
        totalPointsDistributed: 0,
        totalAchievementsUnlocked: 0,
        totalRewardsClaimed: 0,
        activeUsers: 0,
        lastReset: admin.firestore.FieldValue.serverTimestamp(),
        dailyStats: {},
        weeklyStats: {},
        monthlyStats: {}
      });
      console.log('   ✅ Estatísticas resetadas');
    } catch (error) {
      console.error('   ❌ Erro ao resetar estatísticas:', error.message);
    }
    
    // Resumo final
    console.log('\n🎉 RESET CONCLUÍDO!');
    console.log('─'.repeat(50));
    console.log(`📊 Resumo:`);
    console.log(`   - Usuários processados: ${usersSnapshot.size}`);
    console.log(`   - Usuários atualizados: ${updatedCount}`);
    console.log(`   - Erros: ${errorCount}`);
    console.log(`   - Leaderboard: Resetado`);
    console.log(`   - Estatísticas: Resetadas`);
    
    if (errorCount === 0) {
      console.log('\n✅ SUCESSO! Todos os dados de gamificação foram zerados!');
      console.log('🚀 O sistema está pronto para iniciar a nova temporada!');
    } else {
      console.log(`\n⚠️  ATENÇÃO: ${errorCount} usuários não puderam ser atualizados`);
      console.log('💡 Verifique os logs acima para mais detalhes');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    process.exit(0);
  }
}

// Executar reset
resetGamification(); 