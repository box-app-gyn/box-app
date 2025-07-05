import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import IntroVideo from '../components/IntroVideo';
import LoginScreen from '../components/LoginScreen';

export default function Home() {
  const router = useRouter();
  const { user, loading, hasWatchedIntro, setHasWatchedIntro } = useAuth();

  // Redireciona para página de QR code se for desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /iphone|ipad|ipod|android|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
      if (!isMobile) {
        router.replace('/acesso-mobile-obrigatorio');
      }
    }
  }, [router]);

  if (loading) return <div>Carregando...</div>;
  if (user) {
    router.push('/home');
    return null;
  }
  if (!hasWatchedIntro) {
    return <IntroVideo onFinish={() => {
      setHasWatchedIntro(true);
      localStorage.setItem('intro_watched', 'true');
    }} />;
  }
  return <LoginScreen />;
} 