
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
