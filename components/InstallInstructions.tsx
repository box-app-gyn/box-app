'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface InstallInstructionsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function InstallInstructions({ isVisible, onClose }: InstallInstructionsProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        style={{ zIndex: 10001 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Como Instalar
            </h2>
            <p className="text-gray-600">
              Siga os passos abaixo para adicionar o CERRADØ à sua tela inicial
            </p>
          </div>

          {/* Instruções Visuais */}
          <div className="space-y-4 mb-6">
            {/* Passo 1 */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Toque no ícone Compartilhar</h3>
                <p className="text-sm text-gray-600">
                  Localize o ícone <span className="font-mono text-lg">&quot;⎋&quot;</span> na barra de navegação do Safari
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Selecione &quot;Adicionar à Tela Inicial&quot;</h3>
                <p className="text-sm text-gray-600">
                  Role para baixo e toque nesta opção no menu
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Confirme a instalação</h3>
                <p className="text-sm text-gray-600">
                  Toque em &quot;Adicionar&quot; para finalizar
                </p>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Benefícios da instalação:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Acesso direto da tela inicial
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Experiência de app nativo
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Splash screen animada
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Funciona offline
              </li>
            </ul>
          </div>

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Entendi
          </button>

          {/* Botão fechar X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 