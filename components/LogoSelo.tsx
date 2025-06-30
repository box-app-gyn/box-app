import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LogoSelo() {
  return (
    <motion.div
      className="mx-auto mt-8 mb-4 w-40 h-40 flex items-center justify-center drop-shadow-neon-pink"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Image
        src="/logos/logo_circulo.png"
        alt="Selo Interbox 2025"
        width={160}
        height={160}
        priority
        className="rounded-full"
      />
    </motion.div>
  );
} 