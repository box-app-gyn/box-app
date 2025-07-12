# 🔧 Correções Necessárias no Firestore

## 📋 Problemas Identificados

### 🚨 **Problemas Críticos**

1. **Campos Multivalorados Incorretos**
   - `categoria`: `"RX, Scaled, Master 145+, Amador, Scale, Iniciante"` (deveria ser apenas uma categoria)
   - `status`: `"pending, approved, rejected"` (deveria ser apenas um status)
   - `lote`: `"lote1, lote2, lote3"` (deveria ser apenas um lote)

2. **Estrutura de Atletas Inconsistente**
   - Campo `user_id_1`: `"João Silva"` (deveria ser ID, não nome)
   - Campo `resultados`: `"[]"` (deveria ser array, não string)

3. **Configuração do Sistema**
   - `loteAtual`: `"lote1, lote2, lote3"` (deveria ser apenas um lote ativo)

## 🔧 **Scripts de Correção**

### **Opção 1: Console do Firebase (Recomendado)**

1. **Acesse o Console do Firebase:**
   ```
   https://console.firebase.google.com/project/interbox-app-8d400/firestore/data
   ```

2. **Vá para a aba "Regras"**

3. **Clique em "Console"** (botão no canto superior direito)

4. **Execute o script de correção:**
   - Abra o arquivo `scripts/corrigir-dados-console.js`
   - Copie todo o conteúdo
   - Cole no console do Firebase
   - Pressione Enter

5. **Execute o script de validação:**
   - Abra o arquivo `scripts/validar-dados-console.js`
   - Copie todo o conteúdo
   - Cole no console do Firebase
   - Pressione Enter

### **Opção 2: Script Node.js (Se tiver serviceAccountKey.json configurado)**

1. **Configure o serviceAccountKey.json** com suas credenciais reais
2. **Execute o script de correção:**
   ```bash
   node scripts/corrigir-dados-firestore.js
   ```
3. **Execute o script de validação:**
   ```bash
   node scripts/validar-dados-firestore.js
   ```

## 📊 **Estrutura Correta Após Correção**

### **Teams (Collection)**
```ts
{
  id: string;
  nome: string;
  captainId: string;
  atletas: string[]; // Array de IDs
  categoria: string; // Uma categoria apenas
  lote: string; // Um lote apenas
  status: string; // Um status apenas
  statusPagamento: string; // Um status apenas
  box: string;
  cidade: string;
  estado: string;
  quantidade: number;
  valorTotal: number;
  kitEspecial: boolean;
  checkInOnline: boolean;
  termosAceitos: boolean;
  termosAceitosEm: Timestamp | null;
  flowpayOrderId: string | null;
  pixCode: string | null;
  pixExpiration: Timestamp | null;
  cardPayment: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Atletas (Collection)**
```ts
{
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: Timestamp;
  idade: number; // Number, não string
  genero: string; // Um gênero apenas
  camiseta: string; // Um tipo apenas
  tamanho: string; // Um tamanho apenas
  categoria: string; // Uma categoria apenas
  status: string; // Um status apenas
  box: string;
  cidade: string;
  estado: string;
  documentos: {
    cpf: string;
    email: string;
  };
  resultados: any[]; // Array, não string
  checkInOnline: boolean;
  termosAceitos: boolean;
  termosAceitosEm: Timestamp | null;
  timeId: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Sistema (Collection)**
```ts
{
  id: string;
  inscricoesAbertas: boolean;
  loteAtual: string; // String única
  timesInscritos: number;
  timesAprovados: number;
  proximoNumeroTime: number;
  checkInAberto: boolean;
  checkInAbreEm: Timestamp;
  dataEvento: Timestamp;
  localEvento: string;
  limiteLote1: number;
  limiteTotal: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Lotes (Collection)**
```ts
{
  id: string;
  nome: string;
  ativo: boolean;
  dataInicio: Timestamp;
  dataFim: Timestamp;
  limiteTimes: number;
  limiteKitEspecial?: number; // Apenas lote1
  valores: {
    'RX': number;
    'Master 145+': number;
    'Amador': number;
    'Scale': number;
    'Iniciante': number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Categorias (Collection)**
```ts
{
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  contaParaKitEspecial: boolean; // RX = false
  disponivelLote1: boolean; // RX = false
  ordem: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### **Estatísticas (Collection)**
```ts
{
  id: string;
  totalTimes: number;
  totalAtletas: number;
  timesPagos: number;
  timesPendentes: number;
  timesComKitEspecial: number;
  timesRX: number; // Number, não boolean
  estatisticasPorCategoria: {
    [categoria: string]: { times: number; atletas: number };
  };
  estatisticasPorLote: {
    [lote: string]: { times: number; valor: number; kitEspecial?: number };
  };
  estatisticasPorEstado: Record<string, any>;
  updatedAt: Timestamp;
}
```

## 🎯 **Próximos Passos**

1. **Execute o script de correção no console do Firebase**
2. **Execute o script de validação no console do Firebase**
3. **Verifique se todos os dados estão corretos**
4. **Configure o backend da FlowPay**

## ⚠️ **Importante**

- Faça backup dos dados antes de executar os scripts
- Os scripts corrigem automaticamente os problemas identificados
- Após a correção, todos os campos estarão com tipos corretos
- A estrutura ficará alinhada com os tipos TypeScript do projeto
- Use preferencialmente o console do Firebase (mais seguro) 