// /components/Hero.tsx
import { motion } from 'framer-motion';
import GamifiedCTA from './GamifiedCTA';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';


function useDeviceParallax(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function handleOrientation(event: DeviceOrientationEvent) {
      if (!el) return;
      const x = event.gamma || 0; // left-right
      const y = event.beta || 0;  // front-back
      el.style.transform = `translate3d(${x * 0.8}px, ${y * 0.5}px, 0)`;
    }
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [ref]);
}

export default function Hero() {
  const logoRef = useRef<HTMLDivElement>(null);

  const [strobeActive, setStrobeActive] = useState(false);
  useDeviceParallax(logoRef);

  // Efeito strobo a cada 400 segundos
  useEffect(() => {
    const strobeInterval = setInterval(() => {
      setStrobeActive(true);
      setTimeout(() => setStrobeActive(false), 200); // Strobe dura 200ms
    }, 400000); // 400 segundos

    return () => clearInterval(strobeInterval);
  }, []);



  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-6 text-white">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/BG_1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a1a]/80" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Logo circular com animações leves contínuas e strobo */}
        <motion.div
          ref={logoRef}
          className="mx-auto mt-20 mb-8 w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] flex items-center justify-center will-change-transform"
          style={{ transition: 'transform 0.2s cubic-bezier(.25,.46,.45,.94)' }}
          animate={{
            rotate: [0, 1, -1, 0],
            scale: [1, 1.02, 0.98, 1],
            filter: strobeActive 
              ? ['brightness(1)', 'brightness(2)', 'brightness(1)'] 
              : ['brightness(1)', 'brightness(1.1)', 'brightness(1)']
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            },
            scale: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            },
            filter: {
              duration: strobeActive ? 0.2 : 4,
              repeat: strobeActive ? 0 : Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <motion.div
            className="rounded-full"
          >
            <Image
              src="/logos/oficial_logo.png"
              alt="Logo Oficial"
              width={500}
              height={500}
              priority
              className="rounded-full w-full h-full"
              style={{ width: 'auto', height: 'auto' }}
            />
          </motion.div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 10 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 max-w-2xl"
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white headline-glow">
            <span className="text-pink-500">O MAIOR EVENTO <span className='whitespace-nowrap'>DE TIMES</span></span><br/> DA AMÉRICA LATINA
          </h2>
          
          {/* Data do Evento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-6"
          >
            <p className="text-lg md:text-xl lg:text-2xl font-bold text-pink-400 drop-shadow-neon-pink">
              24, 25 e 26 de OUTUBRO
            </p>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 mb-4"
        >
          <GamifiedCTA 
            href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz" 
            tooltipText="A PRÉ TEMPORADA 2025 ESTÁ ABERTA"
            className="btn-neon-pulse px-8 py-3"
          >
            ACESSAR COMUNIDADE
          </GamifiedCTA>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mb-24"
        >
          <p className="mt-20 text-base md:text-lg text-neutral-200 font-semibold drop-shadow-lg">
          COMPETIÇÃO. COMUNIDADE. PROPRIEDADE.
          </p>
        </motion.div>
      </div>
    </section>
  );
}