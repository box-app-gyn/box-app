"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviaEmailBoasVindas = exports.enviaEmailConfirmacao = void 0;
const functions = __importStar(require("firebase-functions"));
const logger_1 = require("./utils/logger");
// Templates de email
const emailTemplates = {
    pedido: {
        subject: 'Pedido Confirmado - Interbox 2025',
        html: (data) => {
            var _a, _b, _c;
            return `
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
            <p><strong>Tipo:</strong> ${((_a = data.dadosAdicionais) === null || _a === void 0 ? void 0 : _a.tipo) || 'Ingresso'}</p>
            <p><strong>Quantidade:</strong> ${((_b = data.dadosAdicionais) === null || _b === void 0 ? void 0 : _b.quantidade) || 1}</p>
            <p><strong>Valor Total:</strong> R$ ${((_c = data.dadosAdicionais) === null || _c === void 0 ? void 0 : _c.valorTotal) || '0,00'}</p>
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
    `;
        }
    },
    audiovisual: {
        subject: 'Status da Inscrição - Interbox 2025',
        html: (data) => {
            var _a, _b, _c;
            const aprovado = (_a = data.dadosAdicionais) === null || _a === void 0 ? void 0 : _a.aprovado;
            const tipo = ((_b = data.dadosAdicionais) === null || _b === void 0 ? void 0 : _b.tipo) || 'Profissional Audiovisual';
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
                ${((_c = data.dadosAdicionais) === null || _c === void 0 ? void 0 : _c.motivoRejeicao) ? `
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
        html: (data) => {
            var _a;
            return `
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
            <p>${((_a = data.dadosAdicionais) === null || _a === void 0 ? void 0 : _a.message) || 'Você tem uma notificação do Interbox 2025.'}</p>
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
    `;
        }
    }
};
// Função para enviar email de confirmação
exports.enviaEmailConfirmacao = functions.https.onCall(async (data, context) => {
    var _a;
    const contextData = { userId: (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid };
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
        logger_1.logger.business('Email de confirmação gerado', {
            userEmail: data.userEmail,
            tipo: data.tipo,
            subject: template.subject
        }, contextData);
        return {
            success: true,
            message: 'Email de confirmação enviado com sucesso',
            subject: template.subject
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao enviar email de confirmação', { error: errorMessage }, contextData);
        throw error;
    }
});
// Função para enviar email de boas-vindas
const enviaEmailBoasVindas = async (data) => {
    const contextData = { userId: undefined };
    try {
        if (!data.userEmail) {
            logger_1.logger.warn('Email não fornecido para boas-vindas', {}, contextData);
            return;
        }
        const template = emailTemplates.admin;
        // TODO: Implementar envio real de email
        logger_1.logger.business('Email de boas-vindas gerado', {
            userEmail: data.userEmail,
            subject: template.subject
        }, contextData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger_1.logger.error('Erro ao enviar email de boas-vindas', { error: errorMessage }, contextData);
    }
};
exports.enviaEmailBoasVindas = enviaEmailBoasVindas;
//# sourceMappingURL=emails.js.map