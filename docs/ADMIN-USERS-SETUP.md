# 👥 Configuração de Usuários Admin

## 🔑 Credenciais Sugeridas

### **1. Guilherme Souza**

- **Email:** gopersonal82@gmail.com
- **Senha:** `Interbox2025!GS`
- **Role:** admin

### **2. Lara Ribeiro**

- **Email:** melloribeiro.lara@gmail.com
- **Senha:** `Interbox2025!LR`
- **Role:** admin

### **3. Mello**

- **Email:** nettoaeb1@gmail.com
- **Senha:** `Interbox2025!NM`
- **Role:** admin

## 🚀 Como Criar os Usuários

### **Opção 1: Console do Firebase (Recomendado)**

1. **Acesse** [Firebase Console](https://console.firebase.google.com)
2. **Selecione** seu projeto `cerrado-app`
3. **Vá para** Authentication → Users
4. **Clique** em "Add User"
5. **Adicione** cada usuário com as credenciais acima
6. **No Firestore**, crie documentos na coleção `users`:

```javascript
// Para cada usuário, crie um documento com:
{
  uid: "UID_DO_USUARIO",
  email: "email@exemplo.com",
  displayName: "Nome do Usuário",
  role: "admin",
  isActive: true,
  mfaEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### **Opção 2: Script Automático**

1. **Edite** o arquivo `scripts/create-admin-users.js`
2. **Substitua** a configuração do Firebase pelas suas credenciais reais
3. **Execute:**
   ```bash
   cd scripts
   node create-admin-users.js
   ```

## 🔐 Segurança das Senhas

### **Padrão das Senhas:**

- **Formato:** `Interbox2025!INICIAIS`
- **Exemplo:** `Interbox2025!GS` (Guilherme Souza)

### **Características:**

- ✅ **12+ caracteres**
- ✅ **Maiúsculas e minúsculas**
- ✅ **Números**
- ✅ **Símbolos especiais**
- ✅ **Fácil de lembrar**

## 📋 Checklist de Configuração

- [ ] Criar usuários no Firebase Authentication
- [ ] Criar documentos no Firestore (coleção `users`)
- [ ] Definir role como `admin`
- [ ] Testar login com as credenciais
- [ ] Verificar acesso ao painel admin (`/admin`)
- [ ] Configurar MFA se necessário

## 🎯 Próximos Passos

1. **Execute** a criação dos usuários
2. **Teste** o login de cada admin
3. **Verifique** acesso ao painel admin
4. **Configure** MFA se desejar
5. **Compartilhe** as credenciais de forma segura

## ⚠️ Importante

- **Guarde** as senhas em local seguro
- **Não compartilhe** as credenciais publicamente
- **Considere** ativar MFA para maior segurança
- **Monitore** os acessos no Firebase Console

## 🔧 Acesso ao Painel Admin

Após criar os usuários, eles poderão:
- **Fazer login** em `/login`
- **Acessar** o painel em `/admin`
- **Gerenciar** candidaturas audiovisual
- **Visualizar** pedidos e usuários
- **Administrar** times formados 