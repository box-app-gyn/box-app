import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HubPage() {
  return (
    <ProtectedRoute>
      <HubContent />
    </ProtectedRoute>
  );
}

function HubContent() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
        >
          Sair
        </button>
      </header>
      <main className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen w-full">
        <div className="text-center text-white py-20">
          <h1 className="text-4xl font-bold mb-4">Hub Funcionando!</h1>
          <p className="text-xl">Usuário: {user ? user.email : 'NÃO LOGADO'}</p>
          <p className="text-xl">User JSON: {JSON.stringify(user)}</p>
          <p className="text-xl">Window: {typeof window !== 'undefined' ? 'Sim' : 'Não'}</p>
          <p className="text-xl">Auth Loading: {String(user === null)}</p>
          <p className="mt-4">Se você está vendo isso, a página está funcionando.</p>
        </div>
      </main>
    </>
  );
} 