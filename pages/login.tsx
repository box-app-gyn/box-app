import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  RecaptchaVerifier,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import Image from 'next/image';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeInput } from '../utils/sanitize';
import { handleAuthError } from '../utils/errorHandler';
import { useRateLimit } from '../hooks/useRateLimit';

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
  const [userType, setUserType] = useState<'atleta' | 'audiovisual'>('atleta');
  const router = useRouter();
  const { checkRateLimit, attempts, maxAttempts } = useRateLimit();

  // Prevenir race condition
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Verificar se é um usuário novo (sem documento no Firestore)
        const checkUserDoc = async () => {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
              // Usuário novo, redirecionar para setup-mfa
              router.push('/setup-mfa');
            } else {
              // Usuário existente, redirecionar para dashboard
              router.push('/dashboard');
            }
          } catch (error) {
            console.error('Erro ao verificar documento do usuário:', error);
            router.push('/dashboard');
          }
        };
        // Adicionar um pequeno delay para garantir que o formulário seja visível
        setTimeout(() => {
          checkUserDoc();
        }, 1000);
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    if (!checkRateLimit()) {
      setError('Muitas tentativas. Aguarde um momento.');
      return;
    }

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = password; // Senha não precisa sanitizar

    if (!sanitizedEmail || !sanitizedPassword) {
      setError('Preencha todos os campos');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
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
        
        // Se não tem MFA, redirecionar para dashboard (usuário existente)
        router.push('/dashboard');
        return;
      } else {
        await createUserWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        
        // Salvar o tipo de usuário no localStorage para usar no setup-mfa
        localStorage.setItem('userType', userType);
        
        // O redirecionamento será feito pelo useEffect quando o user for definido
        return;
      }
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  }, [email, password, isLogin, userType, router, checkRateLimit, isProcessing]);

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

  const handleGoogleSignIn = useCallback(async () => {
    if (isProcessing) return;
    
    if (!checkRateLimit()) {
      setError('Muitas tentativas. Aguarde um momento.');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      localStorage.setItem('userType', userType);
      // O redirecionamento será feito pelo useEffect quando o user for definido
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  }, [userType, checkRateLimit, isProcessing]);

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
            src="/logos/oficial_logo.png"
            
            alt="Interbox 2025 Logo"
            width={120}
            height={120}
            className="mx-auto mb-4 drop-shadow-[0_2px_12px_rgba(255,27,221,0.7)]"
          />
          <h1 className="text-3xl font-bold text-white mb-2">INTERBØX 2025</h1>
          <p className="text-pink-400 font-tech">Aqui você acessa o ecossistema.</p>
        </div>

        {/* Form */}
        <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
          {!showMFA ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                {isLogin ? 'Acessar PRÉ-ARENA' : 'Criar Conta'}
              </h2>

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
                    disabled={loading}
                    autoComplete="email"
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
                    disabled={loading}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>

                {/* Seleção de tipo de usuário apenas para cadastro */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tipo de Usuário
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="userType"
                          value="atleta"
                          checked={userType === 'atleta'}
                          onChange={(e) => setUserType(e.target.value as 'atleta' | 'audiovisual')}
                          className="text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-white">🏋️‍♀️ Atleta - Quero competir</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="userType"
                          value="audiovisual"
                          checked={userType === 'audiovisual'}
                          onChange={(e) => setUserType(e.target.value as 'atleta' | 'audiovisual')}
                          className="text-pink-500 focus:ring-pink-500"
                        />
                        <span className="text-white">📹 Audiovisual - Quero cobrir o evento</span>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isProcessing}
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

              {/* Divisor */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/60 text-gray-400">ou</span>
                </div>
              </div>

              {/* Botão Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading || isProcessing}
                className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Entrando...' : 'Continuar com Google'}</span>
              </button>

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
                      autoComplete="tel"
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
                      autoComplete="one-time-code"
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

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white text-sm transition-colors block w-full"
            >
              ← Voltar ao início
            </button>
            
            <div className="border-t border-gray-600 pt-4">
              <p className="text-gray-400 text-sm mb-2">Não quer se cadastrar agora?</p>
              <a
                href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
              >
                📲 Entrar na Comunidade INTERBOX
              </a>
            </div>
          </div>
        </div>

        {/* reCAPTCHA Container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
} 