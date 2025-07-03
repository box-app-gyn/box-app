const fs = require('fs');
const path = require('path');

console.log('🔧 Criando QR code PNG...');

// Função para criar QR code PNG simples usando Canvas API
function createQRCodePNG() {
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  // Criar canvas 200x200
  const canvasInstance = createCanvas(200, 200);
  const ctx = canvasInstance.getContext('2d');
  
  // Fundo branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 200, 200);
  
  // Desenhar padrão QR code simples (apenas para placeholder)
  ctx.fillStyle = '#000000';
  
  // Canto superior esquerdo
  ctx.fillRect(20, 20, 40, 40);
  ctx.fillRect(25, 25, 30, 30);
  ctx.fillRect(30, 30, 20, 20);
  
  // Canto superior direito
  ctx.fillRect(140, 20, 40, 40);
  ctx.fillRect(145, 25, 30, 30);
  ctx.fillRect(150, 30, 20, 20);
  
  // Canto inferior esquerdo
  ctx.fillRect(20, 140, 40, 40);
  ctx.fillRect(25, 145, 30, 30);
  ctx.fillRect(30, 150, 20, 20);
  
  // Padrão central
  ctx.fillRect(80, 80, 40, 40);
  ctx.fillRect(85, 85, 30, 30);
  ctx.fillRect(90, 90, 20, 20);
  
  // Texto
  ctx.fillStyle = '#666666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QR Code', 100, 190);
  
  // Salvar como PNG
  const buffer = canvasInstance.toBuffer('image/png');
  fs.writeFileSync('public/qrcode_cerrado.png', buffer);
  
  console.log('✅ QR code PNG criado: public/qrcode_cerrado.png');
}

// Verificar se canvas está disponível
try {
  require('canvas');
  createQRCodePNG();
} catch (error) {
  console.log('⚠️ Canvas não disponível, criando placeholder simples...');
  
  // Criar placeholder PNG simples sem canvas
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0xC8, // width: 200
    0x00, 0x00, 0x00, 0xC8, // height: 200
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x00, 0x00, 0x00, 0x00, // CRC placeholder
  ]);
  
  fs.writeFileSync('public/qrcode_cerrado.png', pngHeader);
  console.log('✅ Placeholder PNG criado: public/qrcode_cerrado.png');
  console.log('📝 Instale canvas para QR code real: npm install canvas');
} 