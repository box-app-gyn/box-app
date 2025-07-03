# Cerrado App

Plataforma para eventos fotográficos no Cerrado - Landing page, captação de investidores e cadastro de fotógrafos.

## 📚 Documentação e Guias

Todos os guias de setup, administração e scripts estão organizados na pasta [`docs/`](./docs):

- [Guia de Admins](./docs/ADMIN-USERS-SETUP.md)
- [Setup de Coleções](./docs/COLLECTIONS-SETUP.md)
- [Guia MFA](./docs/MFA-SETUP-GUIDE.md)
- [População de Coleções](./docs/POPULATE-COLLECTIONS.md)
- [Guia Rápido](./docs/QUICK-SETUP.md)
- [Guia de Adição de Admins Existentes](./docs/ADD-EXISTING-ADMINS.md)
- [Guia Completo de Admin](./docs/ADMIN-SETUP-GUIDE.md)

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase** - Autenticação e banco de dados
- **FlowPay** - Processamento de pagamentos

## 📁 Estrutura do Projeto

```
/cerrado-app
├── /pages              # Páginas da aplicação
│   ├── index.tsx       # Landing page
│   ├── login.tsx       # Login
│   ├── admin.tsx       # Painel Admin
│   ├── dashboard.tsx   # Dashboard de atletas
│   ├── audiovisual.tsx # Cadastro audiovisual
│   └── api/            # API Routes
├── /components         # Componentes reutilizáveis
├── /lib               # Configurações (Firebase, etc)
├── /types             # Tipos TypeScript
├── /constants         # Constantes da aplicação
├── /utils             # Funções utilitárias
├── /hooks             # Custom hooks
└── /styles            # Estilos globais
```

## 🛠️ Setup

1. **Clone o repositório**
```bash
git clone https://gitlab.com/mello-group1/interbox-app.git
cd interbox-app
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

## 📱 Funcionalidades

- ✅ Landing page responsiva
- ✅ Autenticação Firebase
- ✅ Painel administrativo com permissões granulares
- ✅ Cadastro de fotógrafos e audiovisual
- ✅ Captação de investidores
- ✅ Integração FlowPay
- ✅ Roteamento protegido
- ✅ Sistema de times e competições

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

- **Produção**: https://interbox-app-8d400.web.app
- **Repositório**: https://gitlab.com/mello-group1/interbox-app
- **CI/CD**: Configurado com GitLab Pipelines
- **Deploy**: Firebase Hosting
