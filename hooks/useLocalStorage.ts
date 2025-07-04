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

// Hook para dados do formulário
export const useFormStorage = () => {
  const [formData, setFormData] = useState<FormData>({});

  // Carregar dados salvos na inicialização
  useEffect(() => {
    const savedData = getFormData();
    setFormData(savedData);
  }, []);

  // Salvar dados do formulário
  const saveData = useCallback((data: Partial<FormData>) => {
    const success = saveFormData(data);
    if (success) {
      setFormData(prev => ({ ...prev, ...data }));
    }
    return success;
  }, []);

  // Limpar dados do formulário
  const clearFormData = useCallback(() => {
    const success = clearData('form');
    if (success) {
      setFormData({});
    }
    return success;
  }, []);

  // Salvar dados parciais
  const savePartial = useCallback((key: string, value: any) => {
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
  const [teamData, setTeamData] = useState<TeamData>({});

  // Carregar dados salvos na inicialização
  useEffect(() => {
    const savedData = getTeamData();
    setTeamData(savedData);
  }, []);

  // Salvar dados do time
  const saveData = useCallback((data: Partial<TeamData>) => {
    const success = saveTeamData(data);
    if (success) {
      setTeamData(prev => ({ ...prev, ...data }));
    }
    return success;
  }, []);

  // Limpar dados do time
  const clearTeamData = useCallback(() => {
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
  const [categoria, setCategoria] = useState<string | null>(null);

  // Carregar categoria salva na inicialização
  useEffect(() => {
    const savedCategoria = getCategoria();
    setCategoria(savedCategoria);
  }, []);

  // Salvar categoria
  const saveCategoriaData = useCallback((newCategoria: string) => {
    const success = saveCategoria(newCategoria);
    if (success) {
      setCategoria(newCategoria);
    }
    return success;
  }, []);

  // Limpar categoria
  const clearCategoria = useCallback(() => {
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
  const [paymentStatus, setPaymentStatus] = useState<'pendente' | 'pago' | 'cancelado' | null>(null);

  // Carregar status salvo na inicialização
  useEffect(() => {
    const savedStatus = getPaymentStatus();
    setPaymentStatus(savedStatus);
  }, []);

  // Salvar status de pagamento
  const saveStatus = useCallback((status: 'pendente' | 'pago' | 'cancelado') => {
    const success = savePaymentStatus(status);
    if (success) {
      setPaymentStatus(status);
    }
    return success;
  }, []);

  // Limpar status de pagamento
  const clearPaymentStatus = useCallback(() => {
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
    return hasData();
  }, []);

  // Obter todos os dados (para debug)
  const getAllSavedData = useCallback(() => {
    return getAllData();
  }, []);

  return {
    // Formulário
    formData: formStorage.formData,
    saveFormData: formStorage.saveData,
    clearFormData: formStorage.clearFormData,
    savePartialData: formStorage.savePartial,
    getPartialData: formStorage.getPartial,

    // Time
    teamData: teamStorage.teamData,
    saveTeamData: teamStorage.saveData,
    clearTeamData: teamStorage.clearTeamData,

    // Categoria
    categoria: categoriaStorage.categoria,
    saveCategoria: categoriaStorage.saveCategoria,
    clearCategoria: categoriaStorage.clearCategoria,

    // Pagamento
    paymentStatus: paymentStorage.paymentStatus,
    savePaymentStatus: paymentStorage.saveStatus,
    clearPaymentStatus: paymentStorage.clearPaymentStatus,

    // Utilitários
    clearAllData,
    hasSavedData,
    getAllSavedData
  };
}; 