
// Teste rápido de imagens
console.log('🧪 Testando carregamento de imagens...');
const images = ['/logos/logo_circulo.png', '/images/bg_main.png'];
images.forEach(src => {
  const img = new Image();
  img.onload = () => console.log('✅', src);
  img.onerror = () => console.log('❌', src);
  img.src = src;
});
