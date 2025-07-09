// App constants
export const APP_NAME = 'Cerrado App';
export const APP_DESCRIPTION = 'Plataforma para eventos fotográficos no Cerrado';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  INVESTIDORES: '/investidores',
  FOTOGRAFO: '/fotografo',
} as const;

// Firebase collections
export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  PHOTOGRAPHERS: 'photographers',
  INVESTORS: 'investors',
  PAYMENTS: 'payments',
} as const;

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FOTOGRAFO: 'fotografo',
  INVESTIDOR: 'investidor',
} as const;

// Event status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
} as const;

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

// Photographer status
export const PHOTOGRAPHER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Investor status
export const INVESTOR_STATUS = {
  PENDING: 'pending',
  CONTACTED: 'contacted',
  INTERESTED: 'interested',
  NOT_INTERESTED: 'not_interested',
} as const;

// =====================================
// CATEGORIAS DE COMPETIÇÃO
// =====================================

export const CATEGORIAS_COMPETICAO = {
  INICIANTE: {
    value: 'Iniciante',
    label: 'Iniciante',
    description: '0-1 ano de CrossFit',
    icon: '🏃‍♂️',
    color: '#6B7280'
  },
  SCALE: {
    value: 'Scale',
    label: 'Scale',
    description: '1-2 anos de CrossFit',
    icon: '⚡',
    color: '#10B981'
  },
  AMADOR: {
    value: 'Amador',
    label: 'Amador',
    description: '2-3 anos de CrossFit',
    icon: '🏆',
    color: '#F59E0B'
  },
  MASTER_145: {
    value: 'Master 145+',
    label: 'Master 145+',
    description: 'Atletas 45+ anos',
    icon: '👑',
    color: '#8B5CF6'
  },
  RX: {
    value: 'RX',
    label: 'RX',
    description: '3+ anos de CrossFit',
    icon: '🔥',
    color: '#EF4444'
  }
} as const;

// =====================================
// TIPOS DE USUÁRIO
// =====================================

export const TIPOS_USUARIO = {
  ATLETA: {
    value: 'atleta',
    label: 'Atleta',
    description: 'Participante da competição',
    icon: '🏃‍♂️',
    color: '#10B981'
  },
  AUDIOVISUAL: {
    value: 'audiovisual',
    label: 'Audiovisual',
    description: 'Profissional de mídia',
    icon: '📸',
    color: '#8B5CF6'
  },
  PUBLICO: {
    value: 'publico',
    label: 'Público',
    description: 'Público geral',
    icon: '👥',
    color: '#6B7280'
  },
  MARKETING: {
    value: 'marketing',
    label: 'Marketing',
    description: 'Profissional de marketing',
    icon: '📢',
    color: '#F59E0B'
  },
  PARCEIRO: {
    value: 'parceiro',
    label: 'Parceiro',
    description: 'Parceiro comercial',
    icon: '🤝',
    color: '#10B981'
  },
  JUDGE: {
    value: 'judge',
    label: 'Judge',
    description: 'Juiz da competição',
    icon: '⚖️',
    color: '#F59E0B'
  },
  ESPECTADOR: {
    value: 'espectador',
    label: 'Espectador',
    description: 'Acompanhante do evento',
    icon: '👥',
    color: '#6B7280'
  },
  MIDIA: {
    value: 'midia',
    label: 'Mídia',
    description: 'Profissional de comunicação',
    icon: '📸',
    color: '#8B5CF6'
  }
} as const;

// =====================================
// FUNÇÕES UTILITÁRIAS
// =====================================

export function getCategoriaInfo(categoria: string) {
  return Object.values(CATEGORIAS_COMPETICAO).find(cat => cat.value === categoria) || CATEGORIAS_COMPETICAO.INICIANTE;
}

export function getTipoUsuarioInfo(tipo: string) {
  return Object.values(TIPOS_USUARIO).find(t => t.value === tipo) || TIPOS_USUARIO.ATLETA;
}

export function getCategoriasArray() {
  return Object.values(CATEGORIAS_COMPETICAO);
}

export function getTiposUsuarioArray() {
  return Object.values(TIPOS_USUARIO);
}

export function getCategoriasArrayFromFirestore(categoriasMap: any) {
  if (!categoriasMap || typeof categoriasMap !== 'object') return [];
  return Object.entries(categoriasMap)
    .filter(([_, value]) => value && typeof value === 'object')
    .map(([key, value]) => ({
      key,
      ...(value as Record<string, any>)
    }));
}

// =====================================
// TIPOS TYPESCRIPT
// =====================================

export type UserType = typeof TIPOS_USUARIO[keyof typeof TIPOS_USUARIO]['value'];
export type CategoriaType = typeof CATEGORIAS_COMPETICAO[keyof typeof CATEGORIAS_COMPETICAO]['value']; 