import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LogoSelo() {
  return (
    <motion.div
      className="mx-auto mt-8 mb-4 w-32 h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 flex items-center justify-center drop-shadow-neon-pink"
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
        width={128}
        height={128}
        priority
        className="rounded-full w-full h-full"
      />
    </motion.div>
  );
} 