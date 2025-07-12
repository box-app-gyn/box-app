import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function HubPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar se estamos no cliente
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      router.push('/login');
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hub - Cerrado Interbox</title>
        <meta name="description" content="Painel principal do usuário - Cerrado Interbox" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <header className="w-full flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Image src="/logos/logo_circulo.png" alt="Logo" width={32} height={32} className="rounded-full" />
          <span className="text-white font-semibold">Hub</span>
        </div>
        <div className="flex gap-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
            >
              Sair
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      <main className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen w-full">
        <div className="text-center text-white py-20 px-4">
          <h1 className="text-4xl font-bold mb-4">Hub Funcionando!</h1>
          
          {user ? (
            <div className="space-y-4">
              <p className="text-xl">✅ Usuário logado: {user.email}</p>
              <p className="text-lg">Bem-vindo ao painel principal!</p>
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => router.push('/pagamento')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors mx-2"
                >
                  💳 Pagamento
                </button>
                <button
                  onClick={() => router.push('/teste-pagamento')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors mx-2"
                >
                  🧪 Teste
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors mx-2"
                >
                  📊 Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xl">❌ Usuário não logado</p>
              <p className="text-lg">Faça login para acessar o painel completo</p>
              
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => router.push('/teste-pagamento')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors mx-2"
                >
                  🧪 Teste de Pagamento
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors mx-2"
                >
                  🏠 Home
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-12 p-4 bg-white/10 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold mb-2">ℹ️ Informações</h3>
            <p className="text-sm">
              • Esta página funciona com ou sem autenticação<br/>
              • Teste no celular e desktop<br/>
              • Acesse as funcionalidades pelos botões acima
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 