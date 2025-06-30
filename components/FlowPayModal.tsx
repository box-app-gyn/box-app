import { useState, useCallback } from 'react';
import Image from 'next/image';

interface FlowPayModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  pixCode: string;
  qrCodeUrl: string;
  status?: 'pending' | 'paid' | 'expired';
}

export default function FlowPayModal({ 
  open, 
  onClose, 
  amount, 
  pixCode, 
  qrCodeUrl, 
  status = 'pending' 
}: FlowPayModalProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  // Validar props
  const isValidAmount = typeof amount === 'number' && amount > 0 && amount <= 10000;
  const isValidPixCode = typeof pixCode === 'string' && pixCode.length > 0;
  const isValidQrCodeUrl = typeof qrCodeUrl === 'string' && qrCodeUrl.length > 0;

  const handleCopy = useCallback(async () => {
    try {
      setCopyError(null);
      if (!isValidPixCode) {
        throw new Error('Código PIX inválido');
      }
      if (!navigator.clipboard) {
        const textArea = document.createElement('textarea');
        textArea.value = pixCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          throw new Error('Falha ao copiar código PIX');
        } finally {
          document.body.removeChild(textArea);
        }
        return;
      }
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
      setCopyError(error instanceof Error ? error.message : 'Erro desconhecido');
      setTimeout(() => setCopyError(null), 3000);
    }
  }, [pixCode, isValidPixCode]);

  const handleClose = useCallback(() => {
    setCopied(false);
    setCopyError(null);
    onClose();
  }, [onClose]);

  if (!open) return null;

  // Renderizar erro se dados inválidos
  if (!isValidAmount || !isValidPixCode || !isValidQrCodeUrl) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-[#0a0a1a] to-[#0038d0] border-2 border-red-500 rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
          <button onClick={handleClose} className="absolute top-4 right-4 text-red-500 text-2xl font-bold hover:text-white transition-colors">×</button>
          <h2 className="text-2xl font-bold text-red-500 mb-4 text-center tracking-wider">Erro de Dados</h2>
          <div className="text-center text-white">
            <p>Dados de pagamento inválidos ou incompletos.</p>
            <p className="text-sm text-gray-400 mt-2">Entre em contato com o suporte.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#0a0a1a] to-[#0038d0] border-2 border-interbox-pink rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-interbox-pink text-2xl font-bold hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold text-interbox-pink mb-2 text-center tracking-wider">
          Pagamento PIX
        </h2>
        
        <div className="text-center text-lg text-interbox-cyan mb-6">
          Valor: <span className="font-bold">R$ {amount.toFixed(2)}</span>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Image 
              src={qrCodeUrl} 
              alt="QR Code PIX" 
              width={192} 
              height={192} 
              className="w-48 h-48 rounded-xl shadow-neon-pink border-2 border-interbox-cyan"
              onError={(e) => {
                console.error('Erro ao carregar QR Code:', e);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          <button 
            onClick={handleCopy} 
            className="btn-neon-pulse px-6 py-2 mt-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValidPixCode}
          >
            {copied ? 'Código copiado!' : 'Copiar código PIX'}
          </button>
          
          {copyError && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 px-3 py-2 rounded-lg">
              {copyError}
            </div>
          )}
          
          <div className="bg-black/60 rounded-lg px-4 py-2 text-interbox-cyan font-mono text-sm break-all select-all border border-interbox-cyan/30 mt-2">
            {pixCode}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          {status === 'pending' && (
            <span className="text-yellow-400 animate-pulse">
              Aguardando pagamento...
            </span>
          )}
          {status === 'paid' && (
            <span className="text-green-400 font-bold animate-fade-in">
              Pagamento confirmado! ✔
            </span>
          )}
          {status === 'expired' && (
            <span className="text-red-400 font-bold animate-fade-in">
              Expirado. Gere um novo PIX.
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 