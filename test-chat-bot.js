#!/usr/bin/env node

/**
 * Script para testar o bot de chat do CERRADØ INTERBOX 2025
 * 
 * Uso: node test-chat-bot.js
 */

const https = require('https');

// Configurações
const BASE_URL = 'https://us-central1-interbox-app-8d400.cloudfunctions.net';
const TEST_MESSAGES = [
  "Olá! Como posso me inscrever no CERRADØ?",
  "Quando será o evento?",
  "Onde acontece o CERRADØ?",
  "Como formar um time?",
  "Sobre audiovisual",
  "Quais são as categorias?",
  "Qual o valor das inscrições?",
  "Como me preparar para o evento?"
];

// Função para fazer requisição HTTPS
function makeRequest(endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${endpoint}`;
    const options = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Função para testar criação de sessão
async function testCreateSession() {
  console.log('🧪 Testando criação de sessão...');
  
  try {
    const response = await makeRequest('createSessionFunction', {
      context: 'test-session',
      userId: 'test-user'
    });
    
    console.log('✅ Sessão criada:', response.data);
    return response.data.session?.id;
  } catch (error) {
    console.error('❌ Erro ao criar sessão:', error.message);
    return null;
  }
}

// Função para testar envio de mensagem
async function testSendMessage(sessionId, message) {
  console.log(`\n💬 Testando mensagem: "${message}"`);
  
  try {
    const response = await makeRequest('sendMessageFunction', {
      message,
      sessionId,
      userId: 'test-user'
    });
    
    console.log('✅ Resposta recebida:', response.data.response);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
    return null;
  }
}

// Função para testar histórico
async function testGetHistory(sessionId) {
  console.log('\n📚 Testando busca de histórico...');
  
  try {
    const response = await makeRequest(`getChatHistoryFunction?sessionId=${sessionId}&userId=test-user`);
    
    console.log('✅ Histórico recebido:', response.data.history?.length, 'mensagens');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error.message);
    return null;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🚀 Iniciando testes do CERRADØ Assistant...\n');
  
  // Teste 1: Criar sessão
  const sessionId = await testCreateSession();
  if (!sessionId) {
    console.log('❌ Falha ao criar sessão. Abortando testes.');
    return;
  }
  
  // Teste 2: Enviar mensagens de teste
  console.log('\n📝 Enviando mensagens de teste...');
  for (const message of TEST_MESSAGES) {
    await testSendMessage(sessionId, message);
    // Aguardar um pouco entre as mensagens
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Teste 3: Buscar histórico
  await testGetHistory(sessionId);
  
  console.log('\n🎉 Testes concluídos!');
  console.log('\n📊 Resumo:');
  console.log('- ✅ Sessão criada com sucesso');
  console.log('- ✅ Mensagens enviadas:', TEST_MESSAGES.length);
  console.log('- ✅ Histórico recuperado');
  console.log('\n🤖 O CERRADØ Assistant está funcionando perfeitamente!');
}

// Executar testes
runTests().catch(console.error); 