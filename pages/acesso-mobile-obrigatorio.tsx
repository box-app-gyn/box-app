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
        {/* Background total */}
        <Image
          src="/images/bg_main.png"
          alt="Background Cerrado Interbox"
          fill
          style={{ objectFit: 'cover', zIndex: 0 }}
          className="absolute inset-0"
          priority
        />
        <div className="relative max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20 shadow-2xl overflow-hidden z-10">
          {/* Decoração de canto */}
          <Image
            src="/images/corner.png"
            alt="Decoração de canto"
            width={120}
            height={40}
            className="absolute top-0 left-0 z-10"
            style={{ pointerEvents: 'none', height: 'auto' }}
            priority
          />
          {/* Logo */}
          <div className="mb-6">
            <div className="flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logos/nome_hrz.png"
                alt="Cerrado Interbox"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-white mb-4">
            ⚠️ Acesse pelo celular
          </h1>

          {/* Texto Explicativo */}
          <p className="text-gray-300 mb-8 leading-relaxed">
            Use o QR Code abaixo para acessar a plataforma oficial no seu celular.
          </p>

          {/* QR Code */}
          <div className="mb-8">
            <div className="bg-white p-4 rounded-xl inline-block">
              <Image
                src="/qrcode_cerrado.png"
                alt="QR Code para acesso mobile"
                width={200}
                height={200}
                className="rounded-lg"
                priority
              />
            </div>
          </div>

          {/* Botão Copiar Link */}
          <button
            onClick={copyToClipboard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Link copiado!' : 'Copiar link para celular'}
          </button>

          {/* Texto Adicional */}
          <p className="text-sm text-gray-400 mt-6">
            A plataforma é otimizada para dispositivos móveis
          </p>
        </div>
      </div>
    </>
  );
} 