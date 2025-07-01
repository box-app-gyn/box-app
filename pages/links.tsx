import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

const LinksPage: React.FC = () => {
  const links = [
    // {
    //   title: 'CADASTRO AUDIOVISUAL',
    //   url: 'https://cerradointerbox.com.br/audiovisual/',
    //   icon: '📸',
    //   color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    // },
    {
      title: 'COMUNIDADE',
      url: 'https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz',
      icon: '💬',
      color: 'bg-gradient-to-r from-green-500 to-teal-500'
    }
  ];

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <Head>
        <title>Links - CERRADØ INTERBOX 2025</title>
        <meta name="description" content="Links oficiais do CERRADØ INTERBOX 2025 - Comunidade e Cadastro Audiovisual" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Links - CERRADØ INTERBOX 2025" />
        <meta property="og:description" content="Comunidade e Cadastro Audiovisual" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cerradointerbox.com.br/links" />
        <meta property="og:image" content="https://cerradointerbox.com.br/images/og-interbox.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Links - CERRADØ INTERBOX 2025" />
        <meta name="twitter:description" content="Comunidade e Cadastro Audiovisual" />
        <meta name="twitter:image" content="https://cerradointerbox.com.br/images/og-interbox.png" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Header */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-dots-pattern"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-4 py-8">
            {/* Logo/Title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-6">
                <img
                  src="/logos/oficial_logo.png"
                  alt="CERRADØ INTERBOX"
                  className="h-36 md:h-48 w-auto"
                />
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto rounded-full"></div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto text-center mb-12 px-4"
            >
              <p className="text-lg md:text-xl leading-relaxed text-gray-300">
                <span className="font-bold text-white">CERRADØ INTERBOX</span> é um ecossistema vivo.
              </p>
              <p className="text-base md:text-lg leading-relaxed text-gray-400 mt-4">
                Mais que competição — é comunidade, dados, pertencimento. A arena não começa no dia do evento. 
                Ela começa quando você entra na <span className="font-semibold text-white">CERRADØ INTERBOX</span>.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-gray-500 mt-4">
                Pré-temporada digital. Arena física gamificada. Pós-evento com comunidade em fluxo.
              </p>
            </motion.div>

            {/* Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-md mx-auto space-y-4"
            >
              {links.map((link, index) => (
                <motion.button
                  key={link.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLinkClick(link.url)}
                  className={`w-full p-6 rounded-2xl ${link.color} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{link.icon}</span>
                      <span className="text-white font-bold text-lg">{link.title}</span>
                    </div>
                    <svg className="w-6 h-6 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12 text-gray-500 text-sm"
            >
              <p>© 2025 CERRADØ INTERBOX</p>
              <p className="mt-2">24 • 25 • 26 de Outubro • Goiânia</p>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-20"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-40 right-10 w-6 h-6 bg-red-500 rounded-full opacity-20"
          />
          <motion.div
            animate={{ 
              x: [0, 15, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute top-1/2 left-20 w-3 h-3 bg-orange-500 rounded-full opacity-20"
          />
        </div>
      </div>
    </>
  );
};

export default LinksPage; 