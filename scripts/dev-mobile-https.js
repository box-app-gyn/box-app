const { spawn } = require('child_process');
const { getLocalIP } = require('./get-local-ip.js');

console.log('🚀 Iniciando desenvolvimento mobile com HTTPS...\n');

// Verificar se ngrok está instalado
const checkNgrok = spawn('ngrok', ['version'], { stdio: 'pipe' });

checkNgrok.on('error', () => {
  console.log('❌ ngrok não encontrado. Instalando...');
  console.log('Execute: npm install -g ngrok');
  console.log('Ou baixe em: https://ngrok.com/download\n');
  
  console.log('🌐 Para desenvolvimento sem HTTPS:');
  console.log('npm run dev:mobile\n');
  
  const localIP = getLocalIP();
  console.log(`📱 Acesse: http://${localIP}:3000`);
});

checkNgrok.on('close', (code) => {
  if (code === 0) {
    console.log('✅ ngrok encontrado!\n');
    
    // Iniciar servidor Next.js
    console.log('🔄 Iniciando servidor Next.js...');
    const nextServer = spawn('npm', ['run', 'dev:mobile'], {
      stdio: 'inherit',
      shell: true
    });
    
    // Aguardar um pouco para o servidor iniciar
    setTimeout(() => {
      console.log('\n🌐 Iniciando túnel HTTPS...');
      const ngrokTunnel = spawn('ngrok', ['http', '3000'], {
        stdio: 'pipe'
      });
      
      ngrokTunnel.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Procurar pela URL do ngrok
        const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
        if (urlMatch) {
          console.log('\n🎉 Servidor HTTPS pronto!');
          console.log(`📱 Acesse no mobile: ${urlMatch[0]}`);
          console.log(`💻 Acesse no desktop: ${urlMatch[0]}`);
          console.log('\n🔒 Agora você pode testar PWA com HTTPS!');
        }
        
        // Mostrar logs do ngrok
        if (output.includes('Session Status')) {
          console.log('\n📊 Status do túnel:');
        }
        if (output.includes('Forwarding')) {
          console.log(output.trim());
        }
      });
      
      ngrokTunnel.stderr.on('data', (data) => {
        console.log('ngrok error:', data.toString());
      });
      
      // Cleanup quando o processo for interrompido
      process.on('SIGINT', () => {
        console.log('\n🛑 Parando servidores...');
        nextServer.kill();
        ngrokTunnel.kill();
        process.exit();
      });
      
    }, 5000); // Aguardar 5 segundos para o servidor Next.js iniciar
  }
}); 