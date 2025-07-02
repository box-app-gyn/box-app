// /components/Header.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Detectar scroll para animar header
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Prevenir scroll quando menu está aberto
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

  if (loading) {
    return (
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-pink-500/20"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-32 h-8 bg-gray-700 animate-pulse rounded"></div>
            <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </motion.header>
    );
  }

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-lg border-b border-pink-500/30 shadow-lg' 
            : 'bg-black/80 backdrop-blur-md border-b border-pink-500/20'
        }`}
      >
        <motion.div 
          className="container mx-auto px-4 transition-all duration-300"
          animate={{
            paddingTop: isScrolled ? '0.5rem' : '1rem',
            paddingBottom: isScrolled ? '0.5rem' : '1rem'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo com efeito de brilho */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  filter: "brightness(1.2) drop-shadow(0 0 10px rgba(236, 72, 153, 0.6))"
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden rounded-lg"
              >
                <Image
                  src="/logos/nome_hrz.png"
                  alt="Interbox 2025"
                  width={isScrolled ? 50 : 70}
                  height={isScrolled ? 15 : 21}
                  className="transition-all duration-300"
                  style={{ width: 'auto', height: 'auto' }}
                />
                {/* Efeito de brilho no hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </motion.div>
            </Link>

            {/* Menu Desktop - Links de navegação */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/#sobre" 
                className="text-white hover:text-pink-400 transition-all duration-300 font-medium text-sm"
              >
                Sobre
              </Link>
              <Link 
                href="/times" 
                className="text-white hover:text-pink-400 transition-all duration-300 font-medium text-sm"
              >
                Times
              </Link>
              <Link 
                href="/audiovisual" 
                className="text-pink-400 hover:text-pink-300 transition-all duration-300 font-medium text-sm"
              >
                Audiovisual
              </Link>
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-white hover:text-pink-400 transition-all duration-300 font-medium text-sm"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-white hover:text-pink-400 transition-all duration-300 font-medium text-sm"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-pink-400 transition-all duration-300 font-medium text-sm"
                  >
                    Sair
                  </button>
                </>
              )}
              {!user && (
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                >
                  Entrar
                </Link>
              )}
            </nav>

            {/* Menu Hambúrguer - Apenas Mobile */}
            <motion.button
              onClick={toggleMenu}
              className="md:hidden relative z-50 flex flex-col justify-center items-center w-8 h-8 text-white hover:text-pink-400 transition-colors duration-300"
              whileTap={{ scale: 0.95 }}
            >
              {/* Linha superior */}
              <motion.span
                className="absolute w-6 h-0.5 bg-current transform transition-all duration-300"
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 0 : -6,
                }}
              />
              {/* Linha do meio */}
              <motion.span
                className="absolute w-6 h-0.5 bg-current transform transition-all duration-300"
                animate={{
                  opacity: isMenuOpen ? 0 : 1,
                  scale: isMenuOpen ? 0 : 1,
                }}
              />
              {/* Linha inferior */}
              <motion.span
                className="absolute w-6 h-0.5 bg-current transform transition-all duration-300"
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? 0 : 6,
                }}
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.header>

      {/* Menu Lateral Fullscreen - Apenas Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay de fundo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-lg z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                duration: 0.5
              }}
              className="md:hidden fixed top-0 right-0 h-full w-full max-w-md bg-black/98 backdrop-blur-xl z-50 border-l border-pink-500/20 shadow-2xl"
            >
              {/* Conteúdo do menu */}
              <div className="flex flex-col h-full p-8">
                {/* Header do menu */}
                <div className="flex items-center justify-between mb-12">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Image
                      src="/logos/nome_hrz.png"
                      alt="Interbox 2025"
                      width={100}
                      height={30}
                      className="filter brightness-110"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </motion.div>
                  
                  {/* Separador tribal */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex-1 mx-6"
                  >
                    <Image
                      src="/images/twolines.png"
                      alt=""
                      width={60}
                      height={20}
                      className="opacity-60"
                    />
                  </motion.div>
                </div>

                {/* Links de navegação */}
                <nav className="flex-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link 
                      href="/#sobre" 
                      className="text-2xl font-bold text-white hover:text-pink-400 transition-all duration-300 block py-3 border-b border-pink-500/10 hover:border-pink-500/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sobre
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link 
                      href="/times" 
                      className="text-2xl font-bold text-white hover:text-pink-400 transition-all duration-300 block py-3 border-b border-pink-500/10 hover:border-pink-500/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Times
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link 
                      href="/audiovisual" 
                      className="text-2xl font-bold text-pink-400 hover:text-pink-300 transition-all duration-300 block py-3 border-b border-pink-500/20 hover:border-pink-500/40"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Audiovisual
                    </Link>
                  </motion.div>

                  {user && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Link 
                          href="/dashboard" 
                          className="text-2xl font-bold text-white hover:text-pink-400 transition-all duration-300 block py-3 border-b border-pink-500/10 hover:border-pink-500/30"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.65 }}
                      >
                        <Link 
                          href="/profile" 
                          className="text-2xl font-bold text-white hover:text-pink-400 transition-all duration-300 block py-3 border-b border-pink-500/10 hover:border-pink-500/30"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Perfil
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="text-left text-2xl font-bold text-white hover:text-pink-400 transition-all duration-300 block py-3 w-full border-b border-pink-500/10 hover:border-pink-500/30"
                        >
                          Sair
                        </button>
                      </motion.div>
                    </>
                  )}
                </nav>

                {/* Separador tribal no final */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 flex justify-center"
                >
                  <Image
                    src="/images/twolines.png"
                    alt=""
                    width={80}
                    height={25}
                    className="opacity-40"
                  />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}