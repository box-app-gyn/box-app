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
      const x = event.gamma || 0;
      const y = event.beta || 0;
      el.style.transform = `translate3d(${x * 0.3}px, ${y * 0.2}px, 0)`;
    }
    
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [ref]);
}

export default function Hero() {
  const logoRef = useRef<HTMLDivElement>(null);
  const [strobeActive, setStrobeActive] = useState(false);
  
  useDeviceParallax(logoRef);

  useEffect(() => {
    const strobeInterval = setInterval(() => {
      setStrobeActive(true);
      setTimeout(() => setStrobeActive(false), 200);
    }, 400000);

    return () => clearInterval(strobeInterval);
  }, []);

  return (
    <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center px-4 text-white mobile-optimized prevent-shift">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/BG_1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a1a]/80" />
      
      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          ref={logoRef}
          className="mx-auto mt-8 mb-6 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 flex items-center justify-center will-change-transform mobile-optimized"
          style={{ transition: 'transform 0.3s cubic-bezier(.25,.46,.45,.94)' }}
          animate={{
            rotate: [0, 0.5, -0.5, 0],
            scale: [1, 1.01, 0.99, 1],
            filter: strobeActive 
              ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] 
              : ['brightness(1)', 'brightness(1.05)', 'brightness(1)']
          }}
          transition={{
            rotate: {
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            },
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            },
            filter: {
              duration: strobeActive ? 0.2 : 6,
              repeat: strobeActive ? 0 : Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <motion.div className="rounded-full">
            <Image
              src="/logos/oficial_logo.png"
              alt="Logo Oficial"
              width={384}
              height={384}
              priority
              className="rounded-full w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white headline-glow leading-tight">
            <span className="text-pink-500">O MAIOR EVENTO <span className='whitespace-nowrap'>DE TIMES</span></span><br/> DA AMÉRICA LATINA
          </h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-4"
          >
            <p className="text-base sm:text-lg md:text-xl font-bold text-pink-400 drop-shadow-neon-pink">
              24, 25 e 26 de OUTUBRO
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 mb-4"
        >
          <GamifiedCTA 
            href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz" 
            tooltipText="A PRÉ TEMPORADA 2025 ESTÁ ABERTA"
            className="btn-neon-pulse px-6 py-2.5 text-sm sm:text-base"
          >
            ACESSAR COMUNIDADE
          </GamifiedCTA>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-12"
        >
          <p className="mt-6 text-sm sm:text-base text-neutral-200 font-semibold drop-shadow-lg">
            COMPETIÇÃO. COMUNIDADE. PROPÓSITO.
          </p>
        </motion.div>
      </div>
    </section>
  );
}