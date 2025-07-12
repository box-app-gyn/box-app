# Configuração PWA - CERRADØ INTERBOX

Este documento descreve a implementação completa de PWA (Progressive Web App) para o CERRADØ INTERBOX, com foco especial no comportamento nativo de app no iPhone.

## 🎯 Objetivos Alcançados

✅ **Manifest.json** configurado com todas as especificações PWA  
✅ **Meta tags iOS** para comportamento standalone  
✅ **Splash screens** para todos os dispositivos Apple  
✅ **Splash animation** com vídeo de intro  
✅ **Detecção iOS + Safari** com popup de instalação  
✅ **Funcionamento desktop/mobile** sem interferência  
✅ **Service Worker** para funcionalidades offline  
✅ **Notificações de atualização** automáticas  

## 📱 Funcionalidades Implementadas

### 1. Splash Screen Animada

- **Vídeo de intro**: `/public/videos/intro.mp4`
- **Fallback estático**: Logo + animação pulse
- **Duração**: 3-5 segundos
- **Transição suave** para o app

### 2. Detecção Inteligente de Dispositivo

- **iOS + Safari**: Mostra splash e prompt de instalação
- **Desktop/Android**: Funciona normalmente sem interferência
- **Modo standalone**: Não mostra splash (já instalado)

### 3. Prompt de Instalação

- **Aparece após 5 segundos** do splash
- **Instruções visuais** específicas para iOS
- **Benefícios destacados** da instalação
- **Botão "Agora não"** para dispensar

### 4. Instruções Visuais

- **3 passos claros** para instalação
- **Ícones explicativos** do Safari
- **Benefícios listados** da PWA
- **Design responsivo** e acessível

### 5. Service Worker

- **Cache inteligente** de recursos
- **Funcionamento offline** básico
- **Atualizações automáticas**
- **Notificações de nova versão**

## 🛠️ Arquivos Criados/Modificados

### Novos Componentes

```
components/
├── SplashScreen.tsx          # Splash com vídeo
├── PWAInstallPrompt.tsx      # Prompt de instalação
├── InstallInstructions.tsx   # Instruções visuais
└── UpdateNotification.tsx    # Notificação de atualização
```

### Novos Hooks

```
hooks/
└── usePWA.ts                 # Gerenciamento de estado PWA
```

### Configurações

```
lib/
└── pwa-config.ts             # Configuração centralizada PWA

public/
├── manifest.json             # Manifest PWA atualizado
├── sw.js                     # Service Worker
├── videos/
│   ├── intro.mp4             # Vídeo de intro (adicionar)
│   └── README.md             # Instruções de vídeo
└── images/splash/
    ├── README.md             # Instruções de splash screens
    └── [device]_landscape.png # Splash screens (gerar)
```

### Arquivos Modificados

```
pages/
└── _app.tsx                  # Integração PWA

components/
└── SEOHead.tsx               # Meta tags iOS adicionadas
```

## 📋 Checklist de Implementação

### ✅ Concluído

- [x] Manifest.json configurado
- [x] Meta tags iOS implementadas
- [x] Componentes PWA criados
- [x] Service Worker implementado
- [x] Detecção de dispositivo
- [x] Splash screen funcional
- [x] Prompt de instalação
- [x] Instruções visuais
- [x] Notificações de atualização
- [x] Configuração centralizada

### 🔄 Pendente (Arquivos Externos)

- [ ] Criar vídeo `intro.mp4` (3-5s, MP4, H.264)
- [ ] Gerar splash screens para todos os dispositivos iOS
- [ ] Otimizar imagens para web
- [ ] Testar em dispositivos reais

## 🎨 Como Adicionar o Vídeo de Intro

1. **Criar vídeo** com as especificações:
   - Formato: MP4
   - Codec: H.264
   - Resolução: 1920x1080 ou 1280x720
   - Duração: 3-5 segundos
   - Tamanho: Máximo 5MB

2. **Salvar como** `/public/videos/intro.mp4`

