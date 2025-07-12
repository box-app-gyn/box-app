import * as functions from 'firebase-functions/v2';
import * as nodemailer from 'nodemailer';
import { logger } from './utils/logger';

interface EmailConfirmacaoData {
  userEmail: string;
  userName: string;
  tipo: 'pedido' | 'audiovisual' | 'admin' | 'pagamento';
  dadosAdicionais?: Record<string, any>;
}

// Configuração do transporter de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'interbox2025@gmail.com',
      pass: process.env.EMAIL_PASSWORD || ''
    }
  });
};

// Templates de email
const emailTemplates = {
  pedido: {
    subject: 'Pedido Confirmado - Interbox 2025',
    html: (data: EmailConfirmacaoData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido Confirmado - Interbox 2025</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec4899;">🎫 Pedido Confirmado - Interbox 2025</h2>
          
          <p>Olá ${data.userName},</p>
          <p>Seu pedido foi confirmado com sucesso!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Detalhes do Pedido:</h3>
            <p><strong>Tipo:</strong> ${data.dadosAdicionais?.tipo || 'Ingresso'}</p>
            <p><strong>Quantidade:</strong> ${data.dadosAdicionais?.quantidade || 1}</p>
            <p><strong>Valor Total:</strong> R$ ${data.dadosAdicionais?.valorTotal || '0,00'}</p>
          </div>
          
          <p>Em breve você receberá instruções para pagamento via PIX.</p>
          <p>Obrigado por fazer parte do maior evento de times da América Latina!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  audiovisual: {
    subject: 'Inscrição Audiovisual Confirmada - Interbox 2025',
    html: (data: EmailConfirmacaoData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inscrição Audiovisual Confirmada - Interbox 2025</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec4899;">📹 Inscrição Audiovisual Confirmada - Interbox 2025</h2>
          
          <p>Olá ${data.userName},</p>
          <p>Sua inscrição como profissional audiovisual foi confirmada!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Detalhes da Inscrição:</h3>
            <p><strong>Área:</strong> ${data.dadosAdicionais?.area || 'Audiovisual'}</p>
            <p><strong>Valor:</strong> R$ ${data.dadosAdicionais?.valor || '29,90'}</p>
            <p><strong>Status:</strong> ${data.dadosAdicionais?.status || 'Confirmado'}</p>
          </div>
          
          <p>Em breve você receberá instruções para pagamento via PIX.</p>
          <p>Obrigado por fazer parte do maior evento de times da América Latina!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  pagamento: {
    subject: 'Pagamento Confirmado - Interbox 2025',
    html: (data: EmailConfirmacaoData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pagamento Confirmado - Interbox 2025</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">✅ Pagamento Confirmado - Interbox 2025</h2>
          
          <p>Olá ${data.userName},</p>
          <p>Seu pagamento foi processado com sucesso!</p>
          
          <div style="background: #f0fdf4; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46;">💰 Detalhes do Pagamento:</h3>
            <p><strong>Tipo:</strong> ${data.dadosAdicionais?.tipo || 'Inscrição'}</p>
            <p><strong>Valor:</strong> R$ ${data.dadosAdicionais?.valor || '0,00'}</p>
            <p><strong>Método:</strong> ${data.dadosAdicionais?.metodo || 'PIX'}</p>
            <p><strong>Data:</strong> ${data.dadosAdicionais?.data || new Date().toLocaleDateString('pt-BR')}</p>
            ${data.dadosAdicionais?.categoria ? `<p><strong>Categoria:</strong> ${data.dadosAdicionais.categoria}</p>` : ''}
            ${data.dadosAdicionais?.time ? `<p><strong>Time:</strong> ${data.dadosAdicionais.time}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e;">📅 Próximos Passos:</h3>
            <p>• Aguarde o email com as credenciais de acesso</p>
            <p>• Participe dos grupos de WhatsApp para atualizações</p>
            <p>• Fique atento às datas importantes do evento</p>
          </div>
          
          <p><strong>Evento:</strong> 24, 25 e 26 de OUTUBRO de 2025</p>
          <p>Obrigado por fazer parte do maior evento de times da América Latina!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Este é um email automático, não responda a esta mensagem.<br>
              Para dúvidas, entre em contato: interbox2025@gmail.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  admin: {
    subject: 'Interbox 2025 - Notificação',
    html: (data: EmailConfirmacaoData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interbox 2025 - Notificação</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec4899;">🎯 Interbox 2025</h2>
          
          <p>Olá ${data.userName},</p>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e;">📢 Notificação Importante</h3>
            <p>${data.dadosAdicionais?.message || 'Você tem uma notificação do Interbox 2025.'}</p>
          </div>
          
          <p>Fique atento às próximas atualizações!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Função para enviar email
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'interbox2025@gmail.com',
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.business('Email enviado com sucesso', { 
      messageId: info.messageId,
      to,
      subject 
    });
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email', { error: errorMessage, to, subject });
    return false;
  }
}

// Função para enviar email de confirmação
export const enviaEmailConfirmacao = functions.https.onCall(async (request) => {
  const data = request.data as EmailConfirmacaoData;
  const auth = request.auth;
  const contextData = { userId: auth?.uid };
  
  try {
    // Validar dados
    if (!data.userEmail || !data.userName || !data.tipo) {
      throw new functions.https.HttpsError('invalid-argument', 'Dados obrigatórios ausentes');
    }

    // Validar tipo de email
    if (!emailTemplates[data.tipo]) {
      throw new functions.https.HttpsError('invalid-argument', 'Tipo de email inválido');
    }

    const template = emailTemplates[data.tipo];
    const html = template.html(data);

    // Enviar email
    const success = await sendEmail(data.userEmail, template.subject, html);

    if (success) {
      return { 
        success: true, 
        message: 'Email de confirmação enviado com sucesso',
        subject: template.subject 
      };
    } else {
      throw new functions.https.HttpsError('internal', 'Erro ao enviar email');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de confirmação', { error: errorMessage }, contextData);
    throw error;
  }
});

// Função para enviar email de confirmação de pagamento
export const enviaEmailPagamento = async (data: EmailConfirmacaoData): Promise<boolean> => {
  const contextData = { userId: undefined };
  
  try {
    if (!data.userEmail || !data.userName) {
      logger.warn('Dados insuficientes para email de pagamento', { data }, contextData);
      return false;
    }

    const template = emailTemplates.pagamento;
    const html = template.html(data);

    const success = await sendEmail(data.userEmail, template.subject, html);

    if (success) {
      logger.business('Email de pagamento enviado', { 
        userEmail: data.userEmail,
        subject: template.subject 
      }, contextData);
    }

    return success;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de pagamento', { error: errorMessage }, contextData);
    return false;
  }
};

// Função para enviar email de boas-vindas
export const enviaEmailBoasVindas = async (data: EmailConfirmacaoData) => {
  const contextData = { userId: undefined };
  
  try {
    if (!data.userEmail) {
      logger.warn('Email não fornecido para boas-vindas', {}, contextData);
      return;
    }

    const template = emailTemplates.admin;
    const html = template.html(data);

    const success = await sendEmail(data.userEmail, template.subject, html);

    if (success) {
      logger.business('Email de boas-vindas enviado', { 
        userEmail: data.userEmail,
        subject: template.subject 
      }, contextData);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de boas-vindas', { error: errorMessage }, contextData);
  }
}; 