import { useState } from 'react';

interface CreateChargeParams {
  correlationID: string;
  value: number;
  comment?: string;
}

interface ChargeResponse {
  correlationID: string;
  value: number;
  status: string;
  pixKey?: string;
  qrCode?: string;
  expiresAt?: string;
}

export const useFlowPay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createCharge = async (params: CreateChargeParams): Promise<ChargeResponse> => {
    setIsLoading(true);
    setError(null);
    setQrCode(null);

    try {
      const response = await fetch('/api/flowpay/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: ChargeResponse = await response.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (correlationID: string): Promise<ChargeResponse> => {
    try {
      const response = await fetch(`/api/flowpay/status/${correlationID}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    }
  };

  const reset = () => {
    setIsLoading(false);
    setQrCode(null);
    setError(null);
  };

  return {
    createCharge,
    checkPaymentStatus,
    isLoading,
    qrCode,
    error,
    reset
  };
}; 