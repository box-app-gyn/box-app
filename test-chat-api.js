import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/interbox-app-8d400/us-central1';

async function testChatAPI() {
  console.log('🧪 Testando API de Chat...\n');

  try {
    // 1. Criar sessão
    console.log('1️⃣ Criando sessão...');
    const sessionResponse = await fetch(`${BASE_URL}/createSessionFunction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: 'cerrado-interbox-2025',
        userId: 'test-user'
      })
    });

    const sessionData = await sessionResponse.json();
    console.log('✅ Sessão criada:', sessionData.session.id);
    const sessionId = sessionData.session.id;

    // 2. Enviar mensagem
    console.log('\n2️⃣ Enviando mensagem...');
    const messageResponse = await fetch(`${BASE_URL}/sendMessageFunction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Quando são as inscrições do CERRADØ?',
        sessionId: sessionId,
        userId: 'test-user'
      })
    });

    const messageData = await messageResponse.json();
    console.log('✅ Resposta da IA:', messageData.response);
    const messageId = messageData.messageId;

    // 3. Buscar histórico
    console.log('\n3️⃣ Buscando histórico...');
    const historyResponse = await fetch(`${BASE_URL}/getChatHistoryFunction?sessionId=${sessionId}&userId=test-user`);
    const historyData = await historyResponse.json();
    console.log('✅ Histórico:', historyData.history.length, 'mensagens');

    // 4. Salvar feedback
    console.log('\n4️⃣ Salvando feedback...');
    const feedbackResponse = await fetch(`${BASE_URL}/saveFeedbackFunction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        messageId: messageId,
        rating: 5,
        feedback: 'Resposta muito útil!',
        userId: 'test-user'
      })
    });

    const feedbackData = await feedbackResponse.json();
    console.log('✅ Feedback salvo:', feedbackData.message);

    // 5. Testar polling
    console.log('\n5️⃣ Testando polling...');
    const pollResponse = await fetch(`${BASE_URL}/pollMessagesFunction?sessionId=${sessionId}&userId=test-user&lastMessageId=${messageId}`);
    const pollData = await pollResponse.json();
    console.log('✅ Novas mensagens:', pollData.messages.length);

    console.log('\n🎉 Todos os testes passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Executar testes
testChatAPI(); 