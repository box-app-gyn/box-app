// Constantes de segurança
const VALID_USER_TYPES = ['atleta', 'audiovisual', 'publico'] as const;
const MAX_STORAGE_SIZE = 1024 * 1024; // 1MB
const MAX_STRING_LENGTH = 1000;
const MAX_OBJECT_KEYS = 50;
const STORAGE_PREFIX = 'cerrado_';

type UserType = typeof VALID_USER_TYPES[number];

// Função para validar e sanitizar strings
const sanitizeString = (value: any, maxLength: number = MAX_STRING_LENGTH): string | null => {
  if (typeof value !== 'string') return null;
  if (value.length > maxLength) return null;
  if (value.includes('<script>') || value.includes('javascript:')) return null;
  return value.trim();
};

// Função para validar e sanitizar objetos
const sanitizeObject = (obj: any, maxKeys: number = MAX_OBJECT_KEYS): Record<string, any> | null => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return null;
  
  const keys = Object.keys(obj);
  if (keys.length > maxKeys) return null;
  
  const sanitized: Record<string, any> = {};
  for (const key of keys) {
    const sanitizedKey = sanitizeString(key, 50);
    if (!sanitizedKey) continue;
    
    const value = obj[key];
    if (typeof value === 'string') {
      const sanitizedValue = sanitizeString(value);
      if (sanitizedValue !== null) {
        sanitized[sanitizedKey] = sanitizedValue;
      }
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[sanitizedKey] = value;
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = value;
    }
  }
  
  return sanitized;
};

export const getValidatedUserType = (): UserType => {
  try {
    if (typeof window === 'undefined') return 'atleta';
    
    const stored = localStorage.getItem('userType');
    if (stored && VALID_USER_TYPES.includes(stored as UserType)) {
      return stored as UserType;
    }
  } catch (error) {
    console.error('Erro ao ler localStorage:', error);
  }
  return 'atleta';
};

// Tipos para dados do formulário
export interface FormData {
  categoria?: string;
  nome?: string;
  email?: string;
  telefone?: string;
  time?: string;
  statusPagamento?: 'pendente' | 'pago' | 'cancelado';
  dadosParciais?: Record<string, any>;
  timestamp?: number;
}

// Tipos para dados do time
export interface TeamData {
  nomeTime?: string;
  integrantes?: string[];
  categoria?: string;
  statusPagamento?: 'pendente' | 'pago' | 'cancelado';
  timestamp?: number;
}

// Chaves para localStorage
const STORAGE_KEYS = {
  FORM_DATA: `${STORAGE_PREFIX}form_data`,
  TEAM_DATA: `${STORAGE_PREFIX}team_data`,
  CATEGORIA: `${STORAGE_PREFIX}categoria`,
  PAYMENT_STATUS: `${STORAGE_PREFIX}payment_status`,
  USER_PREFERENCES: `${STORAGE_PREFIX}user_prefs`
} as const;

