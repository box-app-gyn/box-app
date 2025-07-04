const VALID_USER_TYPES = ['atleta', 'audiovisual', 'publico'] as const;
type UserType = typeof VALID_USER_TYPES[number];

export const getValidatedUserType = (): UserType => {
  try {
    const stored = localStorage.getItem('userType');
    if (stored && VALID_USER_TYPES.includes(stored as UserType)) {
      return stored as UserType;
    }
  } catch (error) {
    console.error('Error reading localStorage:', error);
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
  FORM_DATA: 'cerrado_form_data',
  TEAM_DATA: 'cerrado_team_data',
  CATEGORIA: 'cerrado_categoria',
  PAYMENT_STATUS: 'cerrado_payment_status',
  USER_PREFERENCES: 'cerrado_user_prefs'
} as const;

// Classe principal para gerenciar storage
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

  // Salvar dados do formulário
  saveFormData(data: Partial<FormData>): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const existingData = this.getFormData();
      const updatedData = {
        ...existingData,
        ...data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(updatedData));
      console.log('✅ Dados do formulário salvos:', updatedData);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados do formulário:', error);
      return false;
    }
  }

  // Obter dados do formulário
  getFormData(): FormData {
    if (!this.checkAvailability()) return {};

    try {
      const data = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Erro ao obter dados do formulário:', error);
      return {};
    }
  }

  // Salvar dados do time
  saveTeamData(data: Partial<TeamData>): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const existingData = this.getTeamData();
      const updatedData = {
        ...existingData,
        ...data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.TEAM_DATA, JSON.stringify(updatedData));
      console.log('✅ Dados do time salvos:', updatedData);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados do time:', error);
      return false;
    }
  }

  // Obter dados do time
  getTeamData(): TeamData {
    if (!this.checkAvailability()) return {};

    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_DATA);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Erro ao obter dados do time:', error);
      return {};
    }
  }

  // Salvar categoria escolhida
  saveCategoria(categoria: string): boolean {
    if (!this.checkAvailability()) return false;

    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIA, categoria);
      console.log('✅ Categoria salva:', categoria);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar categoria:', error);
      return false;
    }
  }

  // Obter categoria escolhida
  getCategoria(): string | null {
    if (!this.checkAvailability()) return null;

    try {
      return localStorage.getItem(STORAGE_KEYS.CATEGORIA);
    } catch (error) {
      console.error('❌ Erro ao obter categoria:', error);
      return null;
    }
  }

  // Salvar status de pagamento
  savePaymentStatus(status: 'pendente' | 'pago' | 'cancelado'): boolean {
    if (!this.checkAvailability()) return false;

    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_STATUS, status);
      console.log('✅ Status de pagamento salvo:', status);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar status de pagamento:', error);
      return false;
    }
  }

  // Obter status de pagamento
  getPaymentStatus(): 'pendente' | 'pago' | 'cancelado' | null {
    if (!this.checkAvailability()) return null;

    try {
      const status = localStorage.getItem(STORAGE_KEYS.PAYMENT_STATUS);
      return status as 'pendente' | 'pago' | 'cancelado' | null;
    } catch (error) {
      console.error('❌ Erro ao obter status de pagamento:', error);
      return null;
    }
  }

  // Salvar dados parciais
  savePartialData(key: string, value: any): boolean {
    if (!this.checkAvailability()) return false;

    try {
      const existingData = this.getFormData();
      const updatedData = {
        ...existingData,
        dadosParciais: {
          ...existingData.dadosParciais,
          [key]: value
        },
        timestamp: Date.now()
      };
      
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(updatedData));
      console.log('✅ Dados parciais salvos:', { key, value });
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados parciais:', error);
      return false;
    }
  }

  // Obter dados parciais
  getPartialData(key: string): any {
    if (!this.checkAvailability()) return null;

    try {
      const formData = this.getFormData();
      return formData.dadosParciais?.[key] || null;
    } catch (error) {
      console.error('❌ Erro ao obter dados parciais:', error);
      return null;
    }
  }

  // Limpar dados específicos
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
      console.log('✅ Dados limpos:', type);
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      return false;
    }
  }

  // Verificar se há dados salvos
  hasData(): boolean {
    if (!this.checkAvailability()) return false;

    try {
      return Object.values(STORAGE_KEYS).some(key => {
        const data = localStorage.getItem(key);
        return data !== null && data !== '';
      });
    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error);
      return false;
    }
  }

  // Obter todos os dados salvos (para debug)
  getAllData(): Record<string, any> {
    if (!this.checkAvailability()) return {};

    try {
      const allData: Record<string, any> = {};
      Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allData[key] = JSON.parse(data);
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
export const storageManager = new LocalStorageManager();

// Funções de conveniência
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