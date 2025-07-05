import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleAuthError } from '../utils/errorHandler';
import { getValidatedUserType } from '../utils/storage';
import ProtectedRoute from '@/components/ProtectedRoute';

// interface Team {
//   id: string;
//   nome: string;
//   captainId: string;
//   atletas: string[];
//   status: string;
// }

// interface Pedido {
//   id: string;
//   tipo: string;
//   quantidade: number;
//   valorTotal: number;
//   status: string;
// }

interface UserData {
  name: string;
  userType: string;
  email: string;
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // const [userTeams, setUserTeams] = useState<Team[]>([]);
  // const [userPedidos, setUserPedidos] = useState<Pedido[]>([]);
  const router = useRouter();

  const loadUserData = useCallback(async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      } else {
        // Fallback para dados básicos
        setUserData({
          name: currentUser.displayName || 'Usuário',
          userType: getValidatedUserType(),
          email: currentUser.email || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError('Erro ao carregar dados do usuário');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, loadUserData]);

  const handleLogout = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      setError(handleAuthError(err));
    } finally {
      setIsProcessing(false);
    }
  }, [router, isProcessing]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

  // useEffect(() => {
  //   const loadUserTeams = async () => {
  //     try {
  //       // Carregar times do usuário
  //       const teamsQuery = query(collection(db, 'teams'), where('atletas', 'array-contains', user?.uid));
  //       const teamsSnapshot = await getDocs(teamsQuery);
  //       const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
  //       setUserTeams(teams);

  //       // Carregar pedidos do usuário
  //       const pedidosQuery = query(collection(db, 'pedidos'), where('userId', '==', user?.uid));
  //       const pedidosSnapshot = await getDocs(pedidosQuery);
  //       const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
  //     } catch (error: unknown) {
  //       console.error('Erro ao carregar dados:', error);
  //     }
  //   };

  //   if (user) {
  //     loadUserTeams();
  //   }
  // }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Dashboard
            </h1>
            <button
              onClick={handleLogout}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isProcessing ? 'Saindo...' : 'Sair'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Informações do Usuário</h2>
              <div className="space-y-2 text-gray-300">
                <p><strong>Nome:</strong> {userData?.name || 'Não informado'}</p>
                <p><strong>Email:</strong> {userData?.email || user.email}</p>
                <p><strong>Tipo:</strong> {userData?.userType || 'Não definido'}</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/audiovisual')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Área Audiovisual
                </button>
                <button
                  onClick={() => router.push('/times')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Gerenciar Times
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 