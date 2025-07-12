// approval-cli.js
const inquirer = require('inquirer');

class ApprovalCLI {
  async showPendingChanges() {
    const pending = await this.getPendingChanges();

    if (pending.length === 0) {
      console.log('Nenhuma alteração pendente');
      return;
    }

    for (const change of pending) {
      await this.reviewChange(change);
    }
  }

  async reviewChange(change) {
    console.log(`\n=== Revisão de Alteração ===`);
    console.log(`Arquivo: ${change.file}`);
    console.log(`Tipo: ${change.type}`);
    console.log(`Descrição: ${change.description}`);
    console.log(`Impacto: ${change.impact}`);

    // Mostrar diff
    console.log('\n--- Alterações ---');
    console.log(change.diff);

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: [
          'Aprovar',
          'Rejeitar',
          'Modificar',
          'Pular para depois'
        ]
      }
    ]);

    await this.processDecision(change, answer.action);
  }
}
