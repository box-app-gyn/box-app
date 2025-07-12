import React from 'react';
import Head from 'next/head';

const NoScript: React.FC = () => {
  return (
    <>
      <Head>
        <title>JavaScript Necessário - Cerrado Interbox</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              JavaScript Necessário
            </h1>
            
            <p className="text-gray-600 mb-6">
              Este aplicativo requer JavaScript para funcionar corretamente. 
              Por favor, habilite o JavaScript no seu navegador e recarregue a página.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Como habilitar JavaScript:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Configurações do site → JavaScript</li>
                <li><strong>Firefox:</strong> about:config → javascript.enabled = true</li>
                <li><strong>Safari:</strong> Preferências → Segurança → Habilitar JavaScript</li>
                <li><strong>Edge:</strong> Configurações → Cookies e permissões do site → JavaScript</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Recarregar Página
            </button>

            <div className="text-xs text-gray-500">
              Se o problema persistir, entre em contato com o suporte.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoScript; 