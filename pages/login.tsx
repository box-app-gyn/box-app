import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import Image from 'next/image';
import { getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sanitizeInput } from '../utils/sanitize';
import { handleAuthError } from '../utils/errorHandler';
import { useRateLimit } from '../hooks/useRateLimit';
import { UserType } from '../constants';
import { validateEmail, validatePassword } from '../utils/validation';

// Configurações
const AUTH_CONFIG = {
  redirectDelay: 500,
  maxRetries: 3,
  errorLogLevel: 'error' as const
};

// Tipos para melhor tipagem
interface LoginState {
  email: string;
  password: string;
  userType: UserType;
  isLogin: boolean;
  loading: boolean;
  error: string;
  showMFA: boolean;
  isProcessing: boolean;
  showGoogleCategoryHint: boolean;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresMFA?: boolean;
  isNewUser?: boolean;
}

// Função para log de erros (pode ser integrada com Sentry)
const logError = (error: unknown, context: string) => {
  console.error(`[Auth Error - ${context}]:`, error);
  
  // Aqui você pode integrar com serviços de monitoramento
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { tags: { context } });
  // }
};

export default function Login() {
  const router = useRouter();
  const { checkRateLimit, attempts, maxAttempts } = useRateLimit();
  
  // Estados consolidados
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    userType: 'atleta',
    isLogin: true,
    loading: false,
    error: '',
    showMFA: false,
    isProcessing: false,
    showGoogleCategoryHint: false
  });

  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Função para atualizar estado de forma segura
  const updateState = useCallback((updates: Partial<LoginState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoizar validação de formulário
  const isFormValid = useMemo(() => {
    if (!state.email || !state.password) return false;
    
    const emailValid = validateEmail(state.email);
    const passwordValid = state.isLogin || validatePassword(state.password);
    
    return emailValid && passwordValid;
  }, [state.email, state.password, state.isLogin]);

  // Função para verificar e redirecionar usuário
  const handleUserRedirect = useCallback(async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Usuário novo - redirecionar para setup
        router.push('/setup-profile');
        return;
      }

      const userData = userDoc.data();
      
      // Verificar se tem MFA pendente
      if (userData.requiresMFA && !userData.mfaSetup) {
        router.push('/setup-mfa');
        return;
      }

      // Verificar se tem categoria definida
      if (!userData.userType) {
        router.push('/select-category');
        return;
      }

      // Usuário completo - ir para hub
      router.push('/hub');
      
    } catch (error) {
      logError(error, 'handleUserRedirect');
      // Em caso de erro, redirecionar para página segura
      router.push('/hub');
    }
  }, [router]);

  // Listener de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsInitializing(false);
      
      if (user && !state.isProcessing) {
        // Adicionar delay para evitar redirecionamentos muito rápidos
        await new Promise(resolve => setTimeout(resolve, AUTH_CONFIG.redirectDelay));
        handleUserRedirect(user);
      }
    });

    return () => unsubscribe();
  }, [handleUserRedirect, state.isProcessing]);

  // Validação de entrada
  const validateForm = useCallback((): string | null => {
    if (!state.email || !state.password) {
      return 'Preencha todos os campos';
    }

    if (!validateEmail(state.email)) {
      return 'Email inválido';
    }

    if (!state.isLogin && !validatePassword(state.password)) {
      return 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número';
    }

    return null;
  }, [state.email, state.password, state.isLogin]);

  // Função de login
  const handleLogin = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar email verificado
      if (!user.emailVerified) {
        await auth.signOut(); // Logout se email não verificado
        return {
          success: false,
          error: '⚠️ Email não verificado. Verifique sua caixa de entrada.'
        };
      }

      return { success: true, user };
      
    } catch (error) {
      logError(error, 'handleLogin');
      return {
        success: false,
        error: handleAuthError(error)
      };
    }
  }, []);

  // Função de cadastro
  const handleSignup = useCallback(async (email: string, password: string, userType: UserType): Promise<AuthResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Enviar email de verificação
      await sendEmailVerification(user);
      
      // Criar documento do usuário
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        userType,
        createdAt: new Date(),
        emailVerified: false,
        profileComplete: false,
        lastLoginAt: new Date()
      });

      return { 
        success: true, 
        user, 
        isNewUser: true 
      };
      
    } catch (error) {
      logError(error, 'handleSignup');
      return {
        success: false,
        error: handleAuthError(error)
      };
    }
  }, []);

  // Função de login com Google - MELHORADA
  const handleGoogleAuth = useCallback(async (userType: UserType): Promise<AuthResult> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar se é usuário novo
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const isNewUser = !userDoc.exists();

      if (isNewUser) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName,
          userType,
          createdAt: new Date(),
          emailVerified: true,
          profileComplete: false,
          lastLoginAt: new Date(),
          photoURL: user.photoURL
        });
      } else {
        const existingData = userDoc.data();
        const safeUpdates: Partial<{ lastLoginAt: Date; emailVerified: boolean; userType?: string; photoURL?: string }> = {
          lastLoginAt: new Date(),
          emailVerified: true
        };
        if (!existingData.userType) safeUpdates.userType = userType;
        if (user.photoURL && user.photoURL !== existingData.photoURL) safeUpdates.photoURL = user.photoURL;
        await updateDoc(doc(db, 'users', user.uid), safeUpdates);
      }

      return { success: true, user, isNewUser };
    } catch (error: unknown) {
      logError(error, 'handleGoogleAuth');
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const code = (error as { code: string }).code;
        if (code === 'auth/popup-closed-by-user') {
          return { success: false, error: 'Login cancelado pelo usuário.' };
        }
        if (code === 'auth/cancelled-popup-request') {
          return { success: false, error: 'Você já tem uma janela de login aberta.' };
        }
      }
      return { success: false, error: handleAuthError(error) };
    }
  }, []);

  // Handler principal do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir submissões duplas
    if (state.isProcessing) return;
    
    // Verificar rate limiting
    if (!checkRateLimit()) {
      updateState({ error: 'Muitas tentativas. Aguarde um momento.' });
      return;
    }

    // Validar formulário
    const validationError = validateForm();
    if (validationError) {
      updateState({ error: validationError });
      return;
    }

    // Sanitizar entrada
    const sanitizedEmail = sanitizeInput(state.email);
    
    updateState({ 
      isProcessing: true, 
      loading: true, 
      error: '' 
    });

    try {
      let result: AuthResult;
      
      if (state.isLogin) {
        result = await handleLogin(sanitizedEmail, state.password);
      } else {
        result = await handleSignup(sanitizedEmail, state.password, state.userType);
      }

      if (result.success) {
        // Sucesso - mostrar mensagem adequada
        if (!state.isLogin) {
          updateState({ 
            error: '✅ Conta criada! Verifique seu email antes de fazer login.',
            loading: false,
            isProcessing: false,
            isLogin: true, // Mudar para modo login
            email: '', // Limpar formulário
            password: ''
          });
        }
        // Para login, o redirecionamento será feito pelo useEffect
      } else {
        updateState({ 
          error: result.error || 'Erro desconhecido',
          loading: false,
          isProcessing: false 
        });
      }
      
    } catch (error) {
      logError(error, 'handleSubmit');
      updateState({ 
        error: 'Erro interno. Tente novamente.',
        loading: false,
        isProcessing: false 
      });
    }
  }, [state, checkRateLimit, validateForm, handleLogin, handleSignup, updateState]);

  // Handler do Google Sign-In - MELHORADO
  const handleGoogleSignIn = useCallback(async () => {
    if (state.isProcessing) return;
    
    if (!checkRateLimit()) {
      updateState({ error: 'Muitas tentativas. Aguarde um momento.' });
      return;
    }

    updateState({ 
      isProcessing: true, 
      loading: true, 
      error: '',
      showGoogleCategoryHint: false 
    });

    try {
      const result = await handleGoogleAuth(state.userType);
      
      if (!result.success) {
        updateState({ 
          error: result.error || 'Erro ao fazer login com Google',
          loading: false,
          isProcessing: false 
        });
      }
      // Sucesso: redirecionamento será feito pelo useEffect
      
    } catch (error) {
      logError(error, 'handleGoogleSignIn');
      updateState({ 
        error: 'Erro interno. Tente novamente.',
        loading: false,
        isProcessing: false 
      });
    }
  }, [state.isProcessing, state.userType, checkRateLimit, handleGoogleAuth, updateState]);

  // Handler para mostrar dica da categoria do Google
  const handleGoogleButtonHover = useCallback(() => {
    updateState({ showGoogleCategoryHint: true });
  }, [updateState]);

  // Loading inicial
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Usuário já logado
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
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <h1 className="text-3xl font-bold text-white mb-2">INTERBØX 2025</h1>
          <p className="text-pink-400 font-tech">Aqui você acessa o ecossistema.</p>
        </div>

        {/* Form */}
        <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {state.isLogin ? 'Acessar PRÉ-ARENA' : 'Criar Conta'}
          </h2>

          {/* Mensagens de erro/sucesso */}
          {state.error && (
            <div 
              className={`px-4 py-3 rounded-lg mb-6 ${
                state.error.includes('✅') 
                  ? 'bg-green-500/20 border border-green-500 text-green-300'
                  : 'bg-red-500/20 border border-red-500 text-red-300'
              }`}
              role="alert"
              aria-live="polite"
            >
              {state.error}
            </div>
          )}

          {/* Rate limiting warning */}
          {attempts > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 text-yellow-200" role="alert">
              Tentativas: {attempts}/{maxAttempts}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={state.email}
                onChange={(e) => updateState({ email: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                placeholder="seu@email.com"
                required
                disabled={state.loading}
                autoComplete="email"
                aria-describedby={state.error ? "error-message" : undefined}
                aria-invalid={!!state.error}
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={state.password}
                onChange={(e) => updateState({ password: e.target.value })}
                className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                placeholder="••••••••"
                required
                disabled={state.loading}
                autoComplete={state.isLogin ? "current-password" : "new-password"}
                aria-describedby={state.error ? "error-message" : undefined}
                aria-invalid={!!state.error}
              />
            </div>

            {/* Aviso para contas Google */}
            <div className="mt-4 text-center text-sm text-gray-400">
              ⚠️ Se você criou sua conta com Google, use <b>Continuar com Google</b> para acessar.<br />
              Não é necessário cadastrar ou recuperar senha para contas Google.
            </div>

            {/* Seleção de tipo de usuário */}
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
                    checked={state.userType === 'atleta'}
                    onChange={(e) => updateState({ userType: e.target.value as UserType })}
                    className="text-pink-500 focus:ring-pink-500"
                    disabled={state.loading}
                  />
                  <span className="text-white">🏋️‍♀️ Atleta - Quero competir</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="audiovisual"
                    checked={state.userType === 'audiovisual'}
                    onChange={(e) => updateState({ userType: e.target.value as UserType })}
                    className="text-pink-500 focus:ring-pink-500"
                    disabled={state.loading}
                  />
                  <span className="text-white">📹 Audiovisual - Quero cobrir o evento</span>
                </label>
              </div>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={state.loading || state.isProcessing || !isFormValid}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={state.isLogin ? 'Fazer login na conta' : 'Criar nova conta'}
            >
              {state.loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {state.isLogin ? 'Entrando...' : 'Criando conta...'}
                </div>
              ) : (
                state.isLogin ? 'Entrar na Arena' : 'Criar Conta'
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

          {/* Aviso sobre categoria do Google */}
          {state.showGoogleCategoryHint && (
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4 text-blue-200">
              💡 Sua seleção de categoria ({state.userType === 'atleta' ? 'Atleta' : 'Audiovisual'}) será usada para o login com Google
            </div>
          )}

          {/* Botão Google */}
          <button
            onClick={handleGoogleSignIn}
            onMouseEnter={handleGoogleButtonHover}
            onFocus={handleGoogleButtonHover}
            disabled={state.loading || state.isProcessing}
            className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fazer login com conta do Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{state.loading ? 'Entrando...' : 'Continuar com Google'}</span>
          </button>

          {/* Toggle login/signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => updateState({ 
                isLogin: !state.isLogin, 
                error: '',
                email: '',
                password: '',
                showGoogleCategoryHint: false
              })}
              className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
              disabled={state.loading}
              aria-label={state.isLogin ? 'Mudar para modo de criação de conta' : 'Mudar para modo de login'}
            >
              {state.isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
            </button>
          </div>

          {/* Links adicionais */}
          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white text-sm transition-colors block w-full"
              disabled={state.loading}
              aria-label="Voltar para a página inicial"
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
                aria-label="Abrir comunidade INTERBOX no WhatsApp em nova aba"
              >
                📲 Entrar na Comunidade INTERBOX
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}