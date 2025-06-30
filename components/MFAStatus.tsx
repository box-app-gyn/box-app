import React from 'react';

interface MFAStatusProps {
  mfaEnabled: boolean;
  phoneNumber?: string;
}

export default function MFAStatus({ mfaEnabled, phoneNumber }: MFAStatusProps) {
  return (
    <div className={`p-4 rounded-lg border ${
      mfaEnabled 
        ? 'bg-green-500/20 border-green-500/30' 
        : 'bg-yellow-500/20 border-yellow-500/30'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${mfaEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
          {mfaEnabled ? '🔒' : '⚠️'}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${mfaEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
            {mfaEnabled ? 'Verificação em Duas Etapas Ativa' : 'Verificação em Duas Etapas Desativada'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {mfaEnabled 
              ? `Protegido por SMS: ${phoneNumber || 'Telefone configurado'}`
              : 'Recomendamos ativar para maior segurança'
            }
          </p>
        </div>
      </div>
    </div>
  );
} 