3. **Conteúdo sugerido**:
   - Logo CERRADØ INTERBOX
   - Animação de entrada suave
   - Texto "2025"
   - Transição para o app

## 🖼️ Como Gerar Splash Screens

1. **Usar ferramentas**:
   - Figma (recomendado)
   - Adobe Photoshop
   - Sketch
   - Online: https://www.apple.com/tool/

2. **Especificações**:
   - Fundo preto (#000000)
   - Logo centralizado
   - Dimensões específicas por dispositivo
   - Formato PNG otimizado

3. **Dispositivos suportados**:
   - iPhone 14 Pro Max (430x932)
   - iPhone 14 Pro (393x852)
   - iPhone 14 Plus (428x926)
   - iPhone 14 (390x844)
   - iPhone XS (375x812)
   - iPhone XR (414x896)
   - iPhone 8 (375x667)
   - iPhone SE (320x568)

## 🧪 Testando a Implementação

### Desktop
- Funciona normalmente
- Sem splash screen
- Sem prompt de instalação

### iOS + Safari

- Splash screen com vídeo
- Prompt de instalação após 5s
- Instruções visuais
- Comportamento de app nativo

### iOS + Chrome

- Funciona normalmente
- Sem splash screen
- Sem prompt de instalação

### Android

- Funciona normalmente
- Sem splash screen
- Sem prompt de instalação

## 🔧 Configurações Avançadas

### Personalizar Delays

```typescript
// lib/pwa-config.ts
export const PWA_CONFIG = {
  installPromptDelay: 2000,    // 2 segundos
  splashDelay: 3000,           // 3 segundos
  installInstructionsDelay: 5000, // 5 segundos
  // ...
};
```

### Adicionar Novos Shortcuts

```typescript
// lib/pwa-config.ts
shortcuts: [
  {
    name: 'Nova Funcionalidade',
    shortName: 'Nova',
    description: 'Descrição da funcionalidade',
    url: '/nova-pagina',
    icons: [{ src: '/logos/logo_circulo.png', sizes: '96x96' }]
  }
]
```

### Modificar Cache

```typescript
// lib/pwa-config.ts
cacheUrls: [
  '/',
  '/manifest.json',
  '/logos/logo_circulo.png',
  '/df.ico',
  '/styles/globals.css',
  '/nova-pagina'  // Adicionar novas páginas
]
```

## 🚀 Deploy e Produção

### Firebase Hosting

A implementação é compatível com Firebase Hosting e não requer configurações adicionais.

### HTTPS Obrigatório

PWA requer HTTPS em produção. Firebase Hosting já fornece isso automaticamente.

### Service Worker
O Service Worker será registrado automaticamente e funcionará em produção.

## 📊 Métricas e Analytics

### Eventos PWA
- `pwa_install_prompt_shown`: Prompt de instalação exibido
- `pwa_install_instructions_viewed`: Instruções visualizadas
- `pwa_splash_completed`: Splash screen finalizada
- `pwa_app_installed`: App instalado (detectado via standalone mode)

### Monitoramento
- Verificar logs do Service Worker
- Monitorar cache hits/misses
- Acompanhar taxa de instalação

## 🔍 Troubleshooting

### Splash não aparece
- Verificar se é iOS + Safari
- Verificar se não está em modo standalone
- Verificar se localStorage não marca como instalado

### Vídeo não carrega
- Verificar se `/public/videos/intro.mp4` existe
- Verificar formato e codec
- Fallback automático para splash estático

### Prompt não aparece
- Verificar detecção de dispositivo
- Verificar delays configurados
- Verificar se não está em modo standalone

### Service Worker não registra
- Verificar se HTTPS está ativo
- Verificar se arquivo `/public/sw.js` existe
- Verificar logs do console

## 📚 Recursos Adicionais

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [iOS PWA Guide](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

**Implementação concluída!** 🎉

O CERRADØ INTERBOX agora possui uma PWA completa com comportamento nativo de app no iPhone, mantendo total compatibilidade com desktop e outros dispositivos. 