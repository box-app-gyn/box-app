# Cerrado App

Plataforma para eventos fotográficos no Cerrado - Landing page, captação de investidores e cadastro de fotógrafos.

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
│   ├── investidores.tsx # Captação
│   ├── fotografo.tsx   # Cadastro fotógrafo
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
git clone <url-do-repo>
cd cerrado-app
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
- ✅ Painel administrativo
- ✅ Cadastro de fotógrafos
- ✅ Captação de investidores
- ✅ Integração FlowPay
- ✅ Roteamento protegido

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request 