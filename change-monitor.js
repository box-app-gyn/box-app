// change-monitor.js
class ChangeMonitor {
    constructor() {
      this.watchedFiles = [
        'firestore.rules',
        'firebase.json',
        'src/lib/firebase.ts'
      ];
  
      this.setupWatchers();
    }
  
    setupWatchers() {
      this.watchedFiles.forEach(file => {
        fs.watchFile(file, (curr, prev) => {
          this.handleFileChange(file, curr, prev);
        });
      });
    }
  
    async handleFileChange(file, curr, prev) {
      // Detectar tipo de mudança
      const changeType = await this.analyzeChange(file, curr, prev);
  
      // Verificar se precisa de aprovação
      const needsApproval = this.checkApprovalNeeded(file, changeType);
  
      if (needsApproval) {
        await this.requestApproval(file, changeType);
      }
    }
  
    async analyzeChange(file, curr, prev) {
      // Analisar diff do arquivo
      const oldContent = await this.getFileContent(file, prev.mtime);
      const newContent = await this.getFileContent(file, curr.mtime);
  
      return this.generateDiff(oldContent, newContent);
    }
  }
  