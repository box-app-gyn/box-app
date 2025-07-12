# 🚀 Desenvolvimento Sem PWA

Este guia mostra como desenvolver e testar o site sem as limitações do PWA.

## 📋 Opções de Desenvolvimento

### 1. Desenvolvimento Simples (Recomendado)
```bash
npm run dev:simple
```
- Inicia o servidor sem PWA
- Acesse: http://localhost:3000
- Página de teste: http://localhost:3000/teste-pagamento

### 2. Desenvolvimento Manual
```bash
npm run dev:no-pwa
```
- Usa configuração sem export estático
- API routes funcionam normalmente
- Sem limitações de PWA

### 3. Desenvolvimento PWA (Padrão)
```bash
npm run dev
```
- Com export estático
- Limitações de PWA
- API routes não funcionam

## 🧪 Páginas de Teste

### Teste de Pagamento
- **URL**: http://localhost:3000/teste-pagamento
- **Funcionalidade**: Teste completo de pagamento sem autenticação
- **Métodos**: PIX e Cartão de Crédito
- **Dados**: Time fictício para teste

### Pagamento Normal
- **URL**: http://localhost:3000/pagamento
- **Funcionalidade**: Pagamento com dados reais
- **Autenticação**: Opcional (modo anônimo disponível)

## 🔧 Build e Deploy

### Build Sem PWA
```bash
npm run build:no-pwa
```

### Deploy Sem PWA
```bash
npm run deploy:no-pwa
```

### Build PWA (Padrão)
```bash
npm run build
```

## 📱 Diferenças Entre Modos

| Funcionalidade | Sem PWA | Com PWA |
|----------------|---------|---------|
| API Routes | ✅ Funcionam | ❌ Não funcionam |
| Autenticação | ✅ Completa | ⚠️ Limitada |
| Pagamentos | ✅ Testáveis | ⚠️ Difícil de testar |
| Hot Reload | ✅ Rápido | ✅ Rápido |
| Deploy | ✅ Firebase Hosting | ✅ Firebase Hosting |

## 🎯 Vantagens do Modo Sem PWA

1. **Teste Fácil**: API routes funcionam normalmente
2. **Debug Simples**: Console do navegador sem limitações
3. **Desenvolvimento Rápido**: Sem rebuilds desnecessários
4. **Pagamentos Testáveis**: Webhook funciona localmente
5. **Flexibilidade**: Pode alternar entre modos facilmente

## 🔍 Troubleshooting

### Problema: Página não carrega
```bash
# Limpar cache
npm run clean:cache

# Reinstalar dependências
npm run clean:all
```

### Problema: API não funciona
- Verifique se está usando `dev:no-pwa`
- Confirme que não há export estático
- Teste com `curl http://localhost:3000/api/health`

### Problema: Pagamento não processa
- Verifique logs do webhook
- Confirme configuração do FlowPay
- Teste com dados fictícios primeiro

## 📞 Suporte

Para problemas específicos:
1. Use o modo sem PWA para desenvolvimento
2. Teste com a página `/teste-pagamento`
3. Verifique logs do console
4. Use o modo PWA apenas para produção 