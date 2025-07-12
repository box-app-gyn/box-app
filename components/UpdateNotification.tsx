import React, { useState } from 'react';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-500 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Nova versão disponível</p>
            <p className="text-sm text-blue-100">Clique para atualizar a aplicação</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onUpdate}
            className="bg-white text-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Atualizar
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification; 