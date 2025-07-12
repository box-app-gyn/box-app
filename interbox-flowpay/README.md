# Interbox FlowPay Integration

Módulo de integração com FlowPay/OpenPix para o sistema Interbox, organizado em backend e frontend separados.

## Estrutura

```
interbox-flowpay/
├── backend/
│   ├── functions/
│   │   ├── index.ts              # Entrypoint das Cloud Functions
│   │   └── flowpay/
│   │       ├── webhook.ts        # Processamento de webhooks
│   │       └── api.ts            # Cliente da API OpenPix
│   ├── utils/
│   │   ├── firestore.ts          # Helpers do Firestore
│   │   └── logger.ts             # Logger customizado
│   └── scripts/
│       ├── register-webhook.ts   # Script para registrar webhooks
│       └── manual-status-check.ts # Verificação manual de status
├── frontend/
│   ├── components/
│   │   ├── FlowPayModal.tsx      # Modal de pagamento
│   │   └── PaymentStatus.tsx     # Status do pagamento
│   ├── hooks/
│   │   └── useFlowPay.ts         # Hook para integração
│   └── utils/
│       └── formatPix.ts          # Helpers de formatação
└── package.json
```

## Configuração

### Variáveis de Ambiente

```bash
# OpenPix/FlowPay
OPENPIX_API_KEY=sua_api_key_aqui
OPENPIX_BASE_URL=https://api.openpix.com.br

# Webhook
WEBHOOK_URL=https://seu-dominio.com/api/flowpay/webhook

# Firebase (se necessário)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## Uso

### Backend

#### Deploy das Functions
```bash
cd interbox-flowpay
npm run deploy:functions
```

#### Registrar Webhook
```bash
npm run register-webhook
```

#### Verificar Pagamentos Pendentes
```bash
npm run check-payments
```

### Frontend

#### Importar Componentes
```tsx
import { FlowPayModal } from '@/interbox-flowpay/frontend/components/FlowPayModal';
import { PaymentStatus } from '@/interbox-flowpay/frontend/components/PaymentStatus';
import { useFlowPay } from '@/interbox-flowpay/frontend/hooks/useFlowPay';
```

#### Usar Modal de Pagamento
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

<FlowPayModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  teamId="team-123"
  teamName="Time Alpha"
  amount={150.00}
/>
```

#### Usar Status de Pagamento
```tsx
<PaymentStatus
  status="paid"
  amount={150.00}
  paidAt="2024-01-15T10:30:00Z"
/>
```

## Fluxo de Pagamento

1. **Criação**: Frontend chama API para criar cobrança
2. **QR Code**: Usuário escaneia QR Code para pagar
3. **Webhook**: OpenPix notifica backend sobre pagamento
4. **Atualização**: Status é atualizado no Firestore
5. **Fallback**: Script manual verifica pagamentos pendentes

## API Endpoints

### POST /api/flowpay/webhook
Recebe notificações de pagamento da OpenPix.

### POST /api/flowpay/charge
Cria nova cobrança PIX (implementar no frontend).

### GET /api/flowpay/status/:id
Consulta status de uma cobrança (implementar no frontend).

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Build
npm run build

# Desenvolvimento
npm run dev
```

## Deploy

### Deploy Completo
```bash
# Backend
npm run deploy:functions

# Frontend (integrar com build do Next.js)
# Os componentes são importados no projeto principal
```

### Deploy Separado
```bash
# Apenas functions
npm run deploy:functions

# Apenas scripts (executar localmente)
npm run register-webhook
npm run check-payments
```

## Troubleshooting

### Webhook não recebido
1. Verificar se webhook está registrado: `npm run register-webhook`
2. Verificar logs das functions no Firebase Console
3. Testar endpoint manualmente

### Pagamento não atualizado
1. Executar verificação manual: `npm run check-payments`
2. Verificar logs do webhook
3. Verificar dados no Firestore

### Erro de API
1. Verificar `OPENPIX_API_KEY`
2. Verificar `OPENPIX_BASE_URL`
3. Verificar logs de erro 