import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Image from 'next/image';

// Removido: import { handleAuthError } from '../utils/errorHandler';
import { useRateLimit } from '../hooks/useRateLimit';
import { motion } from 'framer-motion';
import ConfettiExplosion from '@/components/ConfettiExplosion';

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cidade: '',
    box: '',
    whatsapp: '',
    telefone: '',
    categoria: 'atleta',
    mensagem: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();
  const { checkRateLimit, attempts, maxAttempts } = useRateLimit();

  // Verificar se usuário já está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Se já tem dados completos, redirecionar para dashboard
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!formData.senha) {
      setError('Senha é obrigatória');
      return false;
    }
    if (formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setError('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.cidade.trim()) {
      setError('Cidade é obrigatória');
      return false;
    }
    if (!formData.box.trim()) {
      setError('Box/Academia é obrigatório');
      return false;
    }
    if (!formData.whatsapp.trim()) {
      setError('WhatsApp é obrigatório');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!checkRateLimit()) {
      setError('Muitas tentativas. Aguarde um momento.');
      return;
    }

    // Validação inline para evitar dependências
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    if (!formData.senha) {
      setError('Senha é obrigatória');
      return;
    }
    if (formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setError('Senhas não coincidem');
      return;
    }
    if (!formData.cidade.trim()) {
      setError('Cidade é obrigatória');
      return;
    }
    if (!formData.box.trim()) {
      setError('Box/Academia é obrigatório');
      return;
    }
    if (!formData.whatsapp.trim()) {
      setError('WhatsApp é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.senha
      );

      const user = userCredential.user;

      // Salvar dados completos no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: formData.nome.trim(),
        email: formData.email.trim(),
        photoURL: '',
        role: 'publico',
        isActive: true,
        cidade: formData.cidade.trim(),
        box: formData.box.trim(),
        whatsapp: formData.whatsapp.trim(),
        telefone: formData.telefone.trim() || '',
        categoria: formData.categoria,
        mensagem: formData.mensagem.trim() || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        // 🎯 GAMIFICAÇÃO CAMADA 1
        gamification: {
          points: 10, // Pontos iniciais por cadastro
          level: 'iniciante',
          totalActions: 1,
          lastActionAt: new Date(),
          achievements: ['first_blood'], // Primeira conquista
          rewards: [],
          streakDays: 1,
          lastLoginStreak: new Date(),
          referralCode: `REF${user.uid.substring(0, 8).toUpperCase()}`,
          referrals: [],
          referralPoints: 0
        }
      });

      setSuccess('Conta criada com sucesso! 🎉');
      setShowConfetti(true);
      
      // Redirecionar para home após 3 segundos
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }, [formData, loading, checkRateLimit, router]);

  const handleGoogleSignIn = useCallback(async () => {
    if (loading) return;
    
    if (!checkRateLimit()) {
      setError('Muitas tentativas. Aguarde um momento.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Salvar dados básicos do Google
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || formData.nome.trim(),
        email: user.email || formData.email.trim(),
        photoURL: user.photoURL || '',
        role: 'publico',
        isActive: true,
        cidade: formData.cidade.trim(),
        box: formData.box.trim(),
        whatsapp: formData.whatsapp.trim(),
        telefone: formData.telefone.trim() || '',
        categoria: formData.categoria,
        mensagem: formData.mensagem.trim() || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        // 🎯 GAMIFICAÇÃO CAMADA 1
        gamification: {
          points: 10, // Pontos iniciais por cadastro
          level: 'iniciante',
          totalActions: 1,
          lastActionAt: new Date(),
          achievements: ['first_blood'], // Primeira conquista
          rewards: [],
          streakDays: 1,
          lastLoginStreak: new Date(),
          referralCode: `REF${user.uid.substring(0, 8).toUpperCase()}`,
          referrals: [],
          referralPoints: 0
        }
      });

      setSuccess('Conta criada com sucesso! 🎉');
      setShowConfetti(true);
      
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }, [formData, loading, checkRateLimit, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <p className="text-pink-400 font-tech">Crie sua conta e entre na arena</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Passo {currentStep} de 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {currentStep === 1 && 'Dados Pessoais'}
            {currentStep === 2 && 'Informações Locais'}
            {currentStep === 3 && 'Confirmação'}
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

          {attempts > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 text-yellow-200">
              Tentativas: {attempts}/{maxAttempts}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-white mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Seu nome completo"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-white mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-white mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Informações Locais */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-white mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Sua cidade"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="box" className="block text-sm font-medium text-white mb-2">
                    Box/Academia *
                  </label>
                  <input
                    type="text"
                    id="box"
                    name="box"
                    value={formData.box}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Nome do seu box/academia"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-white mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="(11) 99999-9999"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-white mb-2">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="(11) 99999-9999"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-white mb-2">
                    Categoria *
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    required
                    disabled={loading}
                  >
                    <option value="atleta">◾ Atleta - Quero competir</option>
                    <option value="judge">◾ Judge - Quero julgar</option>
                    <option value="espectador">◾ Espectador - Quero assistir</option>
                    <option value="midia">◾ Mídia - Quero cobrir</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-white mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    placeholder="Conte-nos mais sobre você..."
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmação */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Confirme seus dados:</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><strong>Nome:</strong> {formData.nome}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Cidade:</strong> {formData.cidade}</p>
                    <p><strong>Box:</strong> {formData.box}</p>
                    <p><strong>WhatsApp:</strong> {formData.whatsapp}</p>
                    <p><strong>Categoria:</strong> {formData.categoria}</p>
                    {formData.telefone && <p><strong>Telefone:</strong> {formData.telefone}</p>}
                    {formData.mensagem && <p><strong>Mensagem:</strong> {formData.mensagem}</p>}
                  </div>
                </div>

                <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
                  <p className="text-pink-300 text-sm">
                    🎯 <strong>Bônus:</strong> Você ganhará <strong>10 $BOX</strong> por criar sua conta!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Voltar
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Criando conta...
                    </div>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Google Sign In */}
          {currentStep === 3 && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/60 text-gray-400">ou</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Criando conta...' : 'Continuar com Google'}</span>
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
            >
              Já tem conta? Entrar
            </button>
          </div>
        </div>
      </div>

      {/* Confete */}
      <ConfettiExplosion
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
} 