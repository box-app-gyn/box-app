# 🚀 Configuração Rápida - Usuários Admin

## ⚡ Passos Rápidos:

### 1. Obter Credenciais do Firebase Admin
1. Acesse: https://console.firebase.google.com/project/interbox-app-8d400/settings/serviceaccounts/adminsdk
2. Clique em **"Gerar nova chave privada"**
3. Baixe o arquivo JSON
4. **Renomeie** para `firebase-admin-key.json`
5. **Mova** para a pasta `scripts/`

### 2. Executar Script
```bash
cd scripts
npm run create-admins-simple
```

## 📋 Usuários que serão criados:

| Nome | Email | Senha | Role |
|------|-------|-------|------|
| Guilherme Souza | gopersonal82@gmail.com | Interbox2025!GS | admin |
| Lara Ribeiro | melloribeiro.lara@gmail.com | Interbox2025!LR | admin |
| Mello | nettoaeb1@gmail.com | Interbox2025!NM | admin |

## ✅ Resultado:
- ✅ Usuários criados no Firebase Authentication
- ✅ Documentos criados no Firestore
- ✅ Role admin definido
- ✅ Email verificado automaticamente

## 🔗 Acesso:
https://interbox-app-8d400.web.app/login

## 🛠️ Se der erro:
- Verifique se o arquivo `firebase-admin-key.json` está na pasta `scripts/`
- Verifique se a autenticação por email/senha está habilitada no Firebase Console
- Verifique se o Firestore está habilitado 