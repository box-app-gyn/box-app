import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  onAuthStateChanged,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Image from 'next/image';

export default function SetupMFA() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setDisplayName(user.displayName || '');
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Inicializar reCAPTCHA
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log('reCAPTCHA solved');
        }
      });
      setRecaptchaVerifier(verifier);
    }
  }, [recaptchaVerifier]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!recaptchaVerifier) throw new Error('reCAPTCHA não inicializado');
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier
      );
      setVerificationId(verificationId);
      setSuccess('Código enviado! Verifique seu SMS.');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Verificar código
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
      
      // Enrolar o usuário no MFA
      const mfaUser = multiFactor(user);
      await mfaUser.getSession();
      await mfaUser.enroll(multiFactorAssertion, 'Telefone');

      // Atualizar perfil do usuário
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        role: 'atleta',
        isActive: true,
        phoneNumber: phoneNumber,
        mfaEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setSuccess('Configuração concluída! Redirecionando...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipMFA = async () => {
    try {
      setLoading(true);
      
      if (!user) throw new Error('Usuário não autenticado');
      
      // Atualizar perfil do usuário
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Criar documento do usuário no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        role: 'atleta',
        isActive: true,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

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

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={verificationId ? handleVerifyCode : handleSendCode} className="space-y-6">
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
              />
            </div>

            {!verificationId ? (
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
                  placeholder="+55 11 99999-9999"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-white mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                  placeholder="123456"
                  required
                />
              </div>
            )}

            <div className="flex gap-4">
              {!verificationId && phoneNumber && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Código'
                  )}
                </button>
              )}

              {verificationId && (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verificando...
                    </div>
                  ) : (
                    'Verificar Código'
                  )}
                </button>
              )}

              {!verificationId && (
                <button
                  type="button"
                  onClick={handleSkipMFA}
                  disabled={loading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pular MFA
                </button>
              )}
            </div>
          </form>

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