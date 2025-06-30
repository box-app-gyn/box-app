# 🔥 Configuração das Coleções do Firestore

## 📋 Status Atual
- ✅ Regras do Firestore: **DEPLOYADAS**
- ✅ Índices do Firestore: **DEPLOYADOS**
- ❌ Coleções: **NÃO CRIADAS**

## 🚀 Como Criar as Coleções

### Opção 1: Console do Firebase (Recomendado)

1. **Acesse o Console do Firebase:**
   ```
   https://console.firebase.google.com/project/interbox-app-8d400/firestore/data
   ```

2. **Vá para a aba "Regras"**

3. **Clique em "Console"** (botão no canto superior direito)

4. **Cole e execute o script:**
   ```javascript
   // Copie o conteúdo do arquivo scripts/firestore-init.js
   // e cole no console do Firebase
   ```

### Opção 2: Manual (Coleção por Coleção)

1. **Coleção: users**
   - Clique em "Iniciar coleção"
   - ID da coleção: `users`
   - ID do documento: `admin-example`
   - Campos:
     ```
     email: "admin@interbox.com"
     displayName: "Admin Interbox"
     role: "admin"
     isActive: true
     createdAt: [timestamp]
     updatedAt: [timestamp]
     ```

2. **Coleção: teams**
   - ID da coleção: `teams`
   - ID do documento: `team-example`
   - Campos:
     ```
     nome: "Time Exemplo"
     captainId: "atleta-1"
     atletas: ["atleta-1", "atleta-2", "atleta-3", "atleta-4"]
     status: "incomplete"
     createdAt: [timestamp]
     updatedAt: [timestamp]
     ```

3. **Coleção: audiovisual**
   - ID da coleção: `audiovisual`
   - ID do documento: `audiovisual-example`
   - Campos:
     ```
     userId: "admin-example"
     userEmail: "audiovisual@interbox.com"
     nome: "Profissional Audiovisual Exemplo"
     telefone: "+5511999999999"
     tipo: "fotografo"
     portfolio: {
       urls: ["https://example.com/portfolio1.jpg"]
       descricao: "Profissional audiovisual com 5 anos de experiência"
       experiencia: "5 anos"
       equipamentos: ["Canon EOS R5", "Canon RF 24-70mm f/2.8"]
       especialidades: ["Fotografia Esportiva", "Videografia"]
     }
     termosAceitos: true
     termosAceitosEm: [timestamp]
     status: "pending"
     createdAt: [timestamp]
     updatedAt: [timestamp]
     ```

4. **Coleção: pedidos**
   - ID da coleção: `pedidos`
   - ID do documento: `pedido-example`
   - Campos:
     ```
     userId: "admin-example"
     userEmail: "admin@interbox.com"
     userName: "Admin Interbox"
     tipo: "ingresso"
     quantidade: 1
     valorUnitario: 150.00
     valorTotal: 150.00
     status: "pending"
     createdAt: [timestamp]
     updatedAt: [timestamp]
     ```

5. **Coleção: adminLogs**
   - ID da coleção: `adminLogs`
   - ID do documento: `log-example`
   - Campos:
     ```
     adminId: "admin-example"
     adminEmail: "admin@interbox.com"
     acao: "criacao_pedido"
     targetId: "pedido-example"
     targetType: "pedido"
     detalhes: { message: "Pedido de exemplo criado" }
     createdAt: [timestamp]
     ```

## ✅ Verificação

Após criar as coleções, você deve ver:

1. **5 coleções criadas:**
   - `users`
   - `teams`
   - `audiovisual`
   - `pedidos`
   - `adminLogs`

2. **1 documento em cada coleção** (dados de exemplo)

3. **Índices funcionando** (sem erros de consulta)

## 🔧 Próximos Passos

Após criar as coleções:

1. **Testar as Cloud Functions:**
   ```bash
   firebase deploy --only functions
   ```

2. **Verificar se o site funciona:**
   ```bash
   npm run dev
   ```

3. **Testar o painel admin:**
   - Acesse `/admin`
   - Verifique se as tabs carregam sem erro

## 🆘 Solução de Problemas

### Erro: "Collection not found"
- Verifique se as coleções foram criadas corretamente
- Confirme se os nomes estão exatos: `users`, `teams`, `audiovisual`, `pedidos`, `adminLogs`

### Erro: "Permission denied"
- Verifique se as regras foram deployadas
- Confirme se o usuário está autenticado

### Erro: "Index not found"
- Aguarde alguns minutos para os índices serem criados
- Verifique se o deploy dos índices foi bem-sucedido

## 📝 Tipos de Audiovisual Suportados

A coleção `audiovisual` suporta os seguintes tipos:
- `fotografo` - Fotógrafos
- `videomaker` - Videomakers
- `editor` - Editores de vídeo
- `drone` - Pilotos de drone
- `audio` - Técnicos de áudio
- `iluminacao` - Técnicos de iluminação 