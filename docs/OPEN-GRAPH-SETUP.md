# Configuração Open Graph - CERRADØ INTERBOX 2025

## ✅ Configuração Implementada

### 📸 **Imagem OG**

- **Arquivo**: `/public/images/og-interbox.png`
- **Dimensões**: 1200x630px (formato recomendado)
- **Formato**: PNG
- **Cache**: Configurado para 1 ano

### 🎯 **Páginas Configuradas**

#### **1. Home (/)**

```html
<title>CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina</title>
<meta property="og:title" content="CERRADØ INTERBOX 2025 - O Maior Evento de Times da América Latina" />
<meta property="og:description" content="24, 25 e 26 de outubro. O CERRADØ INTERBOX vai além da arena. Aqui você não se inscreve. Você assume seu chamado." />
<meta property="og:image" content="https://cerradointerbox.com.br/images/og-interbox.png" />
```

#### **2. Audiovisual (/audiovisual)**

```html
<title>Audiovisual & Creators - CERRADØ INTERBOX 2025</title>
<meta property="og:title" content="Audiovisual & Creators - CERRADØ INTERBOX 2025" />
<meta property="og:description" content="Faça parte da equipe audiovisual do CERRADØ INTERBOX 2025. Estamos reunindo criadores para eternizar a intensidade do maior evento de times da América Latina." />
```

#### **3. Times (/times)**

```html
<title>Para Atletas - CERRADØ INTERBOX 2025</title>
<meta property="og:title" content="Para Atletas - CERRADØ INTERBOX 2025" />
<meta property="og:description" content="Pronto para competir com propósito? O CERRADØ INTERBOX vai além da arena. Aqui começa o ritual. Forme seu time e entre pra arena." />
```

#### **4. Formulário (/audiovisual/form)**

```html
<title>Candidatura Audiovisual - CERRADØ INTERBOX 2025</title>
<meta property="og:title" content="Candidatura Audiovisual - CERRADØ INTERBOX 2025" />
<meta property="og:description" content="Candidate-se para fazer parte da equipe audiovisual do CERRADØ INTERBOX 2025. Eternize a intensidade do maior evento de times da América Latina." />
```

## 🔧 **Componente SEOHead**

### **Funcionalidades:**

- ✅ **Open Graph** (Facebook, LinkedIn)
- ✅ **Twitter Cards**
- ✅ **Schema.org** (Structured Data)
- ✅ **Meta tags** básicas
- ✅ **Performance** (preconnect, dns-prefetch)
- ✅ **Favicon** e Apple Touch Icon

### **Uso:**

```typescript
import SEOHead from '@/components/SEOHead';

<SEOHead 
  title="Título da Página"
  description="Descrição da página"
  image="/images/og-interbox.png"
  type="website"
/>
```

## 🧪 **Como Testar**

### **1. Facebook Sharing Debugger**

1. Acesse: https://developers.facebook.com/tools/debug/
2. Cole a URL: `https://cerradointerbox.com.br`
3. Clique em "Debug"
4. Verifique se a imagem aparece corretamente

### **2. Twitter Card Validator**
1. Acesse: https://cards-dev.twitter.com/validator
2. Cole a URL: `https://cerradointerbox.com.br`
3. Clique em "Preview card"
4. Verifique se o card aparece corretamente

### **3. LinkedIn Post Inspector**
1. Acesse: https://www.linkedin.com/post-inspector/
2. Cole a URL: `https://cerradointerbox.com.br`
3. Clique em "Inspect"
4. Verifique se a imagem aparece corretamente

### **4. WhatsApp**
1. Abra o WhatsApp
2. Compartilhe o link: `https://cerradointerbox.com.br`
3. Verifique se a imagem aparece no preview

### **5. Telegram**
1. Abra o Telegram
2. Cole o link: `https://cerradointerbox.com.br`
3. Verifique se a imagem aparece no preview

## 📱 **Redes Sociais Suportadas**

### **✅ Funcionando:**
- **Facebook** - Open Graph
- **Instagram** - Open Graph (stories)
- **Twitter** - Twitter Cards
- **LinkedIn** - Open Graph
- **WhatsApp** - Open Graph
- **Telegram** - Open Graph
- **Discord** - Open Graph
- **Slack** - Open Graph

### **📊 Métricas de Compartilhamento:**
- **Engajamento** - Visualizações da imagem OG
- **CTR** - Click-through rate
- **Conversões** - Visitas vindas de redes sociais

## 🎨 **Especificações da Imagem OG**

### **Dimensões Recomendadas:**
- **Facebook**: 1200x630px
- **Twitter**: 1200x600px
- **LinkedIn**: 1200x627px
- **WhatsApp**: 300x300px (mínimo)

### **Formato:**
- **PNG** - Melhor qualidade
- **JPG** - Menor tamanho
- **WebP** - Moderno (suporte limitado)

### **Conteúdo da Imagem:**
- **Logo** CERRADØ INTERBOX
- **Data**: 24, 25 e 26 de outubro
- **Título**: CERRADØ INTERBOX 2025
- **Subtítulo**: O Maior Evento de Times da América Latina

## 🔍 **Troubleshooting**

### **Problema: Imagem não aparece**
**Soluções:**
1. Verificar se o arquivo existe em `/public/images/og-interbox.png`
2. Verificar se a URL está correta
3. Limpar cache das redes sociais
4. Verificar headers de cache

### **Problema: Título/descrição incorretos**
**Soluções:**
1. Verificar se o componente SEOHead está sendo usado
2. Verificar se as props estão corretas
3. Limpar cache do navegador
4. Verificar se não há conflitos de meta tags

### **Problema: Cache antigo**
**Soluções:**
1. Usar Facebook Sharing Debugger para forçar refresh
2. Adicionar parâmetro `?v=2` na URL
3. Aguardar 24h para cache expirar
4. Verificar headers de cache

## 🚀 **Otimizações Futuras**

### **1. Imagens Dinâmicas**
```typescript
// Gerar OG dinamicamente baseado no conteúdo
const generateOGImage = (title: string, subtitle: string) => {
  // Usar Canvas API ou serviço externo
};
```

### **2. A/B Testing**
```typescript
// Testar diferentes imagens OG
const ogImages = [
  '/images/og-interbox.png',
  '/images/og-interbox-alt.png',
  '/images/og-interbox-dark.png'
];
```

### **3. Analytics de Compartilhamento**
```typescript
// Rastrear compartilhamentos
trackSocialShare('facebook', 'home_page');
trackSocialShare('whatsapp', 'audiovisual_page');
```

## 📊 **Monitoramento**

### **Ferramentas Recomendadas:**
- **Google Analytics** - Tráfego de redes sociais
- **Facebook Insights** - Engajamento no Facebook
- **Twitter Analytics** - Impressões e cliques
- **LinkedIn Analytics** - Visualizações de posts

### **Métricas Importantes:**
- **Social Traffic** - Visitas vindas de redes sociais
- **Share Rate** - Taxa de compartilhamento
- **Engagement Rate** - Taxa de engajamento
- **Conversion Rate** - Taxa de conversão

---

**Status**: ✅ Configurado e Funcionando
**Última atualização**: Janeiro 2025
**Versão**: 1.0 