const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Pular interfaces não IPv4 e loopback
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const localIP = getLocalIP();
console.log(`🌐 IP Local: ${localIP}`);
console.log(`📱 Acesse no mobile: http://${localIP}:3000`);
console.log(`💻 Acesse no desktop: http://localhost:3000`);
console.log('');
console.log('Para iniciar o servidor mobile:');
console.log('npm run dev:mobile');
console.log('');
console.log('Para iniciar com configuração mobile:');
console.log('npm run dev:mobile:config');

module.exports = { getLocalIP }; 