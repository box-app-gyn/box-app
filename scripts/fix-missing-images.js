const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo imagens faltantes...');

// Função para criar imagem placeholder
function createPlaceholderImage(filePath, width = 200, height = 200, text = 'Logo') {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Criar SVG placeholder simples
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy=".3em">${text}</text>
  </svg>`;
  
  fs.writeFileSync(filePath, svg);
  console.log(`✅ Criado placeholder: ${filePath}`);
}

// Função para copiar imagem existente
function copyImage(source, destination) {
  const dir = path.dirname(destination);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } else {
    console.log(`❌ Fonte não encontrada: ${source}`);
  }
}

// Resolver imagens faltantes
const fixes = [
  // Logos - usar barbell.png como base
  {
    source: 'public/logos/barbell.png',
    destination: 'public/logos/logo_circulo.png',
    fallback: () => createPlaceholderImage('public/logos/logo_circulo.png', 200, 200, 'Logo Círculo')
  },
  {
    source: 'public/logos/barbell.png', 
    destination: 'public/logos/oficial_logo.png',
    fallback: () => createPlaceholderImage('public/logos/oficial_logo.png', 300, 100, 'Logo Oficial')
  },
  {
    source: 'public/logos/barbell.png',
    destination: 'public/logos/nome_hrz.png', 
    fallback: () => createPlaceholderImage('public/logos/nome_hrz.png', 400, 80, 'Nome Horizontal')
  },
  
  // Background - usar corner.png como base
  {
    source: 'public/images/corner.png',
    destination: 'public/images/bg_main.png',
    fallback: () => createPlaceholderImage('public/images/bg_main.png', 1920, 1080, 'Background')
  },
  
  // QR Code - criar placeholder
  {
    source: null,
    destination: 'public/qrcode_cerrado.png',
    fallback: () => createPlaceholderImage('public/qrcode_cerrado.png', 200, 200, 'QR Code')
  }
];

// Aplicar correções
fixes.forEach(({ source, destination, fallback }) => {
  if (source && fs.existsSync(source)) {
    copyImage(source, destination);
  } else {
    fallback();
  }
});

console.log('🎉 Correção de imagens concluída!');
console.log('\n📝 Próximos passos:');
console.log('1. Substitua os placeholders pelas imagens reais');
console.log('2. Para QR Code: gere um QR code real para o site');
console.log('3. Para logos: use as versões oficiais da marca'); 