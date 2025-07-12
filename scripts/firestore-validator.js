// scripts/firestore-validator.js
const fs = require('fs');
const path = require('path');

class FirestoreValidator {
  constructor() {
    this.rulesPath = path.join(__dirname, '../firestore.rules');
    this.configPath = path.join(__dirname, '../firebase.json');
  }

  validateRules() {
    try {
      const rules = fs.readFileSync(this.rulesPath, 'utf8');

      const checks = [
        this.checkPublicAccess(rules),
        this.checkAuthValidation(rules),
        this.checkDataValidation(rules)
      ];

      return {
        valid: checks.every(check => check.passed),
        checks: checks
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  checkPublicAccess(rules) {
    const hasPublicWrite = rules.includes('allow write: if true');
    const hasPublicRead = rules.includes('allow read: if true');

    return {
      name: 'Public Access Check',
      passed: !hasPublicWrite,
      warning: hasPublicRead,
      message: hasPublicWrite ? 'PERIGO: Acesso público de escrita detectado!' : 'OK'
    };
  }

  checkAuthValidation(rules) {
    const hasAuth = rules.includes('request.auth');

    return {
      name: 'Authentication Check',
      passed: hasAuth,
      message: hasAuth ? 'Validação de autenticação encontrada' : 'AVISO: Nenhuma validação de auth encontrada'
    };
  }

  checkDataValidation(rules) {
    const hasValidation = rules.includes('resource.data') || rules.includes('request.resource.data');

    return {
      name: 'Data Validation Check',
      passed: hasValidation,
      message: hasValidation ? 'Validação de dados encontrada' : 'AVISO: Pouca validação de dados'
    };
  }
}

module.exports = FirestoreValidator;
