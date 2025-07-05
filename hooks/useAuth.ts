import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWatchedIntro, setHasWatchedIntro] = useState(false);

  useEffect(() => {
    setHasWatchedIntro(localStorage.getItem('intro_watched') === 'true');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, hasWatchedIntro, setHasWatchedIntro };
}; 