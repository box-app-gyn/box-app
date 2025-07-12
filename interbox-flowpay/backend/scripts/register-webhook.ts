import 'dotenv/config';
import { FlowPayAPI } from '../functions/src/flowpay/api';

const config = {
  apiKey: process.env.OPENPIX_API_KEY || '',
  baseUrl: process.env.OPENPIX_BASE_URL || 'https://api.openpix.com.br'
};

const webhookUrl = process.env.WEBHOOK_URL || '';

async function registerWebhook() {
  if (!config.apiKey) {
    console.error('OPENPIX_API_KEY não configurada');
    process.exit(1);
  }

  if (!webhookUrl) {
    console.error('WEBHOOK_URL não configurada');
    process.exit(1);
  }

  const api = new FlowPayAPI(config);

  try {
    console.log('Registrando webhook...');
    console.log('URL:', webhookUrl);
    
    await api.registerWebhook(webhookUrl);
    
    console.log('✅ Webhook registrado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar webhook:', error);
    process.exit(1);
  }
}

registerWebhook(); 