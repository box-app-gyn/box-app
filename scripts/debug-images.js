const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnosticando problemas de imagens...');

// Verificar se todas as imagens existem
const requiredImages = [
  'public/logos/logo_circulo.png',
  'public/logos/oficial_logo.png',
  'public/logos/nome_hrz.png',
  'public/images/bg_main.png',
  'public/images/twolines.png',
  'public/images/liner.png',
  'public/qrcode_cerrado.png'
];

console.log('\n📁 Verificando existência das imagens:');
requiredImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log(`✅ ${imagePath} (${(stats.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`❌ ${imagePath} - FALTANDO`);
  }
});

// Verificar se há problemas de permissão
console.log('\n🔐 Verificando permissões:');
requiredImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    try {
      fs.accessSync(imagePath, fs.constants.R_OK);
      console.log(`✅ ${path.basename(imagePath)} - Legível`);
    } catch (error) {
      console.log(`❌ ${path.basename(imagePath)} - Sem permissão de leitura`);
    }
  }
});

// Verificar se as imagens são válidas
console.log('\n🖼️ Verificando validade das imagens:');
requiredImages.forEach(imagePath => {
  if (fs.existsSync(imagePath)) {
    try {
      const buffer = fs.readFileSync(imagePath);
      const isPNG = buffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
      const isJPEG = buffer.slice(0, 2).toString('hex') === 'ffd8';
      
      if (isPNG) {
        console.log(`✅ ${path.basename(imagePath)} - PNG válido`);
      } else if (isJPEG) {
        console.log(`✅ ${path.basename(imagePath)} - JPEG válido`);
      } else {
        console.log(`⚠️ ${path.basename(imagePath)} - Formato desconhecido`);
      }
    } catch (error) {
      console.log(`❌ ${path.basename(imagePath)} - Erro ao ler arquivo`);
    }
  }
});

// Verificar configuração do Next.js
console.log('\n⚙️ Verificando configuração do Next.js:');
const nextConfigPath = 'next.config.js';
if (fs.existsSync(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (config.includes('dangerouslyAllowSVG')) {
    console.log('✅ SVG permitido na configuração');
  } else {
    console.log('⚠️ SVG não configurado');
  }
  
  if (config.includes('allowedDevOrigins')) {
    console.log('✅ Cross-origin configurado');
  } else {
    console.log('⚠️ Cross-origin não configurado');
  }
} else {
  console.log('❌ next.config.js não encontrado');
}

// Sugestões de correção
console.log('\n💡 Sugestões de correção:');
console.log('1. Verifique se o servidor está rodando em http://localhost:3000');
console.log('2. Abra o DevTools (F12) e verifique a aba Network');
console.log('3. Recarregue a página com Ctrl+F5 (hard refresh)');
console.log('4. Verifique se há erros no console do navegador');
console.log('5. Teste acessando as imagens diretamente:');
console.log('   - http://localhost:3000/logos/logo_circulo.png');
console.log('   - http://localhost:3000/images/bg_main.png');

// Criar script de teste
const testScript = `
// Script para testar carregamento de imagens no navegador
const testImages = [
  '/logos/logo_circulo.png',
  '/logos/oficial_logo.png',
  '/images/bg_main.png',
  '/images/twolines.png'
];

testImages.forEach(src => {
  const img = new Image();
  img.onload = () => console.log('✅', src, 'carregou');
  img.onerror = () => console.log('❌', src, 'falhou');
  img.src = src;
});
`;

fs.writeFileSync('public/test-images.js', testScript);
console.log('\n📝 Script de teste criado: public/test-images.js');
console.log('Execute no console do navegador:');
console.log('fetch("/test-images.js").then(r => r.text()).then(eval)'); 