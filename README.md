# CERRADØ INTERBOX 2025

**O Maior Evento de Times da América Latina** - 24, 25 e 26 de outubro

Plataforma PWA nativa para inscrições, gestão de times e experiência mobile otimizada.

## 🎯 Sobre o Projeto

O CERRADØ INTERBOX vai além da arena. Aqui você não se inscreve. Você assume seu chamado.

- **PWA Mobile-First**: Experiência nativa em dispositivos móveis
- **Fluxo de Inscrição Nativo**: Jornada multi-step com animações
- **Gestão de Times**: Sistema completo de times e competições
- **Integração FlowPay**: Pagamentos PIX integrados
- **App Hosting**: Deploy otimizado no Google Cloud Run

## 📚 Documentação e Guias

Todos os guias de setup, administração e scripts estão organizados na pasta [`docs/`](./docs):

- [Guia de Admins](./docs/ADMIN-USERS-SETUP.md)
- [Setup de Coleções](./docs/COLLECTIONS-SETUP.md)
- [Guia MFA](./docs/MFA-SETUP-GUIDE.md)
- [População de Coleções](./docs/POPULATE-COLLECTIONS.md)
- [Guia Rápido](./docs/QUICK-SETUP.md)
- [Guia de Adição de Admins Existentes](./docs/ADD-EXISTING-ADMINS.md)
- [Guia Completo de Admin](./docs/ADMIN-SETUP-GUIDE.md)

## 🚀 Stack Tecnológica

### Frontend & PWA
- **Next.js 15** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Framer Motion** - Animações fluidas
- **PWA** - Progressive Web App nativo

### Backend & Infraestrutura
- **Firebase App Hosting** - Deploy no Google Cloud Run
- **Firebase Auth** - Autenticação e MFA
- **Firestore** - Banco de dados NoSQL
- **Cloud Functions** - Backend serverless
- **Vertex AI** - Chatbot inteligente

### Pagamentos & Integrações
- **FlowPay** - Processamento PIX
- **Google Analytics** - Métricas e tracking
- **App Hub** - Monitoramento centralizado

### DevOps & Deploy
- **GitHub Actions** - CI/CD automático
- **Cloud Build** - Build otimizado
- **Cloud Run** - Container serverless
- **App Hosting** - Deploy automático

## 📁 Estrutura do Projeto

```
/cerrado-app
├── /pages                    # Páginas da aplicação
│   ├── index.tsx            # Home com modal de inscrição
│   ├── login.tsx            # Autenticação
│   ├── admin.tsx            # Painel administrativo
│   ├── dashboard.tsx        # Dashboard de usuários
│   ├── audiovisual.tsx      # Cadastro audiovisual
│   ├── times.tsx            # Gestão de times
│   ├── api/                 # API Routes
│   │   ├── chat.ts          # Chatbot Vertex AI
│   │   └── health.ts        # Health check
│   └── _error.tsx           # Página de erro
├── /components              # Componentes reutilizáveis
│   ├── Header.tsx           # Header com menu mobile
│   ├── Hero.tsx             # Seção principal
│   ├── CallToAction.tsx     # Formulários de contato
│   ├── VideoSplashScreen.tsx # Splash com vídeo
│   ├── InstallBanner.tsx    # Banner PWA
│   └── ...                  # Outros componentes
├── /hooks                   # Custom hooks
│   ├── useAuth.ts           # Autenticação
│   ├── usePWA.ts            # Funcionalidades PWA
│   ├── useChat.ts           # Chatbot
│   └── useGamification.ts   # Gamificação
├── /lib                     # Configurações
│   ├── firebase.ts          # Config Firebase
│   ├── firestore.ts         # Config Firestore
│   └── vertex-ai.ts         # Config Vertex AI
├── /types                   # Tipos TypeScript
├── /constants               # Constantes
├── /utils                   # Utilitários
├── /styles                  # Estilos globais
├── /public                  # Assets públicos
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service Worker
│   └── images/              # Imagens
├── apphosting.yaml          # Config App Hosting
├── monitoring.yaml          # Config monitoramento
├── firebase.json            # Config Firebase
└── next.config.js           # Config Next.js
```

