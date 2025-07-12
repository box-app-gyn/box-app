import { useEffect, useState } from 'react';
import { useParallax } from 'react-scroll-parallax';
import { motion, useScroll, useTransform } from 'framer-motion';

interface GlitchScannerProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlitchScanner({ 
  children, 
  className = "" 
}: GlitchScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Parallax ref
  const parallax = useParallax<HTMLDivElement>({ speed: -10 });

  // Framer Motion scroll
  const { scrollYProgress } = useScroll({
    target: parallax.ref,
    offset: ["start end", "end start"]
  });

  const scanLineY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const glitchIntensity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const accessGranted = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setScanProgress(latest * 100);
      setIsScanning(latest > 0.1 && latest < 0.9);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={parallax.ref} className={`relative overflow-hidden ${className}`}>
      {/* Camada base */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Scanner line */}
      <motion.div
        style={{ y: scanLineY }}
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20 pointer-events-none"
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
      </motion.div>

      {/* Efeito de glitch */}
      <motion.div
        style={{ opacity: glitchIntensity }}
        className="absolute inset-0 z-30 pointer-events-none"
      >
        {/* Glitch layers */}
        <div className="absolute inset-0 bg-red-500 mix-blend-multiply opacity-20 animate-pulse" 
             style={{ animationDuration: '0.1s' }} />
        <div className="absolute inset-0 bg-cyan-500 mix-blend-screen opacity-20 animate-pulse" 
             style={{ animationDuration: '0.15s', animationDelay: '0.05s' }} />
        {/* Scan lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-10"
             style={{ 
               backgroundSize: '100% 4px',
               animation: isScanning ? 'scanLines 0.5s linear infinite' : 'none'
             }} />
      </motion.div>

      {/* Overlay de acesso */}
      <motion.div
        style={{ opacity: accessGranted }}
        className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-transparent z-40 pointer-events-none"
      >
        <div className="absolute top-4 right-4 text-green-400 text-sm font-mono">
          <motion.div
            animate={isScanning ? { opacity: [0, 1, 0] } : { opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            SCANNING...
          </motion.div>
          <motion.div
            animate={accessGranted.get() > 0.8 ? { opacity: 1 } : { opacity: 0 }}
            className="text-green-400"
          >
            ACESSO PERMITIDO
          </motion.div>
        </div>
      </motion.div>

      {/* Efeito de distorção tribal */}
      <motion.div
        style={{ 
          clipPath: `polygon(0 ${scanProgress}%, 100% ${scanProgress}%, 100% 100%, 0 100%)`,
          opacity: glitchIntensity
        }}
        className="absolute inset-0 z-50 pointer-events-none"
      >
        <div className="w-full h-full bg-gradient-to-b from-black via-pink-500/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </motion.div>

      <style jsx>{`
        @keyframes scanLines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
} 