import React, { useState, useEffect, useRef } from 'react';

interface IntroVideoProps {
  onFinish: () => void;
}

export default function IntroVideo({ onFinish }: IntroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Mostrar botão de pular após 3 segundos
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 3000);

    return () => clearTimeout(skipTimer);
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onFinish();
  };

  const handleSkip = () => {
    setIsPlaying(false);
    onFinish();
  };

  const handleVideoClick = () => {
    if (!isPlaying) {
      handlePlay();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Video Container */}
      <div className="relative w-full h-full max-w-4xl max-h-[80vh]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover rounded-lg"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          onClick={handleVideoClick}
          muted
          playsInline
        >
          <source src="/videos/intro.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>

        {/* Overlay com logo e texto */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
          <div className="text-center text-white">
            <img 
              src="/logos/logo_circulo.png" 
              alt="CERRADØ" 
              className="w-32 h-32 mx-auto mb-6 animate-pulse"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              CERRADØ
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              INTERBOX 2025
            </p>
            
            {!isPlaying && (
              <button
                onClick={handlePlay}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors"
              >
                ▶️ ASSISTIR INTRO
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isPlaying && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black bg-opacity-50 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Botão Pular */}
        {showSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            ⏭️ PULAR
          </button>
        )}

        {/* Loading */}
        {!isPlaying && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 