import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Constantes
const INTRO_WATCHED_KEY = 'intro_watched';

// Tipos
interface AuthState {
  user: User | null;
  loading: boolean;
  hasWatchedIntro: boolean;
  error: string | null;
}

export const useAuth = () => {
  // Estados
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    hasWatchedIntro: false,
    error: null
  });

  // Verificar intro de forma segura
  const checkIntroWatched = useCallback((): boolean => {  
    if (typeof window === 'undefined') return false;
    
    try {
      const introWatched = localStorage.getItem(INTRO_WATCHED_KEY);
      return introWatched === 'true';
    } catch (error) {
      return false;
    }
  }, []);

  // Definir intro como assistida
  const setHasWatchedIntro = useCallback((watched: boolean): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (watched) {
        localStorage.setItem(INTRO_WATCHED_KEY, 'true');
      } else {
        localStorage.removeItem(INTRO_WATCHED_KEY);
      }
      
      setAuthState(prev => ({
        ...prev,
        hasWatchedIntro: watched
      }));
    } catch (error) {
      // Silenciar erro
    }
  }, []);

  // Efeito principal - simplificado
  useEffect(() => {
    // Verificar intro primeiro
    const introWatched = checkIntroWatched();
    
    // Configurar listener de autenticação
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          user,
          loading: false,
          hasWatchedIntro: introWatched,
          error: null
        });
      },
      (error) => {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro de autenticação'
        }));
      }
    );

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [checkIntroWatched]);

  // Função de login com Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro no login com Google'
      }));
    }
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    hasWatchedIntro: authState.hasWatchedIntro,
    error: authState.error,
    setHasWatchedIntro,
    signInWithGoogle
  };
}; 