// /components/Beneficios.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import GamifiedCTA from './GamifiedCTA';

export default function Beneficios() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center py-24 px-4 bg-white overflow-visible">
      <div>
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-16 text-neutral-900 z-10 whitespace-pre-line">
          <span>
            Aqui, a comunidade é protagonista.
            <br />
            <span className="text-pink-600">INTERBØX PRÉ TEMPORADA 2025, o evento já começou!</span>
          </span>
        </h3>
        <div className="w-full flex justify-center items-center pointer-events-none select-none mb-12">
          <motion.div
            initial={{ y: 0, opacity: 0.95 }}
            animate={{ y: [0, -12, 0], opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-30"
            style={{ pointerEvents: 'none' }}
          >
            <div className="absolute left-1/2 -bottom-6 -translate-x-1/2 w-56 h-8 bg-black/30 blur-xl rounded-full opacity-70 z-0" />
            <Image
              src="/images/cellphone.png"
              alt="Comunidade CERRADO INTERBØX"
              width={260}
              height={520}
              className="rounded-3xl shadow-none relative z-10"
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </motion.div>
        </div>
        <GamifiedCTA 
          href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
          tooltipText="JUNTE-SE À COMUNIDADE"
          className="inline-block mt-4 px-8 py-4 bg-pink-600 text-white text-lg font-bold rounded-xl shadow-md hover:bg-pink-500 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25"
        >
          Entrar para a comunidade
        </GamifiedCTA>
      </div>
    </section>
  );
}