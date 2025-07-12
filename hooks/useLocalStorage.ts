import { useState, useEffect, useCallback } from 'react';
import { 
  FormData, 
  TeamData, 
  saveFormData, 
  getFormData, 
  saveTeamData, 
  getTeamData,
  saveCategoria,
  getCategoria,
  savePaymentStatus,
  getPaymentStatus,
  savePartialData,
  getPartialData,
  clearData,
  hasData,
  getAllData
} from '../utils/storage';

// Verificar se está no cliente
const isClient = typeof window !== 'undefined';

// Hook para dados do formulário
export const useFormStorage = () => {
  const [formData, setFormData] = useState<FormData>(isClient ? getFormData() : {});

  // Carregar dados salvos na inicialização
  useEffect(() => {
    if (!isClient) return;
    const savedData = getFormData();
    setFormData(savedData);
  }, []);

  // Salvar dados do formulário
  const saveData = useCallback((data: Partial<FormData>) => {
    if (!isClient) return false;
    const success = saveFormData(data);
    if (success) {
      setFormData(prev => ({ ...prev, ...data }));
    }
    return success;
  }, []);

  // Limpar dados do formulário
  const clearFormData = useCallback(() => {
    if (!isClient) return false;
    const success = clearData('form');
    if (success) {
      setFormData({});
    }
    return success;
  }, []);

  // Salvar dados parciais
  const savePartial = useCallback((key: string, value: any) => {
    if (!isClient) return false;
    const success = savePartialData(key, value);
    if (success) {
      setFormData(prev => ({
        ...prev,
        dadosParciais: {
          ...prev.dadosParciais,
          [key]: value
        }
      }));
    }
    return success;
  }, []);

  return {
    formData,
    saveData,
    clearFormData,
    savePartial,
    getPartial: getPartialData
  };
};

// Hook para dados do time
export const useTeamStorage = () => {
  const [teamData, setTeamData] = useState<TeamData>(isClient ? getTeamData() : {});

  // Carregar dados salvos na inicialização
  useEffect(() => {
    if (!isClient) return;
    const savedData = getTeamData();
    setTeamData(savedData);
  }, []);

  // Salvar dados do time
  const saveData = useCallback((data: Partial<TeamData>) => {
    if (!isClient) return false;
    const success = saveTeamData(data);
    if (success) {
      setTeamData(prev => ({ ...prev, ...data }));
    }
    return success;
  }, []);

  // Limpar dados do time
  const clearTeamData = useCallback(() => {
    if (!isClient) return false;
    const success = clearData('team');
    if (success) {
      setTeamData({});
    }
    return success;
  }, []);

  return {
    teamData,
    saveData,
    clearTeamData
  };
};

// Hook para categoria
export const useCategoriaStorage = () => {
  const [categoria, setCategoria] = useState<string | null>(isClient ? getCategoria() : null);

  // Carregar categoria salva na inicialização
  useEffect(() => {
    if (!isClient) return;
    const savedCategoria = getCategoria();
    setCategoria(savedCategoria);
  }, []);

  // Salvar categoria
  const saveCategoriaData = useCallback((newCategoria: string) => {
    if (!isClient) return false;
    const success = saveCategoria(newCategoria);
    if (success) {
      setCategoria(newCategoria);
    }
    return success;
  }, []);

  // Limpar categoria
  const clearCategoria = useCallback(() => {
    if (!isClient) return false;
    const success = clearData('categoria');
    if (success) {
      setCategoria(null);
    }
    return success;
  }, []);

  return {
    categoria,
    saveCategoria: saveCategoriaData,
    clearCategoria
  };
};

// Hook para status de pagamento
export const usePaymentStorage = () => {
  const [paymentStatus, setPaymentStatus] = useState<'pendente' | 'pago' | 'cancelado' | null>(isClient ? getPaymentStatus() : null);

  // Carregar status salvo na inicialização
  useEffect(() => {
    if (!isClient) return;
    const savedStatus = getPaymentStatus();
    setPaymentStatus(savedStatus);
  }, []);

  // Salvar status de pagamento
  const saveStatus = useCallback((status: 'pendente' | 'pago' | 'cancelado') => {
    if (!isClient) return false;
    const success = savePaymentStatus(status);
    if (success) {
      setPaymentStatus(status);
    }
    return success;
  }, []);

  // Limpar status de pagamento
  const clearPaymentStatus = useCallback(() => {
    if (!isClient) return false;
    const success = clearData('payment');
    if (success) {
      setPaymentStatus(null);
    }
    return success;
  }, []);

  return {
    paymentStatus,
    saveStatus,
    clearPaymentStatus
  };
};

// Hook principal que combina tudo
export const useLocalStorage = () => {
  const formStorage = useFormStorage();
  const teamStorage = useTeamStorage();
  const categoriaStorage = useCategoriaStorage();
  const paymentStorage = usePaymentStorage();

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    if (!isClient) return false;
    const success = clearData('all');
    if (success) {
      formStorage.clearFormData();
      teamStorage.clearTeamData();
      categoriaStorage.clearCategoria();
      paymentStorage.clearPaymentStatus();
    }
    return success;
  }, [formStorage, teamStorage, categoriaStorage, paymentStorage]);

  // Verificar se há dados salvos
  const hasSavedData = useCallback(() => {
    if (!isClient) return false;
    return hasData();
  }, []);

  // Obter todos os dados salvos
  const getAllSavedData = useCallback(() => {
    if (!isClient) return {};
    return getAllData();
  }, []);

  return {
    // Dados do formulário
    formData: formStorage.formData,
    saveFormData: formStorage.saveData,
    clearFormData: formStorage.clearFormData,
    savePartialData: formStorage.savePartial,

    // Dados do time
    teamData: teamStorage.teamData,
    saveTeamData: teamStorage.saveData,
    clearTeamData: teamStorage.clearTeamData,

    // Categoria
    categoria: categoriaStorage.categoria,
    saveCategoria: categoriaStorage.saveCategoria,
    clearCategoria: categoriaStorage.clearCategoria,

    // Status de pagamento
    paymentStatus: paymentStorage.paymentStatus,
    savePaymentStatus: paymentStorage.saveStatus,
    clearPaymentStatus: paymentStorage.clearPaymentStatus,

    // Utilitários
    clearAllData,
    hasSavedData,
    getAllSavedData
  };
}; 