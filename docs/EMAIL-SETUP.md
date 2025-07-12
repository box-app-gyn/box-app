# 📧 Configuração do Sistema de Emails

## 🎯 Visão Geral

O sistema de emails do Interbox 2025 envia automaticamente confirmações de pagamento para os atletas quando o pagamento é processado via FlowPay/OpenPix.

## 🔧 Configuração do Gmail

### 1. Ativar Verificação em 2 Etapas

1. Acesse: https://myaccount.google.com/security
2. Ative a "Verificação em duas etapas"
3. Isso é obrigatório para usar senhas de app

### 2. Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "Mail" como aplicativo
3. Clique em "Gerar"
4. **Copie a senha gerada** (16 caracteres)

### 3. Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```bash
# Email Configuration (Gmail SMTP)
EMAIL_USER=interbox2025@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_aqui
```

## 🧪 Testando o Sistema

### Teste Manual

```bash
npm run test:email
```

### Verificar Configuração

O script irá:
- ✅ Verificar se as variáveis estão configuradas
- ✅ Testar conexão com Gmail
- ✅ Enviar email de teste
- ✅ Mostrar logs detalhados

## 📧 Templates de Email

### Email de Confirmação de Pagamento

**Assunto:** `Pagamento Confirmado - Interbox 2025`

**Conteúdo:**
- ✅ Confirmação do pagamento
- 💰 Detalhes do valor e método
- 📅 Data do pagamento
- 🏆 Informações do time/categoria
- 📋 Próximos passos
- 📞 Contato para dúvidas

### Exemplo de Email

```
✅ Pagamento Confirmado - Interbox 2025

Olá [Nome do Atleta],

Seu pagamento foi processado com sucesso!

💰 Detalhes do Pagamento:
• Tipo: Inscrição de Time
• Valor: R$ 150,00
• Método: PIX
• Data: 15/01/2025
• Categoria: RX
• Time: Time Alpha

📅 Próximos Passos:
• Aguarde o email com as credenciais de acesso
• Participe dos grupos de WhatsApp para atualizações
• Fique atento às datas importantes do evento

Evento: 24, 25 e 26 de OUTUBRO de 2025

Obrigado por fazer parte do maior evento de times da América Latina!
```

## 🔄 Fluxo Automático

### 1. Pagamento Processado
- FlowPay/OpenPix processa o pagamento
- Webhook é chamado automaticamente

### 2. Atualização no Firestore
- Status muda para `paid`
- Campo `paidAt` é atualizado

### 3. Envio do Email
- Sistema busca dados do time/audiovisual
- Gera email personalizado
- Envia via Gmail SMTP
- Registra logs de sucesso/erro

## 🛠️ Solução de Problemas

### Erro: "EAUTH"
- Verificar se EMAIL_USER está correto
- Verificar se EMAIL_PASSWORD é senha de app válida
- Verificar se verificação em 2 etapas está ativa

### Erro: "ECONNECTION"
- Verificar conexão com internet
- Verificar se Gmail não está bloqueado

### Email não chega
- Verificar pasta de spam
- Verificar se email está correto no Firestore
- Verificar logs das functions

### Erro nas Functions
- Verificar logs no Firebase Console
- Verificar se variáveis estão configuradas nas functions
- Verificar se nodemailer está instalado

## 📊 Monitoramento

### Logs Importantes

```javascript
// Sucesso
logger.business('Email de pagamento enviado', { 
  userEmail: 'atleta@email.com',
  subject: 'Pagamento Confirmado - Interbox 2025' 
});

// Erro
logger.error('Erro ao enviar email de pagamento', { 
  error: 'Detalhes do erro',
  userEmail: 'atleta@email.com' 
});
```

### Métricas

- Emails enviados com sucesso
- Emails com erro
- Tempo de entrega
- Taxa de abertura (futuro)

## 🔒 Segurança

### Boas Práticas

- ✅ Usar senha de app (não senha normal)
- ✅ Verificação em 2 etapas obrigatória
- ✅ Variáveis de ambiente seguras
- ✅ Logs sem dados sensíveis
- ✅ Rate limiting nos emails

### Configurações Recomendadas

```bash
# Gmail
- Verificação em 2 etapas: ATIVADA
- Senha de app: GERADA
- Acesso a apps menos seguros: DESATIVADO

# Firebase Functions
- Variáveis de ambiente: CONFIGURADAS
- Logs: ESTRUTURADOS
- Rate limiting: ATIVO
```

## 🚀 Deploy

### 1. Configurar Variáveis nas Functions

```bash
firebase functions:config:set email.user="interbox2025@gmail.com" email.password="sua_senha_de_app"
```

### 2. Deploy das Functions

```bash
npm run deploy:functions
```

### 3. Testar em Produção

```bash
# Testar webhook
curl -X POST https://us-central1-interbox-app-8d400.cloudfunctions.net/api/flowpay/webhook \
  -H "Content-Type: application/json" \
  -d '{"charge":{"reference":"test-team-123","status":"COMPLETED"}}'
```

## 📞 Suporte

Para problemas com emails:
- Email: interbox2025@gmail.com
- Verificar logs no Firebase Console
- Testar com `npm run test:email` 