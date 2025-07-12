import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Image from 'next/image';
import { UserType } from '../constants';
import { motion } from 'framer-motion';

export default function SelectCategory() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<UserType>('atleta');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Verificar se o usuário já tem categoria definida
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().userType) {
            // Usuário já tem categoria, redirecionar para hub
            router.push('/hub');
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar categoria do usuário:', error);
        }
      } else {
        router.push('/login');
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCategorySelect = async () => {
    if (!user || saving) return;

    setSaving(true);
    setError('');

    try {
      // Atualizar categoria do usuário
      await setDoc(doc(db, 'users', user.uid), {
        userType: selectedCategory,
        updatedAt: new Date()
      }, { merge: true });

      // Redirecionar para hub
      router.push('/hub');
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      setError('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setSaving(false);
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
            src="/logos/oficial_logo.png"
            alt="Interbox 2025 Logo"
            width={120}
            height={120}
            className="mx-auto mb-4 drop-shadow-[0_2px_12px_rgba(255,27,221,0.7)]"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <h1 className="text-3xl font-bold text-white mb-2">INTERBØX 2025</h1>
          <p className="text-pink-400 font-tech">Escolha sua categoria</p>
        </div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20"
        >

          
          <p className="text-gray-400 text-center mb-6">
            Escolha como você quer participar.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <motion.label 
              className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedCategory === 'atleta' 
                  ? 'border-pink-500 bg-pink-500/10' 
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="category"
                value="atleta"
                checked={selectedCategory === 'atleta'}
                onChange={(e) => setSelectedCategory(e.target.value as UserType)}
                className="text-pink-500 focus:ring-pink-500"
              />
              <div className="flex-1">
                <div className="text-2xl mb-2">🏋️‍♀️</div>
                <div className="text-white font-semibold">Atleta</div>
                <div className="text-gray-400 text-sm">Quero competir no evento</div>
              </div>
            </motion.label>

            <motion.label 
              className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedCategory === 'audiovisual' 
                  ? 'border-pink-500 bg-pink-500/10' 
                  : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="radio"
                name="category"
                value="audiovisual"
                checked={selectedCategory === 'audiovisual'}
                onChange={(e) => setSelectedCategory(e.target.value as UserType)}
                className="text-pink-500 focus:ring-pink-500"
              />
              <div className="flex-1">
                <div className="text-2xl mb-2">📹</div>
                <div className="text-white font-semibold">Audiovisual</div>
                <div className="text-gray-400 text-sm">Quero cobrir o evento</div>
              </div>
            </motion.label>
          </div>

          <button
            onClick={handleCategorySelect}
            disabled={saving}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-[0_0_20px_#E50914] hover:shadow-[0_0_40px_#E50914] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Salvando...
              </div>
            ) : (
              'Continuar'
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Voltar ao login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 