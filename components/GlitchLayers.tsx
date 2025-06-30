import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface GlitchLayersProps {
  children: React.ReactNode;
  intensity?: number;
}

export default function GlitchLayers({ children, intensity = 1 }: GlitchLayersProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const glitchX = useTransform(scrollYProgress, [0, 1], [0, 10 * intensity]);
  const glitchY = useTransform(scrollYProgress, [0, 1], [0, 5 * intensity]);
  const glitchOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* Camada base */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Camada vermelha */}
      <motion.div
        style={{
          x: glitchX,
          y: glitchY,
          opacity: glitchOpacity
        }}
        className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply"
      >
        <div className="w-full h-full bg-red-500 opacity-30" />
      </motion.div>

      {/* Camada ciano */}
      <motion.div
        style={{
          x: glitchX.get() * -1,
          y: glitchY.get() * -0.5,
          opacity: glitchOpacity
        }}
        className="absolute inset-0 z-30 pointer-events-none mix-blend-screen"
      >
        <div className="w-full h-full bg-cyan-400 opacity-20" />
      </motion.div>

      {/* Camada tribal */}
      <motion.div
        style={{
          opacity: glitchOpacity
        }}
        className="absolute inset-0 z-40 pointer-events-none"
      >
        <div className="w-full h-full bg-gradient-to-br from-pink-500/10 via-transparent to-cyan-400/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      </motion.div>

      {/* Linhas de scanner */}
      <motion.div
        style={{
          opacity: glitchOpacity
        }}
        className="absolute inset-0 z-50 pointer-events-none"
      >
        <div className="w-full h-full scanner-lines" />
      </motion.div>
    </div>
  );
} 