// /types/firestore.ts

// Tipos de usuário
export type UserRole = 'publico' | 'fotografo' | 'videomaker' | 'patrocinador' | 'apoio' | 'judge' | 'atleta' | 'admin';

// Status de pagamento
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';

// Status de aprovação
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

// Status de convite
export type ConviteStatus = 'pendente' | 'aceito' | 'recusado' | 'cancelado' | 'expirado';

// Tipos de audiovisual
export type AudiovisualTipo = 'fotografo' | 'videomaker' | 'editor' | 'drone' | 'audio' | 'iluminacao';

// Categorias de competição
export type CategoriaCompeticao = 'Scale' | 'RX' | 'Elite';

// Lotes de inscrição
export type LoteInscricao = 'pre_venda' | 'primeiro' | 'segundo' | 'terceiro' | 'quarto' | 'quinto';

// Tipos de upsell
export type UpsellTipo = 'camiseta_extra' | 'kit_premium' | 'acesso_vip' | 'foto_profissional' | 'video_highlights' | 'recovery';

// Categorias de patrocinador
export type CategoriaPatrocinador = 'Ouro' | 'Prata' | 'Bronze' | 'Apoio' | 'Tecnologia' | 'Alimentação' | 'Equipamentos';

// Status de patrocinador
export type StatusPatrocinador = 'ativo' | 'pendente' | 'inativo' | 'cancelado';

// Coleção: users
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  metadata?: {
    lastLogin?: Timestamp;
    loginCount?: number;
    preferences?: Record<string, any>;
  };
}

// Coleção: teams
export interface FirestoreTeam {
  id: string;
  nome: string;
  captainId: string;
  atletas: string[];
  status: 'incomplete' | 'complete' | 'confirmado';
  categoria: CategoriaCompeticao;
  lote: LoteInscricao;
  box: {
    nome: string;
    cidade: string;
    estado: string;
  };
  valorInscricao: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmadoEm?: Timestamp;
}

// Coleção: convites_times
export interface FirestoreConviteTime {
  id: string;
  teamId: string;
  teamName: string;
  captainId: string;
  captainName: string;
  captainEmail: string;
  invitedEmail: string;
  invitedName: string;
  status: ConviteStatus;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  respondedAt?: Timestamp;
  respondedBy?: string;
  canceledAt?: Timestamp;
  canceledBy?: string;
  createdBy: string;
  ipAddress: string;
}

// Coleção: pedidos
export interface FirestorePedido {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  teamId?: string;
  tipo: 'ingresso' | 'kit' | 'premium' | UpsellTipo;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  status: PaymentStatus;
  lote: LoteInscricao;
  categoria?: CategoriaCompeticao;
  flowpayOrderId?: string;
  pixCode?: string;
  pixExpiration?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  pagamentoConfirmado?: Timestamp;
  webhookData?: Record<string, any>;
  gateway: 'pix' | 'cartao' | 'cripto';
}

// Coleção: audiovisual (engloba fotógrafos, videomakers, etc.)
export interface FirestoreAudiovisual {
  id: string;
  userId: string;
  userEmail: string;
  nome: string;
  telefone: string;
  tipo: AudiovisualTipo;
  portfolio: {
    urls: string[];
    descricao: string;
    experiencia: string;
    equipamentos: string[];
    especialidades: string[];
  };
  termosAceitos: boolean;
  termosAceitosEm: Timestamp;
  status: ApprovalStatus;
  aprovadoPor?: string;
  aprovadoEm?: Timestamp;
  rejeitadoPor?: string;
  rejeitadoEm?: Timestamp;
  motivoRejeicao?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Coleção: patrocinadores
export interface FirestorePatrocinador {
  id: string;
  nome: string;
  nomeFantasia?: string;
  categoria: CategoriaPatrocinador;
  status: StatusPatrocinador;
  valorPatrocinio: number;
  logoUrl?: string;
  website?: string;
  email: string;
  telefone: string;
  contato: {
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
  };
  beneficios: {
    descricao: string;
    itens: string[];
    valorEstimado: number;
  };
  contrato: {
    numero?: string;
    dataInicio: Timestamp;
    dataFim: Timestamp;
    valorTotal: number;
    parcelas: number;
    valorParcela: number;
    proximoVencimento?: Timestamp;
  };
  pagamentos: Array<{
    parcela: number;
    valor: number;
    vencimento: Timestamp;
    status: PaymentStatus;
    pagoEm?: Timestamp;
    comprovante?: string;
  }>;
  observacoes?: string;
  criadoPor: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  ativadoEm?: Timestamp;
  ativadoPor?: string;
}

// Coleção: adminLogs
export interface FirestoreAdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  acao: 'validacao_audiovisual' | 'aprovacao_audiovisual' | 'rejeicao_audiovisual' | 'criacao_pedido' | 'confirmacao_pagamento';
  targetId: string; // ID do usuário/audiovisual/pedido afetado
  targetType: 'user' | 'audiovisual' | 'pedido';
  detalhes: Record<string, any>;
  createdAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

// Tipos para Dashboard Admin
export interface DashboardMetrics {
  // Participantes & Times
  totalTimes: number;
  timesPorCategoria: Record<CategoriaCompeticao, number>;
  timesPendentesPagamento: number;
  atletasConfirmados: number;
  atletasPorCategoria: Record<CategoriaCompeticao, number>;
  rankingPorLote: Record<LoteInscricao, number>;
  dadosPorBox: Array<{
    nome: string;
    cidade: string;
    estado: string;
    times: number;
    atletas: number;
    faturamento: number;
  }>;
  
  // Financeiro e Vendas
  faturamentoTotal: number;
  receitaPorLote: Record<LoteInscricao, number>;
  receitaPorCategoria: Record<CategoriaCompeticao, number>;
  upsellsVendidos: Record<UpsellTipo, number>;
  ticketMedioPorTime: number;
  receitaPorGateway: Record<'pix' | 'cartao' | 'cripto', number>;
}

// Tipos auxiliares
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

// Tipos para Cloud Functions
export interface CriarPedidoPIXData {
  userId: string;
  userEmail: string;
  userName: string;
  tipo: 'ingresso' | 'kit' | 'premium';
  quantidade: number;
  valorUnitario: number;
}

export interface ValidaAudiovisualData {
  audiovisualId: string;
  adminId: string;
  aprovado: boolean;
  motivoRejeicao?: string;
}

export interface EmailConfirmacaoData {
  userEmail: string;
  userName: string;
  tipo: 'pedido' | 'audiovisual' | 'admin';
  dadosAdicionais?: Record<string, any>;
}

// Tipos para funções de times
export interface ConviteTimeData {
  teamId: string;
  teamName: string;
  captainId: string;
  captainName: string;
  invitedEmail: string;
  invitedName?: string;
}

export interface RespostaConviteData {
  conviteId: string;
  resposta: 'aceito' | 'recusado';
  userId: string;
  userName: string;
} 