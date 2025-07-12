// scripts/approval-system.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ApprovalSystem {
  constructor() {
    this.configPath = path.join(__dirname, '../.cursor/permissions.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return null;
    }
  }

  async requestApproval(changeType, details) {
    console.log('\n🔍 SOLICITAÇÃO DE APROVAÇÃO');
    console.log('============================');
    console.log(`Tipo: ${changeType}`);
    console.log(`Detalhes: ${JSON.stringify(details, null, 2)}`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\nAprovar esta alteração? (s/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 's');
      });
    });
  }

  async createBackup(type) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups', timestamp);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`📦 Criando backup em: ${backupDir}`);

    // Implementar backup específico baseado no tipo
    switch (type) {
      case 'firestore':
        await this.backupFirestore(backupDir);
        break;
      case 'config':
        await this.backupConfig(backupDir);
        break;
    }
  }

  async backupFirestore(backupDir) {
    // Copiar arquivos relacionados ao Firestore
    const filesToBackup = [
      'firestore.rules',
      'firebase.json',
      'src/lib/firebase.ts'
    ];

    filesToBackup.forEach(file => {
      const sourcePath = path.join(__dirname, '..', file);
      const destPath = path.join(backupDir, file);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Backup criado: ${file}`);
      }
    });
  }
}

module.exports = ApprovalSystem;