## 🛠️ Setup e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- Firebase CLI
- Google Cloud CLI
- Git

### Setup Local
1. **Clone o repositório**
```bash
git clone https://github.com/box-app-gyn/box-app.git
cd box-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env.local
# Edite .env.local com suas credenciais
```

4. **Execute o projeto**
```bash
npm run dev
```

### Setup Firebase App Hosting
1. **Configure o Firebase CLI**
```bash
firebase login
firebase use interbox-app-8d400
```

2. **Configure o App Hosting**
```bash
firebase apphosting:backends:list
firebase deploy --only apphosting:git-box-app
```

## 🔧 Padrões de Trabalho e Descobertas

### 🚀 Deploy e Infraestrutura

#### **Firebase App Hosting vs Hosting Tradicional**
- **App Hosting**: Para SSR Next.js (recomendado)
- **Hosting Tradicional**: Para SPAs estáticas
- **Configuração correta**: Use apenas App Hosting para Next.js

#### **Deploy Direto (Recomendado)**
Para evitar dependência do GitHub Actions e ter controle total:

```bash
# Deploy direto (sem GitHub)
npm run deploy:direct

# Deploy com rollout gradual (10% tráfego)
npm run deploy:rollout

# Deploy completo (app + funções)
npm run deploy:full
```

#### **Vantagens do Deploy Direto**
- ✅ **Independência**: Não depende do GitHub Actions
- ✅ **Controle total**: Você decide quando e como
- ✅ **Rollback fácil**: Volta para versão anterior se necessário
- ✅ **Deploy gradual**: Testa com poucos usuários primeiro
- ✅ **Limpeza automática**: Remove arquivos macOS automaticamente

#### **Configuração do firebase.json**
```json
{
  "apphosting": {
    "backends": [
      {
        "backendId": "git-box-app",
        "source": "."
      }
    ]
  }
}
```

#### **Deploy Manual vs GitHub Actions**
- **Deploy Direto**: `npm run deploy:direct` (recomendado)
- **GitHub Actions**: Deploy automático após push/merge (opcional)
- **Rollout**: Para deploys graduais e seguros

### 🛡️ Sistema de Proteção macOS

#### **Problema dos Arquivos Ocultos**
O macOS cria automaticamente arquivos ocultos (`._*`, `.DS_Store`) que podem quebrar o build do Next.js.

#### **Soluções Implementadas**
```bash
# Limpar arquivos existentes
npm run clean:macos

# Configurar proteção
npm run prevent:macos

# Setup completo
npm run setup:macos
```

#### **Proteção Automática**
- **Git Hook**: Limpeza automática antes de cada commit
- **.gitignore**: Configurado para ignorar arquivos macOS
- **.gitattributes**: Configurações de linha e metadados

### 📱 PWA e Mobile-First

#### **Configurações PWA**
- **manifest.json**: Configuração completa do app
- **Service Worker**: Cache e offline
- **Meta tags Apple**: Para iOS
- **Splash screen**: Com vídeo de intro

#### **Experiência Mobile**
- **Header simplificado**: Menu hambúrguer único
- **Orientação fixa**: Portrait apenas
- **Touch-friendly**: Botões e interações otimizadas
- **Instalação nativa**: Banners e prompts automáticos

### 🎨 UX/UI e Animações

#### **Fluxo de Inscrição Nativo**
- **Modal automático**: Aparece após splash screen
- **Multi-step**: Seleção → Resumo → Formulário → PIX → Confirmação
- **Animações**: Framer Motion para transições fluidas
- **Estados visuais**: Loading, processamento, confirmação

#### **Componentes Otimizados**
- **Header**: Indicador de usuário logado + botão logout destacado
- **Splash Screen**: Vídeo de intro com transição suave
- **Formulários**: Validação em tempo real
- **QR Code PIX**: Timer e instruções

### 🔐 Segurança e Autenticação

