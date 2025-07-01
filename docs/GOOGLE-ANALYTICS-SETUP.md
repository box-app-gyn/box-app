# Configuração do Google Analytics - CERRADØ INTERBOX 2025

## 📊 Visão Geral

Este projeto está configurado com Google Analytics 4 (GA4) para rastrear:
- **Pageviews** - Visualizações de páginas
- **Eventos** - Cliques, envios de formulário, scroll
- **Conversões** - CTAs, inscrições, downloads
- **Engajamento** - Tempo na página, interações
- **Eventos específicos** - Audiovisual, times, admin

## 🚀 Configuração Rápida

### 1. Criar Conta no Google Analytics

1. Acesse [Google Analytics](https://analytics.google.com/)
2. Clique em "Criar conta"
3. Nome da conta: `CERRADØ INTERBOX`
4. Clique em "Próximo"

### 2. Criar Propriedade

1. Nome da propriedade: `CERRADØ INTERBOX 2025`
2. Fuso horário: `America/Sao_Paulo`
3. Moeda: `Real brasileiro (BRL)`
4. Clique em "Próximo"

### 3. Configurar Propriedade

1. **Setor**: Entretenimento
2. **Tamanho da empresa**: Pequena empresa
3. **Como pretende usar o Google Analytics**: 
   - ✅ Rastrear conversões
   - ✅ Otimizar campanhas
   - ✅ Analisar comportamento do usuário
4. Clique em "Criar"

### 4. Configurar Stream de Dados

1. **Tipo de plataforma**: Web
2. **URL do site**: `https://seu-dominio.com`
3. **Nome do stream**: `CERRADØ INTERBOX Website`
4. Clique em "Criar stream"

### 5. Obter IDs

Após criar o stream, você receberá:
- **Measurement ID**: `G-XXXXXXXXXX`
- **Conversion ID**: `AW-XXXXXXXXXX` (para conversões)

## 🔧 Configuração no Projeto

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

```

### 2. Verificar Configuração

O Google Analytics já está configurado nos seguintes arquivos:
- `components/GoogleAnalytics.tsx` - Componente principal
- `hooks/useAnalytics.ts` - Hook para tracking
- `pages/_app.tsx` - Inicialização global

## 📈 Eventos Rastreados

### Eventos Automáticos
- ✅ **Pageviews** - Todas as páginas
- ✅ **Route Changes** - Navegação entre páginas

### Eventos de Conversão
```typescript
// Rastrear clique em CTA
trackCTA('ACESSAR A ARENA', '/');

// Rastrear envio de formulário
trackFormSubmit('formulario_audiovisual');

// Rastrear conversão específica
trackCerradoConversion('inscricao_evento');
```

### Eventos de Engajamento
```typescript
// Rastrear scroll
trackScroll('hero_section', 50);

// Rastrear download
trackDownload('kit_audiovisual.pdf');

// Rastrear compartilhamento
trackShare('whatsapp', 'evento_cerrado');
```

### Eventos Específicos
```typescript
// Audiovisual
trackAudiovisual('view_kit', 'kit_completo');

// Times
trackTimes('view_team', 'time_alpha');

// Admin
trackAdmin('login', 'admin_user');
```

## 🎯 Implementação em Componentes

### Exemplo: Botão CTA
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MeuComponente() {
  const { trackCTA } = useAnalytics();

  const handleClick = () => {
    trackCTA('QUERO PARTICIPAR', '/audiovisual');
    // resto da lógica...
  };

  return (
    <button onClick={handleClick}>
      Quero Participar
    </button>
  );
}
```

### Exemplo: Formulário
```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MeuFormulario() {
  const { trackFormSubmit } = useAnalytics();

  const handleSubmit = (e) => {
    e.preventDefault();
    trackFormSubmit('formulario_patrocinador');
    // envio do formulário...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do formulário */}
    </form>
  );
}
```

## 📊 Métricas Importantes

### Conversões Principais
1. **Inscrições no Evento** - Meta principal
2. **Downloads de Kit Audiovisual** - Engajamento
3. **Cliques em CTAs** - Interesse
4. **Tempo na Página** - Engajamento

### Funnels de Conversão
1. **Home → Audiovisual** - Interesse inicial
2. **Audiovisual → Formulário** - Intenção
3. **Formulário → Envio** - Conversão

## 🔍 Verificação

### 1. Verificar no Console
```javascript
// No console do navegador
window.gtag('event', 'test', {
  event_category: 'test',
  event_label: 'test'
});
```

### 2. Verificar no Google Analytics
1. Acesse Google Analytics
2. Vá em "Relatórios em tempo real"
3. Acesse o site
4. Verifique se aparece na lista

### 3. Verificar Tags
1. Instale a extensão "Google Analytics Debugger"
2. Acesse o site
3. Verifique se as tags estão sendo enviadas

## 🛠️ Troubleshooting

### Problema: Eventos não aparecem
**Solução:**
1. Verificar se `NEXT_PUBLIC_GA_MEASUREMENT_ID` está configurado
2. Verificar se está em produção (`NODE_ENV=production`)
3. Verificar console do navegador por erros

### Problema: Pageviews não rastreiam
**Solução:**
1. Verificar se o componente `GoogleAnalytics` está no `_app.tsx`
2. Verificar se o router está funcionando
3. Verificar se não há bloqueadores de analytics

### Problema: Conversões não funcionam
**Solução:**
1. Verificar se `NEXT_PUBLIC_GA_MEASUREMENT_ID` está configurado
2. Verificar se o ID de conversão está correto
3. Verificar se o evento está sendo disparado

## 📱 Configuração Mobile

O Google Analytics já está configurado para funcionar em dispositivos móveis com:
- ✅ Responsive design tracking
- ✅ Touch events
- ✅ Mobile-specific metrics

## 🔒 Privacidade e LGPD

### Configurações de Privacidade
- ✅ Anonimização de IPs
- ✅ Consentimento de cookies
- ✅ Dados não pessoais

### Implementação LGPD
```typescript
// Exemplo de consentimento
const handleConsent = (consent: boolean) => {
  if (consent) {
    // Habilitar analytics
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  }
};
```

## 📞 Suporte

Para dúvidas sobre configuração:
1. Verificar este documento
2. Consultar [Google Analytics Help](https://support.google.com/analytics)
3. Verificar logs do console
4. Testar em modo de desenvolvimento

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0
**Compatibilidade**: Next.js 14, GA4 