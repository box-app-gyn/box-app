import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiExplosionProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function ConfettiExplosion({ trigger, onComplete }: ConfettiExplosionProps) {
  const hasExploded = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (trigger && !hasExploded.current) {
      hasExploded.current = true;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: [
          '#ec4899', // pink
          '#a21caf', // purple
          '#06b6d4', // cyan
          '#fde047', // yellow
          '#fff',    // white
        ],
        scalar: 1.2,
        zIndex: 9999,
      });
      setTimeout(() => {
        if (onComplete && isMounted.current) onComplete();
      }, 1800);
    }
  }, [trigger, onComplete]);

  return null;
} 