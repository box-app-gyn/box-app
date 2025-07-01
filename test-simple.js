import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/interbox-app-8d400/us-central1';

async function testSimple() {
  console.log('🧪 Teste simples da API...\n');

  try {
    // Testar se o endpoint responde
    console.log('1️⃣ Testando endpoint de criação de sessão...');
    const response = await fetch(`${BASE_URL}/createSessionFunction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: 'test',
        userId: 'test-user'
      })
    });

    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testSimple(); 