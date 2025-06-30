import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showMFA, setShowMFA] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        router.push('/dashboard');
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Verificar se o email está verificado
        if (!user.emailVerified) {
          setError('⚠️ Seu email não está verificado. Verifique sua caixa de entrada e clique no link de confirmação antes de fazer login.');
          setLoading(false);
          return;
        }
        
        // Verificar se o usuário tem MFA habilitado
        const mfaUser = multiFactor(user);
        if (mfaUser.enrolledFactors.length > 0) {
          setShowMFA(true);
          setLoading(false);
          return;
        }
        
        // Se não tem MFA, verificar se é um usuário novo
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // Usuário novo, redirecionar para configuração
          router.push('/setup-mfa');
          return;
        }
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Novo usuário, redirecionar para configuração
        router.push('/setup-mfa');
        return;
      }
      router.push('/dashboard');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      if (!verificationId) {
        // Enviar código SMS
        if (!recaptchaVerifier) throw new Error('reCAPTCHA não inicializado');
        const phoneProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneProvider.verifyPhoneNumber(
          phoneNumber,
          recaptchaVerifier
        );
        setVerificationId(verificationId);
        setError('Código enviado! Verifique seu SMS.');
      } else {
        // Verificar código
        const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);
        
        const mfaUser = multiFactor(user);
        await mfaUser.getSession();
        await mfaUser.enroll(multiFactorAssertion, 'Telefone');
        
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowMFA(false);
    setVerificationId('');
    setVerificationCode('');
    setPhoneNumber('');
    setError('');
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Redirecionando...</p>
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
          <p className="text-pink-400 font-tech">O portal está aberto</p>
        </div>

        {/* Form */}
        <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
          {!showMFA ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {isLogin ? 'Entrar na Arena' : 'Criar Conta'}
              </h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {isLogin ? 'Entrando...' : 'Criando conta...'}
                    </div>
                  ) : (
                    isLogin ? 'Entrar na Arena' : 'Criar Conta'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
                >
                  {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Verificação em Duas Etapas
              </h2>
              <p className="text-gray-400 text-center mb-6">
                Digite seu número de telefone para receber um código de verificação
              </p>

              {error && (
                <div className={`px-4 py-3 rounded-lg mb-6 ${
                  error.includes('enviado') 
                    ? 'bg-green-500/20 border border-green-500 text-green-300'
                    : 'bg-red-500/20 border border-red-500 text-red-300'
                }`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleMFASubmit} className="space-y-6">
                {!verificationId ? (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                      Número de Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                      placeholder="+55 11 99999-9999"
                      required
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {verificationId ? 'Verificando...' : 'Enviando código...'}
                    </div>
                  ) : (
                    verificationId ? 'Verificar Código' : 'Enviar Código'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleBackToLogin}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  ← Voltar ao login
                </button>
              </div>
            </>
          )}

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