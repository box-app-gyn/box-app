import * as admin from 'firebase-admin';
import { FlowPayAPI } from '../functions/src/flowpay/api';
import { FirestoreHelper } from '../utils/firestore';
import { Logger } from '../utils/logger';

const config = {
  apiKey: process.env.OPENPIX_API_KEY || '',
  baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br'
};

const logger = new Logger('ManualStatusCheck');

async function checkPendingPayments() {
  if (!config.apiKey) {
    logger.error('OPENPIX_API_KEY não configurada');
    process.exit(1);
  }

  admin.initializeApp();
  const db = admin.firestore();
  const firestoreHelper = new FirestoreHelper(db);
  const api = new FlowPayAPI(config);

  try {
    logger.info('Verificando pagamentos pendentes...');
    
    const pendingTeams = await firestoreHelper.getTeamsByPaymentStatus('pending');
    logger.info(`Encontrados ${pendingTeams.length} times com pagamento pendente`);

    for (const team of pendingTeams) {
      try {
        logger.info(`Verificando time: ${team.nome} (${team.id})`);
        
        const chargeStatus = await api.getChargeStatus(team.id);
        
        if (chargeStatus.status === 'COMPLETED') {
          await firestoreHelper.updatePaymentStatus(team.id, 'paid');
          logger.info(`✅ Pagamento confirmado para: ${team.nome}`);
        } else {
          logger.info(`⏳ Pagamento ainda pendente para: ${team.nome} (${chargeStatus.status})`);
        }
      } catch (error) {
        logger.error(`Erro ao verificar time ${team.nome}:`, error);
      }
    }

    logger.info('Verificação concluída');
  } catch (error) {
    logger.error('Erro geral:', error);
    process.exit(1);
  }
}

checkPendingPayments(); 