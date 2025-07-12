import fetch from 'node-fetch';

const LOCAL_FUNCTIONS_URL = 'http://localhost:5001/interbox-app-8d400/us-central1/api';

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
    console.log('🧪 Testando webhook local...');
    console.log('URL:', `${LOCAL_FUNCTIONS_URL}/flowpay/webhook`);
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(`${LOCAL_FUNCTIONS_URL}/flowpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    console.log('Status:', response.status);
    console.log('Response:', await response.text());

    if (response.ok) {
      console.log('✅ Webhook testado com sucesso!');
    } else {
      console.log('❌ Erro no webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
}

testWebhook(); 