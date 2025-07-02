import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import CerradoChat from './CerradoChat';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { trackAudiovisual } = useAnalytics();

  const handleOpenChat = () => {
    setIsChatOpen(true);
    trackAudiovisual('open_chat', 'chat_button_click');
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    trackAudiovisual('close_chat', 'chat_close');
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={handleOpenChat}
        className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 z-40 flex items-center justify-center"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <div className="relative">
          <Image 
            src="/logos/barbell.png" 
            alt="CERRADØ Assistant" 
            width={32}
            height={32}
            className="object-contain"
          />
          
          {/* Indicador de pulso */}
          <motion.div
            className="absolute inset-0 bg-pink-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-4 right-20 bg-black/90 text-white px-3 py-2 rounded-lg text-sm border border-pink-500/30 z-30"
          >
            <p className="whitespace-nowrap">Pergunte sobre o CERRADØ! 🤖</p>
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-black/90 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat */}
      <CerradoChat isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
} 