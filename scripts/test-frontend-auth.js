const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Configuração do Firebase (mesma do frontend)
const firebaseConfig = {
  apiKey: "AIzaSyDdLZo5ZO32WOpxNgqqSQw381cekJPfVBg",
  authDomain: "interbox-app-8d400.firebaseapp.com",
  projectId: "interbox-app-8d400",
  storageBucket: "interbox-app-8d400.firebasestorage.app",
  messagingSenderId: "1087720410628",
  appId: "1:1087720410628:web:cedfd152820e2b28102f51",
  measurementId: "G-56WEKYTCJZ"
};

async function testFrontendAuth() {
  console.log('🧪 Testando autenticação do frontend...');
  console.log('─'.repeat(60));

  try {
    // 1. Inicializar Firebase
    console.log('📋 1. Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado');

    // 2. Inicializar Auth
    console.log('\n📋 2. Inicializando Authentication...');
    const auth = getAuth(app);
    console.log('✅ Authentication inicializado');

    // 3. Testar login
    console.log('\n📋 3. Testando login...');
    const email = 'nettoaeb1@gmail.com';
    const password = 'Interbox2025!NM';
    
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email verificado: ${user.emailVerified}`);
    console.log(`   Último login: ${user.metadata.lastSignInTime}`);

    console.log('\n🎉 TESTE DE AUTENTICAÇÃO PASSOU!');
    console.log('✅ Firebase configurado corretamente');
    console.log('✅ Authentication funcionando');
    console.log('✅ Login funcionando');

  } catch (error) {
    console.error('❌ Erro na autenticação:', error.message);
    console.error('🔍 Código do erro:', error.code);
    
    if (error.code === 'auth/configuration-not-found') {
      console.log('\n💡 SOLUÇÃO PARA auth/configuration-not-found:');
      console.log('1. Verifique se o Authentication está habilitado no Firebase Console');
      console.log('2. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/authentication');
      console.log('3. Clique em "Get started" se não estiver habilitado');
      console.log('4. Habilite o provedor "Email/Password"');
      console.log('5. Verifique se o domínio está autorizado');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n💡 SOLUÇÃO PARA auth/user-not-found:');
      console.log('1. Verifique se o usuário existe no Authentication');
      console.log('2. Execute: node scripts/check-user-status.js');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n💡 SOLUÇÃO PARA auth/wrong-password:');
      console.log('1. Verifique se a senha está correta');
      console.log('2. Senha correta: Interbox2025!NM');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n💡 SOLUÇÃO PARA auth/invalid-email:');
      console.log('1. Verifique se o email está correto');
      console.log('2. Email correto: nettoaeb1@gmail.com');
    } else {
      console.log('\n💡 SOLUÇÃO GERAL:');
      console.log('1. Verifique a configuração do Firebase');
      console.log('2. Verifique se o projeto está ativo');
      console.log('3. Verifique se as APIs estão habilitadas');
    }
  }

  console.log('\n─'.repeat(60));
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Se teste passou: problema pode ser no navegador/cache');
  console.log('2. Se teste falhou: siga as soluções acima');
  console.log('3. URL de teste: https://interbox-app-8d400.web.app/login');
}

// Executar teste
testFrontendAuth().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 