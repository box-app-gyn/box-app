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

// 🎯 GAMIFICAÇÃO CAMADA 1 - Tipos de ação que geram pontos
export type GamificationAction = 
  | 'CADASTRO'           // +10 XP
  | 'LOGIN_DIARIO'       // +5 XP
  | 'COMPLETAR_PERFIL'   // +25 XP
  | 'CRIAR_TIME'         // +50 XP
  | 'ENTRAR_TIME'        // +30 XP
  | 'CONVIDAR_ATLETA'    // +15 XP
  | 'ACEITAR_CONVITE'    // +25 XP
  | 'COMPLETAR_TIME'     // +100 XP
  | 'INSCRICAO_AUDIOVISUAL' // +40 XP
  | 'APROVACAO_AUDIOVISUAL' // +60 XP
  | 'INSCRICAO_EVENTO'   // +80 XP
  | 'PAGAMENTO_CONFIRMADO' // +120 XP
  | 'PRIMEIRA_VEZ'       // +25 XP
  | 'STREAK_7_DIAS'      // +50 XP
  | 'STREAK_30_DIAS'     // +200 XP
  | 'REFERRAL'           // +30 XP
  | 'VISITAR_APP'        // +2 XP
  | 'COMPARTILHAR'       // +10 XP
  | 'FEEDBACK'           // +15 XP
  | 'AVALIAR'            // +10 XP;

// Níveis de gamificação
export type GamificationLevel = 
  | 'iniciante'    // 0-99 XP
  | 'bronze'       // 100-299 XP
  | 'prata'        // 300-599 XP
  | 'ouro'         // 600-999 XP
  | 'platina'      // 1000-1999 XP
  | 'diamante'     // 2000+ XP;

// Status de recompensa
export type RewardStatus = 'disponivel' | 'resgatada' | 'expirada';

// Coleção: users
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  phone?: string;
  cidade?: string;
  box?: string;
  whatsapp?: string;
  telefone?: string;
  categoria?: 'atleta' | 'coach' | 'espectador' | 'midia';
  mensagem?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  metadata?: {
    lastLogin?: Timestamp;
    loginCount?: number;
    preferences?: Record<string, any>;
  };
  // 🎯 GAMIFICAÇÃO CAMADA 1
  gamification?: {
    points: number;                    // Pontos totais (XP)
    level: GamificationLevel;          // Nível atual
    totalActions: number;              // Total de ações realizadas
    lastActionAt?: Timestamp;          // Última ação realizada
    achievements: string[];            // Conquistas desbloqueadas
    rewards: string[];                 // Recompensas resgatadas
    streakDays: number;                // Dias consecutivos de login
    lastLoginStreak?: Timestamp;       // Último login para streak
    referralCode?: string;             // Código de referência único
    referredBy?: string;               // Quem indicou este usuário
    referrals: string[];               // Usuários indicados
    referralPoints: number;            // Pontos ganhos por indicações
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

// Coleção: gamification_actions (histórico de ações)
export interface FirestoreGamificationAction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: GamificationAction;
  points: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  processed: boolean;
  processedAt?: Timestamp;
}

// Coleção: gamification_leaderboard (ranking)
export interface FirestoreGamificationLeaderboard {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhotoURL?: string;
  userRole: UserRole;
  points: number;
  level: GamificationLevel;
  totalActions: number;
  streakDays: number;
  lastActionAt: Timestamp;
  position: number;                    // Posição no ranking
  previousPosition?: number;           // Posição anterior
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Coleção: gamification_rewards (recompensas disponíveis)
export interface FirestoreGamificationReward {
  id: string;
  title: string;
  description: string;
  type: 'spoiler' | 'enquete' | 'destaque' | 'acesso_vip' | 'conteudo_exclusivo';
  requiredPoints: number;
  requiredLevel: GamificationLevel;
  maxRedemptions?: number;             // Máximo de resgates (null = ilimitado)
  currentRedemptions: number;          // Resgates atuais
  isActive: boolean;
  expiresAt?: Timestamp;
  metadata?: {
    content?: string;                  // Conteúdo da recompensa
    imageURL?: string;                 // Imagem da recompensa
    externalLink?: string;             // Link externo
    instructions?: string;             // Instruções para resgate
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Coleção: gamification_user_rewards (recompensas resgatadas pelos usuários)
export interface FirestoreGamificationUserReward {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  rewardId: string;
  rewardTitle: string;
  rewardType: string;
  status: RewardStatus;
  redeemedAt: Timestamp;
  expiresAt?: Timestamp;
  usedAt?: Timestamp;
  metadata?: Record<string, any>;
}

// Coleção: gamification_achievements (conquistas)
export interface FirestoreGamificationAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;                        // Emoji ou ícone
  requiredPoints?: number;
  requiredActions?: {
    action: GamificationAction;
    count: number;
  }[];
  requiredLevel?: GamificationLevel;
  isSecret: boolean;                   // Conquista secreta
  isActive: boolean;
  createdAt: Timestamp;
}

// Coleção: gamification_community_highlights (destaques da comunidade)
export interface FirestoreGamificationCommunityHighlight {
  id: string;
  title: string;
  subtitle: string;
  type: 'top_scorers' | 'new_achievements' | 'milestone_reached' | 'community_event';
  users: Array<{
    userId: string;
    userName: string;
    userPhotoURL?: string;
    points: number;
    achievement?: string;
  }>;
  isActive: boolean;
  expiresAt: Timestamp;
  createdAt: Timestamp;
} 