import { useState, useEffect, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  storageKey?: string;
  enablePersistence?: boolean;
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

export const useRateLimit = (config: RateLimitConfig | number = 5) => {
  const {
    maxAttempts = 5,
    windowMs = 60000,
    storageKey = 'rate-limit',
    enablePersistence = true
  } = typeof config === 'number' ? { maxAttempts: config } : config;

  const [state, setState] = useState<RateLimitState>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Verificar se o estado ainda é válido
          if (Date.now() < parsed.blockedUntil) {
            return parsed;
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar rate limit do localStorage:', error);
      }
    }
    
    return {
      attempts: 0,
      lastAttempt: 0,
      blockedUntil: 0
    };
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  // Persistir estado no localStorage
  const persistState = useCallback((newState: RateLimitState) => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        console.warn('Erro ao persistir rate limit no localStorage:', error);
      }
    }
  }, [enablePersistence, storageKey]);

  // Limpar estado expirado
  const cleanupExpiredState = useCallback(() => {
    const now = Date.now();
    
    if (now > state.blockedUntil && state.attempts > 0) {
      const newState = {
        attempts: 0,
        lastAttempt: 0,
        blockedUntil: 0
      };
      
      setState(newState);
      persistState(newState);
    }
  }, [state, persistState]);

  // Verificar rate limit
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Limpar estado expirado
    cleanupExpiredState();
    
    // Verificar se está bloqueado
    if (now < state.blockedUntil) {
      return false;
    }
    
    // Resetar se a janela expirou
    if (now - state.lastAttempt > windowMs) {
      const newState = {
        attempts: 1,
        lastAttempt: now,
        blockedUntil: 0
      };
      
      setState(newState);
      persistState(newState);
      return true;
    }
    
    // Verificar se atingiu o limite
    if (state.attempts >= maxAttempts) {
      const newState = {
        attempts: state.attempts,
        lastAttempt: state.lastAttempt,
        blockedUntil: now + windowMs
      };
      
      setState(newState);
      persistState(newState);
      return false;
    }
    
    // Incrementar tentativas
    const newState = {
      attempts: state.attempts + 1,
      lastAttempt: now,
      blockedUntil: 0
    };
    
    setState(newState);
    persistState(newState);
    return true;
  }, [state, maxAttempts, windowMs, cleanupExpiredState, persistState]);

  // Resetar rate limit
  const resetRateLimit = useCallback(() => {
    const newState = {
      attempts: 0,
      lastAttempt: 0,
      blockedUntil: 0
    };
    
    setState(newState);
    persistState(newState);
  }, [persistState]);

  // Configurar limpeza automática
  useEffect(() => {
    if (state.blockedUntil > 0) {
      const timeUntilUnblock = state.blockedUntil - Date.now();
      if (timeUntilUnblock > 0) {
        timeoutRef.current = setTimeout(cleanupExpiredState, timeUntilUnblock);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.blockedUntil, cleanupExpiredState]);

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const timeRemaining = Math.max(0, state.blockedUntil - Date.now());
  const isBlocked = timeRemaining > 0;
  const attemptsRemaining = Math.max(0, maxAttempts - state.attempts);

  return {
    checkRateLimit,
    resetRateLimit,
    attempts: state.attempts,
    maxAttempts,
    isBlocked,
    timeRemaining,
    attemptsRemaining,
    lastAttempt: state.lastAttempt
  };
}; 