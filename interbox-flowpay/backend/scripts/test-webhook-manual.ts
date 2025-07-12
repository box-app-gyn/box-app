import 'dotenv/config';
import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://us-central1-interbox-app-8d400.cloudfunctions.net/api/flowpay/webhook';

async function testWebhook() {
  const testPayload = {
    charge: {
      reference: 'test-team-123',
      status: 'COMPLETED',
      value: 15000,
      correlationID: 'test-team-123'
    },
    event: 'CHARGE_COMPLETED'
  };

  try {
    console.log('🧪 Testando webhook...');
    console.log('URL:', WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('Status:', response.status);
    console.log('Response:', await response.text());

    if (response.ok) {
      console.log('✅ Webhook funcionando!');
    } else {
      console.log('❌ Erro no webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
}

testWebhook(); 