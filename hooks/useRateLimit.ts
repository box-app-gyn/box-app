import { useState, useEffect, useCallback, useRef } from 'react';

// Constantes de segurança
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 60000; // 1 minuto
const MAX_STORAGE_SIZE = 1024; // 1KB
const MAX_BLOCKED_TIME = 24 * 60 * 60 * 1000; // 24 horas

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

export const useRateLimit = (config: RateLimitConfig | number = DEFAULT_MAX_ATTEMPTS) => {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    windowMs = DEFAULT_WINDOW_MS,
    storageKey = 'rate-limit',
    enablePersistence = true
  } = typeof config === 'number' ? { maxAttempts: config } : config;

  // Sanitizar configurações
  const sanitizedMaxAttempts = Math.max(1, Math.min(maxAttempts, 100));
  const sanitizedWindowMs = Math.max(1000, Math.min(windowMs, MAX_BLOCKED_TIME));
  const sanitizedStorageKey = typeof storageKey === 'string' && storageKey.length > 0 
    ? storageKey.slice(0, 50) 
    : 'rate-limit';

  // Estados seguros
  const [state, setState] = useState<RateLimitState>(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(sanitizedStorageKey);
        if (stored && stored.length <= MAX_STORAGE_SIZE) {
          const parsed = JSON.parse(stored);
          
          // Validar dados armazenados
          if (parsed && 
              typeof parsed.attempts === 'number' && 
              typeof parsed.lastAttempt === 'number' && 
              typeof parsed.blockedUntil === 'number' &&
              parsed.attempts >= 0 && 
              parsed.attempts <= sanitizedMaxAttempts &&
              parsed.lastAttempt >= 0 &&
              parsed.blockedUntil >= 0) {
            
            // Verificar se o estado ainda é válido
            const now = Date.now();
            if (now < parsed.blockedUntil && parsed.blockedUntil - now <= MAX_BLOCKED_TIME) {
              return parsed;
            }
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar rate limit do localStorage:', error);
        // Limpar dados corrompidos
        try {
          localStorage.removeItem(sanitizedStorageKey);
        } catch (cleanupError) {
          console.warn('Erro ao limpar dados corrompidos:', cleanupError);
        }
      }
    }
    
    return {
      attempts: 0,
      lastAttempt: 0,
      blockedUntil: 0
    };
  });

  // Refs para evitar race conditions
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isUnmountingRef = useRef(false);

  // Persistir estado no localStorage de forma segura
  const persistState = useCallback((newState: RateLimitState) => {
    if (!enablePersistence || typeof window === 'undefined' || isUnmountingRef.current) return;
    
    try {
      // Validar estado antes de persistir
      if (newState.attempts < 0 || 
          newState.attempts > sanitizedMaxAttempts ||
          newState.lastAttempt < 0 ||
          newState.blockedUntil < 0) {
        console.warn('Estado de rate limit inválido, não persistindo');
        return;
      }

      const stateString = JSON.stringify(newState);
      if (stateString.length <= MAX_STORAGE_SIZE) {
        localStorage.setItem(sanitizedStorageKey, stateString);
      } else {
        console.warn('Estado de rate limit muito grande, não persistindo');
      }
    } catch (error) {
      console.warn('Erro ao persistir rate limit no localStorage:', error);
    }
  }, [enablePersistence, sanitizedStorageKey, sanitizedMaxAttempts]);

  // Limpar estado expirado de forma segura
  const cleanupExpiredState = useCallback(() => {
    if (isUnmountingRef.current) return;
    
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

  // Verificar rate limit de forma segura
  const checkRateLimit = useCallback((): boolean => {
    if (isUnmountingRef.current) return false;
    
    const now = Date.now();
    
    // Limpar estado expirado
    cleanupExpiredState();
    
    // Verificar se está bloqueado
    if (now < state.blockedUntil) {
      return false;
    }
    
    // Resetar se a janela expirou
    if (now - state.lastAttempt > sanitizedWindowMs) {
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
    if (state.attempts >= sanitizedMaxAttempts) {
      const newState = {
        attempts: state.attempts,
        lastAttempt: state.lastAttempt,
        blockedUntil: now + sanitizedWindowMs
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
  }, [state, sanitizedMaxAttempts, sanitizedWindowMs, cleanupExpiredState, persistState]);

  // Resetar rate limit de forma segura
  const resetRateLimit = useCallback(() => {
    if (isUnmountingRef.current) return;
    
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
      if (timeUntilUnblock > 0 && timeUntilUnblock <= MAX_BLOCKED_TIME) {
        timeoutRef.current = setTimeout(cleanupExpiredState, timeUntilUnblock);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.blockedUntil, cleanupExpiredState]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calcular valores derivados de forma segura
  const timeRemaining = Math.max(0, state.blockedUntil - Date.now());
  const isBlocked = timeRemaining > 0;
  const attemptsRemaining = Math.max(0, sanitizedMaxAttempts - state.attempts);

  return {
    checkRateLimit,
    resetRateLimit,
    attempts: state.attempts,
    maxAttempts: sanitizedMaxAttempts,
    isBlocked,
    timeRemaining,
    attemptsRemaining,
    lastAttempt: state.lastAttempt
  };
}; 