// Classe principal para gerenciar storage com segurança
class LocalStorageManager {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = typeof window !== 'undefined' && 'localStorage' in window;
  }

  // Verificar se localStorage está disponível
  private checkAvailability(): boolean {
    if (!this.isAvailable) {
      console.warn('localStorage não está disponível');
      return false;
    }
    return true;
  }

  // Verificar tamanho dos dados antes de salvar
  private checkDataSize(data: any): boolean {
    try {
      const dataString = JSON.stringify(data);
      return dataString.length <= MAX_STORAGE_SIZE;
    } catch (error) {
      console.error('Erro ao verificar tamanho dos dados:', error);
      return false;
    }
  }

  // Validar dados do formulário
  private validateFormData(data: Partial<FormData>): Partial<FormData> | null {
    const validated: Partial<FormData> = {};
    
    if (data.categoria) {
      const sanitized = sanitizeString(data.categoria, 50);
      if (sanitized) validated.categoria = sanitized;
    }
    
    if (data.nome) {
      const sanitized = sanitizeString(data.nome, 100);
      if (sanitized) validated.nome = sanitized;
    }
    
    if (data.email) {
      const sanitized = sanitizeString(data.email, 100);
      if (sanitized && sanitized.includes('@')) validated.email = sanitized;
    }
    
    if (data.telefone) {
      const sanitized = sanitizeString(data.telefone, 20);
      if (sanitized) validated.telefone = sanitized;
    }
    
    if (data.time) {
      const sanitized = sanitizeString(data.time, 100);
      if (sanitized) validated.time = sanitized;
    }
    
    if (data.statusPagamento && ['pendente', 'pago', 'cancelado'].includes(data.statusPagamento)) {
      validated.statusPagamento = data.statusPagamento;
    }
    
    if (data.dadosParciais) {
      const sanitized = sanitizeObject(data.dadosParciais);
      if (sanitized) validated.dadosParciais = sanitized;
    }
    
    validated.timestamp = Date.now();
    
    return validated;
  }

  // Validar dados do time
  private validateTeamData(data: Partial<TeamData>): Partial<TeamData> | null {
    const validated: Partial<TeamData> = {};
    
    if (data.nomeTime) {
      const sanitized = sanitizeString(data.nomeTime, 100);
      if (sanitized) validated.nomeTime = sanitized;
    }
    
    if (data.integrantes && Array.isArray(data.integrantes)) {
      const sanitizedIntegrantes = data.integrantes
        .slice(0, 10) // Limitar a 10 integrantes
        .map(integrante => sanitizeString(integrante, 100))
        .filter(Boolean) as string[];
      
      if (sanitizedIntegrantes.length > 0) {
        validated.integrantes = sanitizedIntegrantes;
      }
    }
    
    if (data.categoria) {
      const sanitized = sanitizeString(data.categoria, 50);
      if (sanitized) validated.categoria = sanitized;
    }
    
    if (data.statusPagamento && ['pendente', 'pago', 'cancelado'].includes(data.statusPagamento)) {
      validated.statusPagamento = data.statusPagamento;
    }
    
    validated.timestamp = Date.now();
    
    return validated;
  }

  // Salvar dados do formulário com validação
  saveFormData(data: Partial<FormData>): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const validatedData = this.validateFormData(data);
      if (!validatedData) {
        console.error('Dados do formulário inválidos');
        return false;
      }

      const existingData = this.getFormData();
      const updatedData = {
        ...existingData,
        ...validatedData
      };
      
      if (!this.checkDataSize(updatedData)) {
        console.error('Dados do formulário muito grandes');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(updatedData));
      console.log('✅ Dados do formulário salvos com segurança');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados do formulário:', error);
      return false;
    }
  }

  // Obter dados do formulário com validação
  getFormData(): FormData {
    if (!this.checkAvailability()) return {};

    try {
      const data = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      if (!data) return {};
      
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return {};
      
      // Validar dados recuperados
      const validated = this.validateFormData(parsed);
      return validated || {};
    } catch (error) {
      console.error('❌ Erro ao obter dados do formulário:', error);
      return {};
    }
  }

  // Salvar dados do time com validação
  saveTeamData(data: Partial<TeamData>): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const validatedData = this.validateTeamData(data);
      if (!validatedData) {
        console.error('Dados do time inválidos');
        return false;
      }

      const existingData = this.getTeamData();
      const updatedData = {
        ...existingData,
        ...validatedData
      };
      
      if (!this.checkDataSize(updatedData)) {
        console.error('Dados do time muito grandes');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.TEAM_DATA, JSON.stringify(updatedData));
      console.log('✅ Dados do time salvos com segurança');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados do time:', error);
      return false;
    }
  }

  // Obter dados do time com validação
  getTeamData(): TeamData {
    if (!this.checkAvailability()) return {};

    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_DATA);
      if (!data) return {};
      
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return {};
      
      // Validar dados recuperados
      const validated = this.validateTeamData(parsed);
      return validated || {};
    } catch (error) {
      console.error('❌ Erro ao obter dados do time:', error);
      return {};
    }
  }

  // Salvar categoria escolhida com validação
  saveCategoria(categoria: string): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const sanitized = sanitizeString(categoria, 50);
      if (!sanitized) {
        console.error('Categoria inválida');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.CATEGORIA, sanitized);
      console.log('✅ Categoria salva com segurança');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar categoria:', error);
      return false;
    }
  }

  // Obter categoria escolhida com validação
  getCategoria(): string | null {
    if (!this.checkAvailability()) return null;

    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIA);
      if (!data) return null;
      
      const sanitized = sanitizeString(data, 50);
      return sanitized;
    } catch (error) {
      console.error('❌ Erro ao obter categoria:', error);
      return null;
    }
  }

  // Salvar status de pagamento com validação
  savePaymentStatus(status: 'pendente' | 'pago' | 'cancelado'): boolean {
    if (!this.checkAvailability()) return false;

    try {
      if (!['pendente', 'pago', 'cancelado'].includes(status)) {
        console.error('Status de pagamento inválido');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.PAYMENT_STATUS, status);
      console.log('✅ Status de pagamento salvo com segurança');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar status de pagamento:', error);
      return false;
    }
  }

  // Obter status de pagamento com validação
  getPaymentStatus(): 'pendente' | 'pago' | 'cancelado' | null {
    if (!this.checkAvailability()) return null;

    try {
      const status = localStorage.getItem(STORAGE_KEYS.PAYMENT_STATUS);
      if (!status || !['pendente', 'pago', 'cancelado'].includes(status)) {
        return null;
      }
      return status as 'pendente' | 'pago' | 'cancelado';
    } catch (error) {
      console.error('❌ Erro ao obter status de pagamento:', error);
      return null;
    }
  }

  // Salvar dados parciais com validação
  savePartialData(key: string, value: any): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const sanitizedKey = sanitizeString(key, 50);
      if (!sanitizedKey) {
        console.error('Chave inválida para dados parciais');
        return false;
      }
      
      let sanitizedValue: any = null;
      if (typeof value === 'string') {
        sanitizedValue = sanitizeString(value);
      } else if (typeof value === 'number' && isFinite(value)) {
        sanitizedValue = value;
      } else if (typeof value === 'boolean') {
        sanitizedValue = value;
      } else if (typeof value === 'object' && value !== null) {
        sanitizedValue = sanitizeObject(value);
      }
      
      if (sanitizedValue === null) {
        console.error('Valor inválido para dados parciais');
        return false;
      }

      const existingData = this.getFormData();
      const updatedData = {
        ...existingData,
        dadosParciais: {
          ...existingData.dadosParciais,
          [sanitizedKey]: sanitizedValue
        },
        timestamp: Date.now()
      };
      
      if (!this.checkDataSize(updatedData)) {
        console.error('Dados parciais muito grandes');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(updatedData));
      console.log('✅ Dados parciais salvos com segurança');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados parciais:', error);
      return false;
    }
  }

  // Obter dados parciais com validação
  getPartialData(key: string): any {
    if (!this.checkAvailability()) return null;

    try {
      const sanitizedKey = sanitizeString(key, 50);
      if (!sanitizedKey) return null;
      
      const formData = this.getFormData();
      const dadosParciais = formData.dadosParciais;
      
      if (!dadosParciais || typeof dadosParciais !== 'object') return null;
      
      return dadosParciais[sanitizedKey] || null;
    } catch (error) {
      console.error('❌ Erro ao obter dados parciais:', error);
      return null;
    }
  }

  // Limpar dados com validação
  clearData(type: 'form' | 'team' | 'categoria' | 'payment' | 'all'): boolean {
    if (!this.checkAvailability()) return false;

    try {
      switch (type) {
        case 'form':
          localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
          break;
        case 'team':
          localStorage.removeItem(STORAGE_KEYS.TEAM_DATA);
          break;
        case 'categoria':
          localStorage.removeItem(STORAGE_KEYS.CATEGORIA);
          break;
        case 'payment':
          localStorage.removeItem(STORAGE_KEYS.PAYMENT_STATUS);
          break;
        case 'all':
          Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
          });
          break;
      }
      console.log(`✅ Dados ${type} limpos com segurança`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao limpar dados ${type}:`, error);
      return false;
    }
  }

  // Verificar se há dados salvos
  hasData(): boolean {
    if (!this.checkAvailability()) return false;

    try {
      return Object.values(STORAGE_KEYS).some(key => {
        const data = localStorage.getItem(key);
        return data !== null && data.length > 0;
      });
    } catch (error) {
      console.error('❌ Erro ao verificar dados salvos:', error);
      return false;
    }
  }

  // Obter todos os dados (para debug) com validação
  getAllData(): Record<string, any> {
    if (!this.checkAvailability()) return {};

    try {
      const allData: Record<string, any> = {};
      
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const data = localStorage.getItem(storageKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            allData[key] = parsed;
          } catch {
            allData[key] = data;
          }
        }
      });
      
      return allData;
    } catch (error) {
      console.error('❌ Erro ao obter todos os dados:', error);
      return {};
    }
  }
}

// Instância singleton
const storageManager = new LocalStorageManager();

// Exportar funções seguras
export const saveFormData = (data: Partial<FormData>) => storageManager.saveFormData(data);
export const getFormData = () => storageManager.getFormData();
export const saveTeamData = (data: Partial<TeamData>) => storageManager.saveTeamData(data);
export const getTeamData = () => storageManager.getTeamData();
export const saveCategoria = (categoria: string) => storageManager.saveCategoria(categoria);
export const getCategoria = () => storageManager.getCategoria();
export const savePaymentStatus = (status: 'pendente' | 'pago' | 'cancelado') => storageManager.savePaymentStatus(status);
export const getPaymentStatus = () => storageManager.getPaymentStatus();
export const savePartialData = (key: string, value: any) => storageManager.savePartialData(key, value);
export const getPartialData = (key: string) => storageManager.getPartialData(key);
export const clearData = (type: 'form' | 'team' | 'categoria' | 'payment' | 'all') => storageManager.clearData(type);
export const hasData = () => storageManager.hasData();
export const getAllData = () => storageManager.getAllData(); 