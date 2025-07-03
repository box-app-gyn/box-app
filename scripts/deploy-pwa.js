const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy PWA para Firebase...\n');

// Verificar se firebase está instalado
function checkFirebase() {
  return new Promise((resolve, reject) => {
    exec('firebase --version', (error, stdout, stderr) => {
      if (error) {
        reject('Firebase CLI não encontrado. Instale com: npm install -g firebase-tools');
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Build para produção
function buildProduction() {
  return new Promise((resolve, reject) => {
    console.log('🔨 Fazendo build para produção...');
    exec('npm run build:app-hosting', (error, stdout, stderr) => {
      if (error) {
        reject(`Erro no build: ${error.message}`);
        return;
      }
      console.log('✅ Build concluído');
      resolve();
    });
  });
}

// Deploy para Firebase
function deployToFirebase() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Fazendo deploy para Firebase...');
    exec('firebase deploy --only hosting', (error, stdout, stderr) => {
      if (error) {
        reject(`Erro no deploy: ${error.message}`);
        return;
      }
      console.log('✅ Deploy concluído');
      resolve(stdout);
    });
  });
}

// Verificar arquivos PWA
function checkPWAFiles() {
  const requiredFiles = [
    'public/manifest.json',
    'public/sw.js',
    'public/videos/intro.mp4',
    'public/logos/logo_circulo.png'
  ];

  console.log('📋 Verificando arquivos PWA...');
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - NÃO ENCONTRADO`);
    }
  }
}

// Executar deploy completo
async function runDeploy() {
  try {
    // Verificar Firebase CLI
    const firebaseVersion = await checkFirebase();
    console.log(`✅ Firebase CLI ${firebaseVersion} encontrado\n`);

    // Verificar arquivos PWA
    checkPWAFiles();
    console.log('');

    // Build para produção
    await buildProduction();
    console.log('');

    // Deploy para Firebase
    const deployOutput = await deployToFirebase();
    
    console.log('\n🎉 Deploy PWA concluído com sucesso!');
    console.log('\n📱 URLs de teste:');
    console.log('- Firebase Hosting: https://cerrado-app.web.app');
    console.log('- Firebase Hosting (alt): https://cerrado-app.firebaseapp.com');
    
    // Extrair URL do output do Firebase
    const urlMatch = deployOutput.match(/Hosting URL: (https:\/\/[^\s]+)/);
    if (urlMatch) {
      console.log(`- URL específica: ${urlMatch[1]}`);
    }
    
    console.log('\n🔧 Próximos passos:');
    console.log('1. Teste no Safari mobile');
    console.log('2. Verifique splash screen');
    console.log('3. Teste instalação PWA');
    console.log('4. Verifique funcionalidades offline');

  } catch (error) {
    console.error('\n❌ Erro no deploy:', error);
    process.exit(1);
  }
}

runDeploy(); 