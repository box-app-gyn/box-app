const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo avisos de imagens...');

// Função para adicionar priority em imagens importantes
function addPriorityToImages() {
  const files = [
    'components/SplashScreen.tsx',
    'components/VideoSplashScreen.tsx',
    'components/LogoSelo.tsx',
    'components/Header.tsx',
    'components/Hero.tsx'
  ];

  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Adicionar priority em imagens de logo que podem ser LCP
      content = content.replace(
        /<Image\s+src="\/logos\/logo_circulo\.png"([^>]*?)(\/?>)/g,
        (match, attrs, closing) => {
          if (!attrs.includes('priority')) {
            return `<Image src="/logos/logo_circulo.png"${attrs} priority${closing}`;
          }
          return match;
        }
      );

      // Adicionar priority em imagens de hero/header
      content = content.replace(
        /<Image\s+src="\/logos\/oficial_logo\.png"([^>]*?)(\/?>)/g,
        (match, attrs, closing) => {
          if (!attrs.includes('priority')) {
            return `<Image src="/logos/oficial_logo.png"${attrs} priority${closing}`;
          }
          return match;
        }
      );

      fs.writeFileSync(filePath, content);
      console.log(`✅ Corrigido: ${file}`);
    }
  });
}

// Função para corrigir aspect ratio
function fixAspectRatio() {
  const files = [
    'components/Header.tsx',
    'components/Footer.tsx'
  ];

  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Adicionar style={{ height: 'auto' }} em imagens com dimensões modificadas
      content = content.replace(
        /<Image\s+src="\/images\/twolines\.png"([^>]*?)(\/?>)/g,
        (match, attrs, closing) => {
          if (!attrs.includes('style={{ height: \'auto\' }}')) {
            return `<Image src="/images/twolines.png"${attrs} style={{ height: 'auto' }}${closing}`;
          }
          return match;
        }
      );

      fs.writeFileSync(filePath, content);
      console.log(`✅ Aspect ratio corrigido: ${file}`);
    }
  });
}

// Executar correções
addPriorityToImages();
fixAspectRatio();

console.log('🎉 Correções de imagens concluídas!');
console.log('\n📝 Avisos corrigidos:');
console.log('1. ✅ LCP (Largest Contentful Paint) - priority adicionado');
console.log('2. ✅ Aspect ratio - style={{ height: \'auto\' }} adicionado');
console.log('3. ✅ Extensões crypto (Keplr/Bybit) - ignoradas (não afetam o app)'); 