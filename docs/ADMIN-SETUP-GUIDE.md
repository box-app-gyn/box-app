# 🚀 Guia de Configuração de Usuários Admin

## 📋 Pré-requisitos

1. **Firebase Admin SDK habilitado**
2. **Credenciais do Service Account**
3. **Node.js instalado**

## 🔧 Passo 1: Obter Credenciais do Firebase Admin

1. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/settings/serviceaccounts/adminsdk
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON
4. **IMPORTANTE**: Nunca compartilhe essas credenciais!

## 🔧 Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `scripts/` com as seguintes variáveis:

```bash
# Firebase Admin SDK Configuration
FIREBASE_PRIVATE_KEY_ID=seu_private_key_id_aqui
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@interbox-app-8d400.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=seu_client_id_aqui
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40interbox-app-8d400.iam.gserviceaccount.com
```

## 🔧 Passo 3: Instalar Dependências

```bash
cd scripts
npm install firebase-admin dotenv
```

## 🚀 Passo 4: Executar Script

```bash
cd scripts
node create-admin-users.js
```

## 📋 Usuários que serão criados:

| Nome | Email | Senha | Role |
|------|-------|-------|------|
| Guilherme Souza | gopersonal82@gmail.com | Interbox2025!GS | admin |
| Lara Ribeiro | melloribeiro.lara@gmail.com | Interbox2025!LR | admin |
| Mello | nettoaeb1@gmail.com | Interbox2025!NM | admin |

## ✅ Resultado Esperado

O script irá:
- ✅ Criar usuários no Firebase Authentication
- ✅ Criar documentos na coleção `users` do Firestore
- ✅ Definir role como `admin`
- ✅ Marcar como ativo e email verificado

## 🔗 Acesso ao Sistema

Após a criação, acesse: https://interbox-app-8d400.web.app/login

## 🛠️ Solução de Problemas

### Erro: "auth/operation-not-allowed"
- **Solução**: Habilitar autenticação por email/senha no Firebase Console

### Erro: "PERMISSION_DENIED"
- **Solução**: Verificar se as credenciais estão corretas e se o Firestore está habilitado

### Erro: "auth/email-already-exists"
- **Solução**: O script irá atualizar o documento no Firestore automaticamente

## 🔒 Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ Senhas fortes com caracteres especiais
- ✅ Email verificado automaticamente
- ✅ Role admin definido no Firestore

## 📞 Suporte

Se houver problemas, verifique:
1. Credenciais do Firebase Admin
2. Permissões do projeto
3. APIs habilitadas no Google Cloud Console 