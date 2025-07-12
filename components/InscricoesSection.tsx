import React from 'react';
import Image from 'next/image';

export default function InscricoesSection() {
  const categorias = [
    {
      nome: 'Categoria RX',
      preco: 'R$ 1.979,80',
      link: 'https://pay.infinitepay.io/cerrado-interbox-712/VC1D-BKfDO5Pr-1979,80',
      descricao: 'Categoria especial para atletas experientes',
      destaque: true
    },
    {
      nome: 'Todas as Demais Categorias',
      preco: 'R$ 1.579,80',
      link: 'https://pay.infinitepay.io/cerrado-interbox-712/VC1D-5tal6TwmLr-1579,80',
      descricao: 'Categorias: RX, Scaled, Masters, Teens, etc.',
      destaque: false
    }
  ];

  return (
    <section id="inscricoes" className="py-20 bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            INSCRIÇÕES
          </h2>
          <p className="text-xl text-pink-400 font-tech mb-4">
            PRIMEIRO LOTE - Vagas Limitadas
          </p>
          <div className="w-24 h-1 bg-pink-500 mx-auto mb-8"></div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Garanta sua vaga no maior evento de CrossFit do Centro-Oeste! 
            Escolha sua categoria e faça sua inscrição agora.
          </p>
        </div>

        {/* Cards de Categorias */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {categorias.map((categoria, index) => (
            <div
              key={index}
              className={`relative group ${
                categoria.destaque 
                  ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500/50' 
                  : 'bg-black/60 border border-pink-500/30'
              } backdrop-blur rounded-2xl p-8 hover:scale-105 transition-all duration-300`}
            >
              {/* Badge de destaque */}
              {categoria.destaque && (
                <div className="absolute -top-4 -right-4 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  MAIS POPULAR
                </div>
              )}

              {/* Conteúdo */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {categoria.nome}
                </h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-pink-400">
                    {categoria.preco}
                  </span>
                </div>

                <p className="text-gray-300 mb-8">
                  {categoria.descricao}
                </p>

                {/* Botão de inscrição */}
                <a
                  href={categoria.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-block w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                    categoria.destaque
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/25'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                  } hover:scale-105 hover:shadow-xl`}
                >
                  INSCREVER-SE AGORA
                </a>

                {/* Informações adicionais */}
                <div className="mt-6 text-sm text-gray-400">
                  <p>✓ Pagamento seguro</p>
                  <p>✓ Confirmação imediata</p>
                  <p>✓ Suporte 24/7</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informações importantes */}
        <div className="mt-16 text-center">
          <div className="bg-black/40 backdrop-blur rounded-xl p-8 max-w-3xl mx-auto border border-pink-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">
              ⚠️ IMPORTANTE
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="text-pink-400 font-bold mb-3">📅 Datas Importantes:</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Primeiro lote: Vagas limitadas</li>
                  <li>• Confirmação: Imediata após pagamento</li>
                  <li>• Evento: Data a ser confirmada</li>
                </ul>
              </div>
              <div>
                <h4 className="text-pink-400 font-bold mb-3">💳 Formas de Pagamento:</h4>
                <ul className="text-gray-300 space-y-2">
                  <li>• Cartão de crédito</li>
                  <li>• Cartão de débito</li>
                  <li>• PIX</li>
                  <li>• Boleto bancário</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-300 mb-6">
            Dúvidas? Entre em contato conosco:
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://wa.me/5561999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              📱 WhatsApp
            </a>
            <a
              href="mailto:contato@interbox.com"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              📧 Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 