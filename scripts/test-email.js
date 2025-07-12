#!/usr/bin/env node

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 Testando envio de email...');

// Configuração do transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'interbox2025@gmail.com',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

// Template de email de teste
const testEmailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Teste de Email - Interbox 2025</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #10b981;">✅ Teste de Email - Interbox 2025</h2>
    
    <p>Olá,</p>
    <p>Este é um email de teste para verificar se o sistema de envio está funcionando corretamente.</p>
    
    <div style="background: #f0fdf4; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #065f46;">🧪 Detalhes do Teste:</h3>
      <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
      <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('pt-BR')}</p>
      <p><strong>Status:</strong> Funcionando ✅</p>
    </div>
    
    <p>Se você recebeu este email, o sistema está funcionando perfeitamente!</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        Este é um email de teste automático, não responda a esta mensagem.<br>
        Para dúvidas, entre em contato: interbox2025@gmail.com
      </p>
    </div>
  </div>
</body>
</html>
`;

async function testEmail() {
  try {
    // Verificar configurações
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Variáveis de ambiente não configuradas!');
      console.log('\n📋 Configure no arquivo .env:');
      console.log('EMAIL_USER=interbox2025@gmail.com');
      console.log('EMAIL_PASSWORD=sua_senha_de_app_aqui');
      console.log('\n💡 Para obter senha de app do Gmail:');
      console.log('1. Acesse: https://myaccount.google.com/apppasswords');
      console.log('2. Gere uma senha para "Mail"');
      console.log('3. Use essa senha no EMAIL_PASSWORD');
      return;
    }

    console.log('📧 Enviando email de teste...');
    console.log('De:', process.env.EMAIL_USER);
    console.log('Para:', process.env.EMAIL_USER); // Enviar para o mesmo email

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Teste enviando para o mesmo email
      subject: '🧪 Teste de Email - Interbox 2025',
      html: testEmailHTML
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Verifique sua caixa de entrada');
    console.log('2. Se recebeu o email, o sistema está funcionando');
    console.log('3. Se não recebeu, verifique as configurações do Gmail');
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Erro de autenticação!');
      console.log('Verifique:');
      console.log('1. Se o EMAIL_USER está correto');
      console.log('2. Se o EMAIL_PASSWORD é uma senha de app válida');
      console.log('3. Se a verificação em 2 etapas está ativada no Gmail');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Erro de conexão!');
      console.log('Verifique sua conexão com a internet');
    }
  }
}

// Executar teste
testEmail(); 