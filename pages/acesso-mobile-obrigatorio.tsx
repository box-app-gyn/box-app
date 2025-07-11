import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function AcessoMobileObrigatorio() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('https://cerradointerbox.com.br');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Acesso Mobile Obrigatório - Cerrado Interbox</title>
        <meta name="description" content="Acesse a plataforma oficial do Cerrado Interbox pelo seu celular" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background limpo sem degradê */}
        <Image
          src="/images/bg_1.webp"
          alt="Background Cerrado Interbox"
          fill
          style={{ objectFit: 'cover', zIndex: 0 }}
          className="absolute inset-0"
          priority
        />
        
        {/* Card principal com backdrop-blur mais sutil */}
        <div className="relative max-w-md w-full bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10 shadow-xl overflow-hidden z-10">
          {/* Decoração de canto */}
          <Image
            src="/images/corner.png"
            alt="Decoração de canto"
            width={90}
            height={90}
            className="absolute top-0 left-0 z-10"
            style={{ pointerEvents: 'none', width: 'auto', height: 'auto' }}
            priority
          />
          
          {/* Logo */}
          <div className="mb-6">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logos/oficial_logo.png"
                alt="Cerrado Interbox"
                width={400}
                height={400}
                className="h-40 w-auto"
                priority
              />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
            ⚠️ Acesse pelo celular
          </h1>

          {/* Texto Explicativo */}
          <p className="text-gray-200 mb-8 leading-relaxed drop-shadow-md">
            Use o QR Code abaixo para acessar a plataforma oficial no seu celular.
          </p>

          {/* QR Code */}
          <div className="mb-8">
            <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
              <Image
                src="/qrcode_cerrado.png"
                alt="QR Code para acesso mobile"
                width={200}
                height={200}
                className="rounded-lg"
                priority
                unoptimized
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                onError={(e) => {
                  console.error('Erro ao carregar QR code:', e);
                  // Fallback para texto se a imagem falhar
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '📱 QR Code<br/>Escaneie com seu celular';
                  fallback.className = 'text-center text-gray-600 font-semibold';
                  fallback.style.width = '200px';
                  fallback.style.height = '200px';
                  fallback.style.display = 'flex';
                  fallback.style.alignItems = 'center';
                  fallback.style.justifyContent = 'center';
                  target.parentNode?.appendChild(fallback);
                }}
                onLoad={() => {
                  console.log('QR code carregado com sucesso');
                }}
              />
            </div>
          </div>

          {/* Botão Copiar Link */}
          <button
            onClick={copyToClipboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Link copiado!' : 'Copiar link para celular'}
          </button>

          {/* Texto Adicional */}
          <p className="text-sm text-gray-300 mt-6 drop-shadow-sm">
            A plataforma é otimizada para dispositivos móveis
          </p>
        </div>
      </div>
    </>
  );
} 