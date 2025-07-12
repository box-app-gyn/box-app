#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Deploy Automático GitHub + Firebase\n');

// Verificar se firebase.json existe
if (!fs.existsSync('firebase.json')) {
  console.log('❌ firebase.json não encontrado');
  console.log('Execute: firebase init hosting');
  process.exit(1);
}

// Verificar se .github/workflows existe
const workflowsDir = '.github/workflows';
if (!fs.existsSync(workflowsDir)) {
  fs.mkdirSync(workflowsDir, { recursive: true });
  console.log('✅ Criado diretório .github/workflows');
}

// Verificar se firebase-deploy.yml existe
const workflowFile = path.join(workflowsDir, 'firebase-deploy.yml');
if (!fs.existsSync(workflowFile)) {
  console.log('❌ firebase-deploy.yml não encontrado');
  console.log('Verifique se o arquivo foi criado corretamente');
  process.exit(1);
}

console.log('✅ Workflow configurado');

// Verificar .gitignore
const gitignorePath = '.gitignore';
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  
  const requiredEntries = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    'firebase-service-account.json',
    'firebase-admin-key.json',
  ];
  
  const missingEntries = requiredEntries.filter(entry => !gitignore.includes(entry));
  
  if (missingEntries.length > 0) {
    console.log('⚠️  Adicione ao .gitignore:');
    missingEntries.forEach(entry => console.log(`   ${entry}`));
  } else {
    console.log('✅ .gitignore configurado corretamente');
  }
}

console.log('\n📋 Próximos passos:');
console.log('\n1. Configure os secrets no GitHub:');
console.log('   Settings > Secrets and variables > Actions');
console.log('\n2. Adicione os secrets:');
console.log('   FIREBASE_API_KEY=your_api_key');
console.log('   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
console.log('   FIREBASE_PROJECT_ID=your_project_id');
console.log('   FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app');
console.log('   FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
console.log('   FIREBASE_APP_ID=your_app_id');
console.log('   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX');
console.log('   NEXT_PUBLIC_APP_URL=https://your-domain.com');
console.log('   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}');
console.log('   FIREBASE_ADMIN_PROJECT_ID=your_project_id (opcional)');
console.log('   FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----... (opcional)');
console.log('   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-... (opcional)');
console.log('\n3. Teste o deploy:');
console.log('   git push origin main');
console.log('\n4. Monitore em:');
console.log('   https://github.com/seu-usuario/seu-repo/actions');
console.log('\n📚 Documentação completa: docs/GITHUB-DEPLOY-SETUP.md');

// Verificar se env.example existe
if (!fs.existsSync('env.example')) {
  console.log('\n⚠️  env.example não encontrado');
  console.log('Crie um arquivo env.example com as variáveis necessárias');
}

console.log('\n✅ Configuração concluída!'); 