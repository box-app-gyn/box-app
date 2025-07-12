#!/bin/bash

set -e

echo "🚀 Iniciando deploy do Interbox FlowPay..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script no diretório interbox-flowpay"
    exit 1
fi

# Verificar variáveis de ambiente
if [ -z "$OPENPIX_API_KEY" ]; then
    echo "⚠️  Aviso: OPENPIX_API_KEY não configurada"
fi

if [ -z "$WEBHOOK_URL" ]; then
    echo "⚠️  Aviso: WEBHOOK_URL não configurada"
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build..."
npm run build

# Deploy das functions
echo "☁️  Fazendo deploy das functions..."
npm run deploy:functions

# Registrar webhook (se configurado)
if [ ! -z "$WEBHOOK_URL" ] && [ ! -z "$OPENPIX_API_KEY" ]; then
    echo "🔗 Registrando webhook..."
    npm run register-webhook
else
    echo "⏭️  Pulando registro do webhook (variáveis não configuradas)"
fi

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente no Firebase Console"
echo "2. Teste o webhook com um pagamento"
echo "3. Execute 'npm run check-payments' para verificar pagamentos pendentes" 