const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo TODOS os problemas...');

// 1. Limpar cache e arquivos temporários
console.log('\n🧹 Limpando cache...');
const dirsToClean = ['.next', 'node_modules/.cache', '.turbo'];
dirsToClean.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✅ Limpo: ${dir}`);
  }
});

// 2. Verificar e corrigir imagens
console.log('\n🖼️ Verificando imagens...');
const requiredImages = [
  'public/logos/logo_circulo.png',
  'public/logos/oficial_logo.png', 
  'public/logos/nome_hrz.png',
  'public/images/bg_main.png',
  'public/images/twolines.png',
  'public/images/liner.png',
  'public/qrcode_cerrado.png'
];

requiredImages.forEach(imagePath => {
  if (!fs.existsSync(imagePath)) {
    console.log(`❌ Faltando: ${imagePath}`);
    // Copiar barbell.png como fallback
    if (fs.existsSync('public/logos/barbell.png')) {
      fs.copyFileSync('public/logos/barbell.png', imagePath);
      console.log(`✅ Criado: ${imagePath}`);
    }
  } else {
    console.log(`✅ OK: ${imagePath}`);
  }
});

// 3. Corrigir componentes com problemas de imagens
console.log('\n🔧 Corrigindo componentes...');

// Função para adicionar priority e style em imagens
function fixImageComponent(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Adicionar priority em imagens importantes
  content = content.replace(
    /<Image\s+src="\/logos\/([^"]+)"([^>]*?)(\/?>)/g,
    (match, filename, attrs, closing) => {
      if (!attrs.includes('priority')) {
        modified = true;
        return `<Image src="/logos/${filename}"${attrs} priority${closing}`;
      }
      return match;
    }
  );
  
  // Adicionar style={{ height: 'auto' }} em imagens com dimensões modificadas
  content = content.replace(
    /<Image\s+src="\/images\/([^"]+)"([^>]*?)(\/?>)/g,
    (match, filename, attrs, closing) => {
      if (!attrs.includes('style={{ height: \'auto\' }}')) {
        modified = true;
        return `<Image src="/images/${filename}"${attrs} style={{ height: 'auto' }}${closing}`;
      }
      return match;
    }
  );
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  }
}

// Lista de arquivos para corrigir
const filesToFix = [
  'components/Hero.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/SplashScreen.tsx',
  'components/VideoSplashScreen.tsx',
  'components/LogoSelo.tsx',
  'components/InstallBanner.tsx',
  'components/InstallToast.tsx',
  'components/PWAInstallPrompt.tsx'
];

filesToFix.forEach(fixImageComponent);

// 4. Verificar package.json
console.log('\n📦 Verificando dependências...');
const packagePath = 'package.json';
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log(`✅ Next.js: ${packageJson.dependencies?.next || 'não encontrado'}`);
  console.log(`✅ React: ${packageJson.dependencies?.react || 'não encontrado'}`);
}

// 5. Verificar .env
console.log('\n🔐 Verificando variáveis de ambiente...');
const envFiles = ['.env.local', '.env'];
envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    console.log(`✅ ${envFile} existe`);
  } else {
    console.log(`⚠️ ${envFile} não encontrado`);
  }
});

// 6. Criar script de teste rápido
const quickTest = `
// Teste rápido de imagens
console.log('🧪 Testando carregamento de imagens...');
const images = ['/logos/logo_circulo.png', '/images/bg_main.png'];
images.forEach(src => {
  const img = new Image();
  img.onload = () => console.log('✅', src);
  img.onerror = () => console.log('❌', src);
  img.src = src;
});
`;

fs.writeFileSync('public/quick-test.js', quickTest);
console.log('\n📝 Script de teste criado: public/quick-test.js');

// 7. Instruções finais
console.log('\n🎉 Correções concluídas!');
console.log('\n📋 Próximos passos:');
console.log('1. npm install (se necessário)');
console.log('2. npm run dev');
console.log('3. Acesse: http://localhost:3000');
console.log('4. Teste: http://localhost:3000/test-images');
console.log('5. Console: fetch("/quick-test.js").then(r => r.text()).then(eval)');

// 8. Verificar se há problemas de permissão
console.log('\n🔐 Verificando permissões...');
const publicDir = 'public';
if (fs.existsSync(publicDir)) {
  try {
    fs.accessSync(publicDir, fs.constants.R_OK);
    console.log('✅ Pasta public legível');
  } catch (error) {
    console.log('❌ Problema de permissão na pasta public');
  }
} 