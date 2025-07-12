'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface VideoSplashScreenProps {
  onComplete: () => void;
}

export default function VideoSplashScreen({ onComplete }: VideoSplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    // Mostrar logo após 1 segundo
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1000);

    return () => {
      isMounted.current = false;
      clearTimeout(logoTimer);
    };
  }, []);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
    setTimeout(() => {
      if (isMounted.current) onComplete();
    }, 3000);
  };

  const handleVideoEnd = () => {
    setTimeout(() => {
      if (isMounted.current) onComplete();
    }, 500);
  };

  const handleVideoClick = () => {
    // Permitir pular o vídeo clicando
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        style={{ zIndex: 10000 }}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black"
          >
            <div className="flex flex-col items-center space-y-4">
              <Image src="/logos/logo_circulo.png" 
                alt="CERRADØ" 
                width={80}
                height={80}
                className="w-20 h-20 animate-pulse"
               priority/>
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </motion.div>
        )}

        {/* Video */}
        {!videoError && (
          <video
            ref={videoRef}
            src="/videos/intro.mp4"
            autoPlay
            playsInline
            muted
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onEnded={handleVideoEnd}
            onClick={handleVideoClick}
            className="w-full h-full object-cover cursor-pointer"
            style={{ maxWidth: '100vw', maxHeight: '100vh' }}
          />
        )}

        {/* Fallback Logo */}
        {videoError && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <Image src="/logos/logo_circulo.png" 
              alt="CERRADØ" 
              width={120}
              height={120}
              className="w-30 h-30"
             priority/>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-center"
            >
              <h1 className="text-2xl font-bold mb-2">CERRADØ INTERBOX</h1>
              <p className="text-lg opacity-90">2025</p>
            </motion.div>
          </motion.div>
        )}

        {/* Overlay Logo */}
        <AnimatePresence>
          {showLogo && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-8 left-8 z-10"
            >
              <Image src="/logos/logo_circulo.png" 
                alt="CERRADØ" 
                width={60}
                height={60}
                className="w-15 h-15 drop-shadow-lg"
               priority/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
          onClick={handleVideoClick}
          className="absolute bottom-8 right-8 z-10 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
        >
          Pular
        </motion.button>

        {/* Progress Bar */}
        {!isLoading && !videoError && videoRef.current && videoRef.current.duration > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: videoRef.current?.duration || 5,
                ease: "linear" 
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
} 