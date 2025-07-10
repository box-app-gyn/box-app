import * as functions from 'firebase-functions/v2';
import { logger } from './utils/logger';

interface EmailConfirmacaoData {
  userEmail: string;
  userName: string;
  tipo: 'pedido' | 'audiovisual' | 'admin';
  dadosAdicionais?: Record<string, any>;
}

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
    subject: 'Status da Inscrição - Interbox 2025',
    html: (data: EmailConfirmacaoData) => {
      const aprovado = data.dadosAdicionais?.aprovado;
      const tipo = data.dadosAdicionais?.tipo || 'Profissional Audiovisual';
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Status da Inscrição - Interbox 2025</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ec4899;">📸 Status da Inscrição - Interbox 2025</h2>
            
            <p>Olá ${data.userName},</p>
            
            ${aprovado ? `
              <div style="background: #dcfce7; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #166534;">✅ Inscrição Aprovada!</h3>
                <p>Parabéns! Sua inscrição como ${tipo} foi aprovada.</p>
                <p>Você está oficialmente credenciado para o Interbox 2025!</p>
              </div>
            ` : `
              <div style="background: #fef2f2; border: 1px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #991b1b;">❌ Inscrição Não Aprovada</h3>
                <p>Infelizmente sua inscrição não foi aprovada no momento.</p>
                ${data.dadosAdicionais?.motivoRejeicao ? `
                  <p><strong>Motivo:</strong> ${data.dadosAdicionais.motivoRejeicao}</p>
                ` : ''}
              </div>
            `}
            
            <p>Em caso de dúvidas, entre em contato conosco.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                Este é um email automático, não responda a esta mensagem.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
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

    // TODO: Implementar envio real de email
    // Por enquanto, apenas log
    logger.business('Email de confirmação gerado', { 
      userEmail: data.userEmail, 
      tipo: data.tipo,
      subject: template.subject 
    }, contextData);

    return { 
      success: true, 
      message: 'Email de confirmação enviado com sucesso',
      subject: template.subject 
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de confirmação', { error: errorMessage }, contextData);
    throw error;
  }
});

// Função para enviar email de boas-vindas
export const enviaEmailBoasVindas = async (data: EmailConfirmacaoData) => {
  const contextData = { userId: undefined };
  
  try {
    if (!data.userEmail) {
      logger.warn('Email não fornecido para boas-vindas', {}, contextData);
      return;
    }

    const template = emailTemplates.admin;

    // TODO: Implementar envio real de email
    logger.business('Email de boas-vindas gerado', { 
      userEmail: data.userEmail,
      subject: template.subject 
    }, contextData);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    logger.error('Erro ao enviar email de boas-vindas', { error: errorMessage }, contextData);
  }
}; 