#### **Configurações de Segurança**
- **security.txt**: Políticas de segurança
- **Headers**: X-Frame-Options, CSP, etc.
- **MFA**: Autenticação de dois fatores
- **Rate limiting**: Proteção contra spam

#### **Variáveis de Ambiente**
- **Desenvolvimento**: `.env.local`
- **Produção**: Firebase Console Secrets
- **GitHub Actions**: Secrets do repositório
- **Nunca commitar**: Arquivos `.env*`

### 📊 Monitoramento e Performance

#### **Cloud Run Otimizações**
- **Recursos**: 1 CPU, 1GB RAM
- **Escalonamento**: 1-20 instâncias
- **Latência**: < 10ms
- **Cache**: 1 hora + stale-while-revalidate

#### **Monitoramento**
- **App Hub**: Dashboard centralizado
- **Cloud Build**: Logs de deploy
- **Cloud Run**: Métricas em tempo real
- **Alertas**: CPU, memória, latência, erros

### 🐛 Troubleshooting Comum

#### **Erro 403 - Não Autenticado**
```yaml
# apphosting.yaml
security:
  allow_unauthenticated: true  # PWA público
```

#### **Erro 404 - Imagens não encontradas**
- Verificar se arquivo existe em `public/images/`
- Limpar cache do navegador
- Aguardar propagação do deploy

#### **Deploy não atualiza**
- Verificar `firebase.json` com `backendId` correto
- Usar `firebase deploy --only apphosting:git-box-app`
- Aguardar 2-3 minutos para propagação

#### **Commit muito grande no GitHub**
- Usar searchbox para encontrar arquivos específicos
- Fazer commits menores e mais frequentes
- Dividir mudanças em PRs separados

## 🔧 Configuração Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative Authentication (Email/Password)
3. Crie um Firestore Database
4. Gere uma chave de serviço para Admin SDK
5. Configure as variáveis no `.env.local`

## 📝 Scripts Disponíveis

- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Linting
- `npm run type-check` - Verificação de tipos

## 🎨 Customização

- **Cores**: Edite `tailwind.config.js` para personalizar o tema
- **Componentes**: Use as classes CSS customizadas em `styles/globals.css`
- **Tipos**: Adicione novos tipos em `types/index.ts`

## 📱 Funcionalidades Implementadas

### 🎯 Core Features
- ✅ **PWA Mobile-First**: Experiência nativa em dispositivos móveis
- ✅ **Fluxo de Inscrição Nativo**: Modal automático com multi-step
- ✅ **Autenticação Firebase**: Login, MFA e gestão de usuários
- ✅ **Painel Administrativo**: Permissões granulares e gestão completa
- ✅ **Sistema de Times**: Criação, convites e gestão de competições
- ✅ **Integração FlowPay**: Pagamentos PIX com QR Code
- ✅ **Chatbot Vertex AI**: Assistente inteligente integrado

### 🎨 UX/UI Features
- ✅ **Splash Screen**: Vídeo de intro com transições suaves
- ✅ **Animações**: Framer Motion para experiências fluidas
- ✅ **Header Otimizado**: Menu mobile com indicador de usuário
- ✅ **Formulários Inteligentes**: Validação em tempo real
- ✅ **Instalação PWA**: Banners e prompts automáticos
- ✅ **Offline Support**: Service Worker para cache

### 🔧 Technical Features
- ✅ **App Hosting**: Deploy otimizado no Google Cloud Run
- ✅ **Monitoramento**: App Hub com métricas em tempo real
- ✅ **Performance**: Otimizações de cache e compressão
- ✅ **Segurança**: Headers, MFA e rate limiting
- ✅ **CI/CD**: GitHub Actions com deploy automático
- ✅ **Health Checks**: Endpoints de monitoramento

## 🔐 Segurança

- **Variáveis de ambiente**: Nunca commite arquivos `.env*`
- **Firebase Admin**: Credenciais protegidas no `.gitignore`
- **SAST**: Análise de segurança configurada no GitLab CI/CD
- **Secret Detection**: Detecção automática de credenciais expostas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Merge Request

## 🚦 Pull Request e Deploy

### Pull Request (GitHub)

