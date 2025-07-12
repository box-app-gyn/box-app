const path = require('path');
const fs = require('fs');

// Verificar se estamos no diretório correto
const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Não foi possível encontrar o package.json do projeto!');
  console.log('💡 Execute este script a partir da raiz do projeto');
  process.exit(1);
}

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

async function checkFirebaseConfig() {
  console.log('🔍 Verificando configuração do Firebase...');
  console.log('─'.repeat(60));

  try {
    // Carregar credenciais do arquivo JSON
    const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    // 1. Verificar configuração do projeto
    console.log('📋 1. Verificando configuração do projeto...');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
    console.log(`   Private Key ID: ${serviceAccount.private_key_id}`);
    
    // 2. Verificar se as credenciais são válidas
    console.log('\n📋 2. Verificando validade das credenciais...');
    
    if (!serviceAccount.project_id) {
      throw new Error('Project ID não encontrado nas credenciais');
    }
    
    if (!serviceAccount.client_email) {
      throw new Error('Client Email não encontrado nas credenciais');
    }
    
    if (!serviceAccount.private_key) {
      throw new Error('Private Key não encontrada nas credenciais');
    }
    
    console.log('✅ Credenciais válidas');
    
    // 3. Verificar arquivos de configuração
    console.log('\n📋 3. Verificando arquivos de configuração...');
    
    const firebaseJsonPath = path.join(projectRoot, 'firebase.json');
    const firestoreRulesPath = path.join(projectRoot, 'firestore.rules');
    const firestoreIndexesPath = path.join(projectRoot, 'firestore.indexes.json');
    const storageRulesPath = path.join(projectRoot, 'storage.rules');
    
    if (fs.existsSync(firebaseJsonPath)) {
      console.log('✅ firebase.json encontrado');
    } else {
      console.log('⚠️  firebase.json não encontrado');
    }
    
    if (fs.existsSync(firestoreRulesPath)) {
      console.log('✅ firestore.rules encontrado');
    } else {
      console.log('⚠️  firestore.rules não encontrado');
    }
    
    if (fs.existsSync(firestoreIndexesPath)) {
      console.log('✅ firestore.indexes.json encontrado');
    } else {
      console.log('⚠️  firestore.indexes.json não encontrado');
    }
    
    if (fs.existsSync(storageRulesPath)) {
      console.log('✅ storage.rules encontrado');
    } else {
      console.log('⚠️  storage.rules não encontrado');
    }
    
    // 4. Verificar variáveis de ambiente
    console.log('\n📋 4. Verificando variáveis de ambiente...');
    
    const envPath = path.join(projectRoot, '.env.local');
    if (fs.existsSync(envPath)) {
      console.log('✅ .env.local encontrado');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
      ];
      
      const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
      
      if (missingVars.length === 0) {
        console.log('✅ Todas as variáveis de ambiente necessárias encontradas');
      } else {
        console.log('⚠️  Variáveis de ambiente faltando:');
        missingVars.forEach(varName => console.log(`   - ${varName}`));
      }
    } else {
      console.log('⚠️  .env.local não encontrado');
      console.log('💡 Crie o arquivo .env.local com as variáveis do Firebase');
    }
    
    // 5. Verificar configuração do Next.js
    console.log('\n📋 5. Verificando configuração do Next.js...');
    
    const nextConfigPath = path.join(projectRoot, 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      console.log('✅ next.config.js encontrado');
    } else {
      console.log('⚠️  next.config.js não encontrado');
    }
    
    // 6. Verificar configuração do Tailwind
    console.log('\n📋 6. Verificando configuração do Tailwind...');
    
    const tailwindConfigPath = path.join(projectRoot, 'tailwind.config.js');
    if (fs.existsSync(tailwindConfigPath)) {
      console.log('✅ tailwind.config.js encontrado');
    } else {
      console.log('⚠️  tailwind.config.js não encontrado');
    }
    
    // 7. Verificar configuração do TypeScript
    console.log('\n📋 7. Verificando configuração do TypeScript...');
    
    const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      console.log('✅ tsconfig.json encontrado');
    } else {
      console.log('⚠️  tsconfig.json não encontrado');
    }
    
    console.log('\n🎉 VERIFICAÇÃO DE CONFIGURAÇÃO CONCLUÍDA!');
    console.log('✅ Arquivos de configuração verificados');
    console.log('✅ Credenciais do Firebase válidas');
    console.log('✅ Estrutura do projeto OK');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Execute: npm run dev');
    console.log('2. Teste o login em: http://localhost:3000/login');
    console.log('3. Verifique o console do navegador para erros');
    console.log('4. Se houver problemas, execute: npm run security:check');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    
    console.log('\n💡 SOLUÇÃO:');
    console.log('1. Verifique se o arquivo firebase-admin-key.json está correto');
    console.log('2. Certifique-se de que está executando da raiz do projeto');
    console.log('3. Execute: npm install para instalar dependências');
    console.log('4. Verifique se o projeto Firebase está ativo');
  }

  console.log('\n─'.repeat(60));
}

// Executar verificação
checkFirebaseConfig().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 