import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TestImages() {
  const [imageStatus, setImageStatus] = useState<Record<string, string>>({});

  const testImages = [
    '/logos/logo_circulo.png',
    '/logos/oficial_logo.png',
    '/logos/nome_hrz.png',
    '/images/bg_main.png',
    '/images/twolines.png',
    '/images/liner.png',
    '/qrcode_cerrado.png'
  ];

  useEffect(() => {
    testImages.forEach(src => {
      const img = new window.Image();
      img.onload = () => {
        setImageStatus(prev => ({ ...prev, [src]: '✅ Carregou' }));
      };
      img.onerror = () => {
        setImageStatus(prev => ({ ...prev, [src]: '❌ Falhou' }));
      };
      img.src = src;
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Teste de Carregamento de Imagens</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status das imagens */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Status de Carregamento</h2>
          {testImages.map(src => (
            <div key={src} className="flex items-center justify-between mb-2">
              <span className="text-sm">{src}</span>
              <span className={imageStatus[src]?.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                {imageStatus[src] || '⏳ Testando...'}
              </span>
            </div>
          ))}
        </div>

        {/* Visualização das imagens */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Visualização</h2>
          <div className="space-y-4">
            {testImages.map(src => (
              <div key={src} className="border border-gray-600 p-4 rounded">
                <p className="text-sm text-gray-400 mb-2">{src}</p>
                <div className="relative w-32 h-32 bg-gray-700 rounded overflow-hidden">
                  <Image
                    src={src}
                    alt="Teste"
                    fill
                    className="object-contain"
                    onLoad={() => console.log('✅ Carregou:', src)}
                    onError={() => console.log('❌ Falhou:', src)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teste de background CSS */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Teste de Background CSS</h2>
        <div 
          className="w-full h-32 bg-cover bg-center bg-no-repeat border border-gray-600 rounded"
          style={{ backgroundImage: 'url(/images/bg_main.png)' }}
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-white font-bold">Background Image Test</span>
          </div>
        </div>
      </div>

      {/* Botões de teste */}
      <div className="mt-8 space-x-4">
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
        >
          Recarregar Página
        </button>
        <button 
          onClick={() => {
            testImages.forEach(src => {
              const img = new window.Image();
              img.onload = () => console.log('✅', src, 'carregou');
              img.onerror = () => console.log('❌', src, 'falhou');
              img.src = src;
            });
          }}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
        >
          Testar no Console
        </button>
      </div>
    </div>
  );
} 