- Faça push da sua branch para o repositório remoto:
  ```bash
  git push github nome-da-sua-branch
  ```
- Acesse o link sugerido pelo GitHub para abrir o Pull Request (PR).
- Preencha o título e a descrição do PR de forma objetiva, por exemplo:
  - Primeira versão do projeto migrada para o repositório oficial.
  - Inclui configuração do PWA, scripts de desenvolvimento mobile e documentação.
  - Correções de tipagem TypeScript e melhorias de segurança.
- Clique em **Create pull request**.
- Aguarde revisão e merge.

### Checklist de Deploy Firebase

- Certifique-se de que as variáveis de ambiente e secrets **NÃO** estão versionadas.
- O deploy é feito via GitHub Actions ou manualmente com:
  ```bash
  npm run build
  firebase deploy --only hosting
  ```
- Após o merge na `main`, o deploy será disparado automaticamente se o CI/CD estiver configurado.

### Observação sobre tokens/secrets

- Nunca deixe tokens ou arquivos de credenciais no repositório.
- Após o deploy, remova o token do remote para maior segurança:
  ```bash
  git remote set-url github https://github.com/box-app-gyn/box-app.git
  ```

## 📊 Status do Projeto

### 🌐 URLs de Produção
- **App Hosting**: https://git-box-app--interbox-app-8d400.us-central1.hosted.app
- **QR Code**: https://cerradointerbox.com.br (redireciona para mobile)
- **Firebase Console**: https://console.firebase.google.com/project/interbox-app-8d400

### 📱 Repositórios
- **GitHub**: https://github.com/box-app-gyn/box-app
- **Branch Principal**: `feature/primeiro-push`
- **CI/CD**: GitHub Actions configurado

### 🔧 Infraestrutura
- **App Hosting**: Google Cloud Run otimizado
- **Backend**: `git-box-app` (us-central1)
- **Monitoramento**: App Hub ativo
- **Deploy**: Automático via GitHub Actions

### 📈 Métricas de Performance
- **Build Time**: ~7 segundos
- **Deploy Time**: ~3 minutos
- **Cold Start**: < 2 segundos
- **Uptime**: 99.9% (SLO configurado)

### 🚀 Próximos Passos
- [ ] Merge para branch `main`
- [ ] Configurar proteção da branch main
- [ ] Implementar testes automatizados
- [ ] Otimizar bundle size
- [ ] Adicionar mais métricas de analytics

## 🛠️ Comandos Úteis

### Deploy e Infraestrutura
```bash
# Deploy direto (recomendado)
npm run deploy:direct

# Deploy com rollout gradual
npm run deploy:rollout

# Deploy completo (app + funções)
npm run deploy:full

# Deploy manual (legado)
firebase deploy --only apphosting:git-box-app

# Verificar backends
firebase apphosting:backends:list

# Verificar logs
firebase apphosting:logs:tail

# Build local
npm run build
```

### Desenvolvimento
```bash
# Desenvolvimento local
npm run dev

# Linting
npm run lint

# Type checking
npm run type-check

# Limpar cache
rm -rf .next && npm run dev
```

### 🛡️ Proteção macOS
```bash
# Limpar arquivos ocultos
npm run clean:macos

# Configurar proteção
npm run prevent:macos

# Setup completo
npm run setup:macos
```

### Git e Versionamento
```bash
# Verificar status
git status

# Ver commits recentes
git log --oneline -5

# Fazer deploy via GitHub Actions
git add .
git commit -m "descrição das mudanças"
git push
```

### Monitoramento
```bash
# Health check
curl https://git-box-app--interbox-app-8d400.us-central1.hosted.app/api/health

# Verificar performance
curl -I https://git-box-app--interbox-app-8d400.us-central1.hosted.app
```

---

## 📞 Suporte

Para dúvidas técnicas ou problemas:
- **Issues**: https://github.com/box-app-gyn/box-app/issues
- **Documentação**: Pasta `docs/`
- **Firebase Console**: Para logs e monitoramento

---

**CERRADØ INTERBOX 2025** - O Maior Evento de Times da América Latina 🏆
