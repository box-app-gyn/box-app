import React, { useState } from 'react';
import Link from 'next/link';

export default function TesteSimplesPage() {
  const [status, setStatus] = useState('Pronto para teste');

  const handleTest = () => {
    setStatus('Teste iniciado!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          🧪 Teste Simples
        </h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Esta página funciona sem redirecionamentos
          </p>
          <p className="text-sm text-gray-500">
            Status: {status}
          </p>
        </div>

        <button
          onClick={handleTest}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Testar
        </button>

        <div className="mt-6 text-center">
          <Link 
            href="/pagamento" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ir para pagamento
          </Link>
        </div>
      </div>
    </div>
  );
} 