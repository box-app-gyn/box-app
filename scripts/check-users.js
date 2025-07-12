const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUsers() {
  try {
    console.log('🔍 Verificando documentos dos usuários...\n');
    
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado na coleção "users"');
      return;
    }
    
    console.log(`✅ Encontrados ${usersSnapshot.size} usuário(s)\n`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`👤 Usuário: ${userData.displayName || 'Sem nome'} (${userData.email})`);
      console.log(`   UID: ${userData.uid}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Ativo: ${userData.isActive}`);
      console.log(`   Cidade: ${userData.cidade || 'Não informada'}`);
      console.log(`   Box: ${userData.box || 'Não informado'}`);
      console.log(`   WhatsApp: ${userData.whatsapp || 'Não informado'}`);
      
      // Verificar gamificação
      if (userData.gamification) {
        console.log(`   🎯 Gamificação:`);
        console.log(`      Pontos: ${userData.gamification.points}`);
        console.log(`      Nível: ${userData.gamification.level}`);
        console.log(`      Conquistas: ${userData.gamification.achievements?.length || 0}`);
        console.log(`      Código de Referência: ${userData.gamification.referralCode}`);
      } else {
        console.log(`   ❌ Gamificação não encontrada`);
      }
      
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  }
}

checkUsers().then(() => {
  console.log('\n✅ Verificação concluída!');
  process.exit(0);
}); 