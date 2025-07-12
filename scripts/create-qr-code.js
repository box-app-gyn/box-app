const fs = require('fs');

const url = 'https://cerradointerbox.com.br';
const outputPath = 'public/qrcode_cerrado.png';

// Tenta gerar QR code real
try {
  const QRCode = require('qrcode');
  QRCode.toFile(outputPath, url, {
    color: { dark: '#000000', light: '#FFFFFF' },
    width: 400
  }, function (err) {
    if (err) throw err;
    console.log('✅ QR code real gerado:', outputPath);
  });
} catch (e1) {
  // Se não tiver qrcode, tenta placeholder visual com canvas
  try {
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    const canvasInstance = createCanvas(200, 200);
    const ctx = canvasInstance.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 20, 40, 40);
    ctx.fillRect(25, 25, 30, 30);
    ctx.fillRect(30, 30, 20, 20);
    ctx.fillRect(140, 20, 40, 40);
    ctx.fillRect(145, 25, 30, 30);
    ctx.fillRect(150, 30, 20, 20);
    ctx.fillRect(20, 140, 40, 40);
    ctx.fillRect(25, 145, 30, 30);
    ctx.fillRect(30, 150, 20, 20);
    ctx.fillRect(80, 80, 40, 40);
    ctx.fillRect(85, 85, 30, 30);
    ctx.fillRect(90, 90, 20, 20);
    ctx.fillStyle = '#666666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', 100, 190);
    const buffer = canvasInstance.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Placeholder visual criado:', outputPath);
  } catch (e2) {
    // Se não tiver canvas, cai para PNG binário simples
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0xC8,
      0x00, 0x00, 0x00, 0xC8,
      0x08, 0x02, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);
    fs.writeFileSync(outputPath, pngHeader);
    console.log('✅ Placeholder binário criado:', outputPath);
    console.log('📝 Instale canvas ou qrcode para melhor resultado.');
  }
} 