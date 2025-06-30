# 🚀 Populando Coleções do Firestore

## ✅ Regras do Firestore Deployadas

As regras de segurança do Firestore já foram deployadas com sucesso!

## 📝 Como Popular as Coleções

### Opção 1: Console do Firebase (Recomendado)

1. **Acesse o Console do Firebase:**
   ```
   https://console.firebase.google.com/project/interbox-app-8d400/firestore/data
   ```

2. **Abra o Console JavaScript:**
   - Vá em "Regras" 
   - Clique em "Console" (ícone de terminal)

3. **Cole e execute o script:**
   - Abra o arquivo `scripts/firebase-console-populate.js`
   - Copie todo o conteúdo
   - Cole no console do Firebase
   - Pressione Enter

### Opção 2: Script Node.js (Se tiver credenciais configuradas)

```bash
node scripts/populate-collections.js
```

## 📊 Dados que Serão Criados

### 👥 Users (6 documentos)
- **admin-cerrado**: Admin do sistema
- **atleta-joao**: João Silva
- **atleta-maria**: Maria Santos  
- **atleta-pedro**: Pedro Costa
- **atleta-ana**: Ana Oliveira
- **atleta-carlos**: Carlos Rodrigues

### 🏆 Teams (2 documentos)
- **team-cerrado-1**: "Cerrado Warriors" (completo)
- **team-cerrado-2**: "Cerrado Legends" (incompleto)

### 📸 Audiovisual (2 documentos)
- **fotografo-rafael**: Rafael Silva (aprovado)
- **videomaker-julia**: Julia Mendes (pendente)

### 🎫 Pedidos (3 documentos)
- **pedido-001**: João Silva (pago)
- **pedido-002**: Maria Santos (pendente)
- **pedido-003**: Pedro Costa (cancelado)

### 📋 AdminLogs (2 documentos)
- Logs de ações administrativas

## 🔧 Estrutura dos Dados

### Users
```javascript
{
  email: string,
  displayName: string,
  role: 'admin' | 'atleta',
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Teams
```javascript
{
  nome: string,
  captainId: string,
  atletas: string[],
  status: 'complete' | 'incomplete',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Audiovisual
```javascript
{
  userId: string,
  userEmail: string,
  nome: string,
  telefone: string,
  tipo: 'fotografo' | 'videomaker',
  portfolio: {
    urls: string[],
    descricao: string,
    experiencia: string,
    equipamentos: string[],
    especialidades: string[]
  },
  termosAceitos: boolean,
  termosAceitosEm: timestamp,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Pedidos
```javascript
{
  userId: string,
  userEmail: string,
  userName: string,
  tipo: 'ingresso',
  quantidade: number,
  valorUnitario: number,
  valorTotal: number,
  status: 'pending' | 'paid' | 'cancelled',
  paymentId?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎯 Próximos Passos

1. **Execute o script** no console do Firebase
2. **Verifique os dados** na interface do Firestore
3. **Teste o painel admin** com os dados criados
4. **Configure autenticação** se necessário

## ⚠️ Importante

- Os dados são de exemplo para desenvolvimento
- Substitua por dados reais antes do evento
- Mantenha as regras de segurança ativas
- Faça backup antes de modificar dados em produção 