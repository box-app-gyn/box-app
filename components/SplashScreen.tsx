'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let failTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleVideoEnd = () => {
      setVideoEnded(true);
      setTimeout(() => {
        setIsPlaying(false);
        setTimeout(onComplete, 500); // Aguarda a animação de saída
      }, 1000);
    };

    const handleVideoError = () => {
      setVideoFailed(true);
      setTimeout(() => {
        setVideoEnded(true);
        setTimeout(() => {
          setIsPlaying(false);
          setTimeout(onComplete, 500);
        }, 1000);
      }, 1000);
    };

    // Timeout para conexões lentas (ex: 7s)
    failTimeout = setTimeout(() => {
      setVideoFailed(true);
      handleVideoError();
    }, 7000);

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('error', handleVideoError);
      if (failTimeout) clearTimeout(failTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          {/* Vídeo de intro ou fallback */}
          {!videoFailed ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            >
              <source src="/videos/intro.mp4" type="video/mp4" />
              {/* Fallback para navegadores que não suportam vídeo */}
              <div className="flex items-center justify-center w-full h-full bg-black">
                <div className="text-center">
                  <Image 
                    src="/logos/logo_circulo.png" 
                    alt="CERRADØ INTERBOX" 
                    width={128}
                    height={128}
                    className="w-32 h-32 mx-auto mb-4 animate-pulse"
                    priority
                  />
                  <h1 className="text-white text-2xl font-bold mb-2">CERRADØ INTERBOX</h1>
                  <p className="text-gray-300">2025</p>
                </div>
              </div>
            </video>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-black">
              <div className="text-center">
                <Image 
                  src="/logos/logo_circulo.png" 
                  alt="CERRADØ INTERBOX" 
                  width={128}
                  height={128}
                  className="w-32 h-32 mx-auto mb-4 animate-pulse"
                  priority
                />
                <h1 className="text-white text-2xl font-bold mb-2">CERRADØ INTERBOX</h1>
                <p className="text-gray-300">2025</p>
              </div>
            </div>
          )}

          {/* Overlay com logo quando vídeo termina */}
          <AnimatePresence>
            {videoEnded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-black"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-center"
                >
                  <Image 
                    src="/logos/logo_circulo.png" 
                    alt="CERRADØ INTERBOX" 
                    width={128}
                    height={128}
                    className="w-32 h-32 mx-auto mb-4"
                    priority
                  />
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-white text-3xl font-bold mb-2"
                  >
                    CERRADØ INTERBOX
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-gray-300 text-xl"
                  >
                    2025
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 