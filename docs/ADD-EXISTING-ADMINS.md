# 🔧 Adicionar Usuários Admin Existentes

## 📋 Situação
Os usuários admin já foram criados no **Firebase Authentication**, mas precisam ser adicionados ao **Firestore** com role "admin".

## ⚡ Solução Rápida

### 1. Verificar Credenciais
Certifique-se de que o arquivo `firebase-admin-key.json` está na pasta `scripts/`

### 2. Executar Script
```bash
cd scripts
npm run add-existing-admins
```

## 📋 Usuários que serão processados:

| Email | Status |
|-------|--------|
| gopersonal82@gmail.com | Adicionar/Atualizar no Firestore |
| melloribeiro.lara@gmail.com | Adicionar/Atualizar no Firestore |
| nettoaeb1@gmail.com | Adicionar/Atualizar no Firestore |

## ✅ O que o script faz:

1. **Busca** cada usuário no Firebase Authentication
2. **Verifica** se já existe no Firestore
3. **Cria** documento se não existir
4. **Atualiza** role para "admin" se existir
5. **Define** status como "ativo"

## 🔗 Resultado:
- ✅ Usuários admin no Firestore
- ✅ Role "admin" configurado
- ✅ Acesso ao painel admin liberado
- ✅ Login funcionando normalmente

## 🛠️ Se der erro:
- Verifique se o arquivo `firebase-admin-key.json` existe
- Verifique se os usuários existem no Authentication
- Verifique se o Firestore está habilitado 