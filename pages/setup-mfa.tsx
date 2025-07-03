import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  onAuthStateChanged,
  RecaptchaVerifier,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Image from 'next/image';
import { sanitizeInput } from '../utils/sanitize';
import { handleAuthError } from '../utils/errorHandler';
import { getValidatedUserType } from '../utils/storage';
import { useRateLimit } from '../hooks/useRateLimit';
import ConfettiExplosion from '../components/ConfettiExplosion';

export default function SetupMFA() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { checkRateLimit, attempts, maxAttempts } = useRateLimit();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Inicializar reCAPTCHA apenas se necessário
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      try {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log('reCAPTCHA solved');
          }
        });
        setRecaptchaVerifier(verifier);
      } catch (error) {
        console.error('Erro ao inicializar reCAPTCHA:', error);
        setError('Erro ao inicializar verificação. Tente novamente.');
      }
    }
  }, [recaptchaVerifier]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!checkRateLimit()) {
      setError('Muitas tentativas. Aguarde um momento.');
      return;
    }

    const sanitizedPhone = sanitizeInput(phoneNumber);

    if (!sanitizedPhone) {
      setError('Preencha o campo de telefone');
      return;
    }

    if (!/^\d{10,11}$/.test(sanitizedPhone.replace(/\D/g, ''))) {
      setError('Telefone inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userType = getValidatedUserType();
      
      await setDoc(doc(db, 'users', user!.uid), {
        name: displayName,
        phone: sanitizedPhone,
        userType,
        email: user!.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowConfetti(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, displayName, user, router, checkRateLimit, loading]);

  const handleSkip = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center p-4">
      <ConfettiExplosion trigger={showConfetti} />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logos/logo_circulo.png"
            alt="Interbox 2025 Logo"
            width={120}
            height={120}
            className="mx-auto mb-4 drop-shadow-[0_2px_12px_rgba(255,27,221,0.7)]"
          />
          <h1 className="text-3xl font-bold text-white mb-2">INTERBOX 2025</h1>
          <p className="text-pink-400 font-tech">Configuração de Segurança</p>
        </div>

        {/* Form */}
        <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Configurar Conta
          </h2>
          
          <p className="text-gray-400 text-center mb-6">
            Configure seu perfil e ative a verificação em duas etapas (opcional)
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {attempts > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 text-yellow-200">
              Tentativas: {attempts}/{maxAttempts}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                placeholder="Seu nome completo"
                required
                disabled={loading}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                Número de Telefone (Opcional)
              </label>
              <p className="text-gray-400 text-sm mb-3">
                Adicione seu telefone para ativar a verificação em duas etapas
              </p>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                placeholder="(11) 99999-9999"
                disabled={loading}
                maxLength={15}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Pular por enquanto
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Voltar ao início
            </button>
          </div>
        </div>

        {/* reCAPTCHA Container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
} 