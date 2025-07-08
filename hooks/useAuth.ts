import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Constantes de segurança
const AUTH_TIMEOUT_MS = 15000; // 15 segundos
const MAX_RETRY_ATTEMPTS = 3;
const INTRO_WATCHED_KEY = 'intro_watched';

// Tipos de segurança
interface AuthState {
  user: User | null;
  loading: boolean;
  hasWatchedIntro: boolean;
  error: string | null;
}

export const useAuth = () => {
  // Estados seguros
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    hasWatchedIntro: false,
    error: null
  });

  // Refs para evitar race conditions
  const authTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isUnmountingRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Verificar intro de forma segura
  const checkIntroWatched = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const introWatched = localStorage.getItem(INTRO_WATCHED_KEY);
      return introWatched === 'true';
    } catch (error) {
      console.error('Erro ao verificar intro:', error);
      return false;
    }
  }, []);

  // Definir intro como assistida de forma segura
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
      console.error('Erro ao salvar status do intro:', error);
    }
  }, []);

  // Inicializar autenticação de forma segura
  const initializeAuth = useCallback(async (): Promise<void> => {
    if (isUnmountingRef.current) return;

    try {
      // Timeout de segurança
      const timeoutPromise = new Promise<never>((_, reject) => {
        authTimeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout de inicialização da autenticação'));
        }, AUTH_TIMEOUT_MS);
      });

      const authInit = new Promise<void>((resolve, reject) => {
        try {
          // Verificar intro primeiro
          const introWatched = checkIntroWatched();
          
          // Configurar listener de autenticação
          const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
              if (isUnmountingRef.current) return;
              
              setAuthState({
                user,
                loading: false,
                hasWatchedIntro: introWatched,
                error: null
              });
              
              unsubscribeRef.current = unsubscribe;
              resolve();
            },
            (error) => {
              if (isUnmountingRef.current) return;
              
              console.error('Erro na autenticação:', error);
              setAuthState(prev => ({
                ...prev,
                loading: false,
                error: error.message || 'Erro de autenticação'
              }));
              reject(error);
            }
          );
        } catch (error) {
          reject(error);
        }
      });

      await Promise.race([authInit, timeoutPromise]);
    } catch (error) {
      if (isUnmountingRef.current) return;

      console.error('Erro na inicialização da autenticação:', error);
      
      // Retry logic com backoff exponencial
      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current++;
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
        
        setTimeout(() => {
          if (!isUnmountingRef.current) {
            initializeAuth();
          }
        }, delay);
        return;
      }

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na autenticação'
      }));
    } finally {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    }
  }, [checkIntroWatched]);

  // Efeito principal
  useEffect(() => {
    initializeAuth();

    // Cleanup
    return () => {
      isUnmountingRef.current = true;
      
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [initializeAuth]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    hasWatchedIntro: authState.hasWatchedIntro,
    error: authState.error,
    setHasWatchedIntro
  };
}; 