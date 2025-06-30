import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Image from 'next/image';
import TeamDashboardBadge from '@/components/TeamDashboardBadge';
import MFAStatus from '@/components/MFAStatus';
import TeamInvites from '@/components/TeamInvites';

interface Team {
  id: string;
  nome: string;
  captainId: string;
  atletas: string[];
  status: string;
}

interface Pedido {
  id: string;
  tipo: string;
  quantidade: number;
  valorTotal: number;
  status: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [userPedidos, setUserPedidos] = useState<Pedido[]>([]);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadUserData(user.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadUserData = async (userId: string) => {
    try {
      // Carregar dados do usuário
      const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        setUserData({ id: userDoc.id, ...userDoc.data() });
      }

      // Carregar times do usuário
      const teamsQuery = query(collection(db, 'teams'), where('atletas', 'array-contains', userId));
      const teamsSnapshot = await getDocs(teamsQuery);
      const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setUserTeams(teams);

      // Carregar pedidos do usuário
      const pedidosQuery = query(collection(db, 'pedidos'), where('userId', '==', userId));
      const pedidosSnapshot = await getDocs(pedidosQuery);
      const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
      setUserPedidos(pedidos);
    } catch (error: unknown) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error: unknown) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] text-white font-tech">
      {/* Header */}
      <header className="w-full px-6 py-4 border-b border-pink-500 flex items-center justify-between bg-black/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Image
            src="/logos/logo_circulo.png"
            alt="Interbox 2025 Logo"
            width={40}
            height={40}
            className="drop-shadow-[0_2px_12px_rgba(255,27,221,0.7)]"
          />
          <div>
            <h1 className="text-xl font-bold text-pink-500">ARENA INTERBOX</h1>
            <p className="text-xs text-cyan-400">Bem-vindo, {userData?.displayName?.toString() || user?.email || 'Usuário'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-white hover:text-pink-400 transition-colors"
          >
            Início
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* User Info */}
        <div className="bg-black/60 rounded-xl p-6 mb-8 border border-pink-500/20">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Seu Perfil</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white font-bold">{user?.email}</p>
            </div>
            <div>
              <p className="text-gray-400">Função</p>
              <p className="text-white font-bold">{(userData?.role as string) || 'Atleta'}</p>
            </div>
          </div>
          
          {/* MFA Status */}
          <MFAStatus 
            mfaEnabled={(userData?.mfaEnabled as boolean) || false}
            phoneNumber={userData?.phoneNumber as string}
          />
        </div>

        {/* Teams Section */}
        <div className="bg-black/60 rounded-xl p-6 mb-8 border border-pink-500/20">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Seus Times</h2>
          {userTeams.length > 0 ? (
            <div className="space-y-4">
              {userTeams.map((team) => (
                <div key={team.id} className="bg-[#0a0a1a] rounded-lg p-4 border border-cyan-500/20">
                  <h3 className="text-lg font-bold text-cyan-400 mb-2">{team.nome}</h3>
                  <p className="text-gray-400 mb-2">Atletas: {team.atletas.length}/4</p>
                  <TeamDashboardBadge status={team.status as any} /> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Você ainda não está em nenhum time</p>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors">
                Criar/Entrar em Time
              </button>
            </div>
          )}
        </div>

        {/* Convites Section */}
        <TeamInvites />

        {/* Pedidos Section */}
        <div className="bg-black/60 rounded-xl p-6 mb-8 border border-pink-500/20">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Seus Pedidos</h2>
          {userPedidos.length > 0 ? (
            <div className="space-y-4">
              {userPedidos.map((pedido) => (
                <div key={pedido.id} className="bg-[#0a0a1a] rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-cyan-400">{pedido.tipo}</h3>
                      <p className="text-gray-400">Quantidade: {pedido.quantidade}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">R$ {pedido.valorTotal.toFixed(2)}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        pedido.status === 'paid' ? 'bg-green-600' :
                        pedido.status === 'pending' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {pedido.status === 'paid' ? 'Pago' :
                         pedido.status === 'pending' ? 'Pendente' :
                         'Cancelado'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Você ainda não fez nenhum pedido</p>
              <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors">
                Fazer Pedido
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all">
            <h3 className="text-lg font-bold mb-2">Criar Time</h3>
            <p className="text-sm opacity-90">Forme sua equipe para a competição</p>
          </button>
          <button className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all">
            <h3 className="text-lg font-bold mb-2">Comprar Ingresso</h3>
            <p className="text-sm opacity-90">Garanta sua vaga no evento</p>
          </button>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all">
            <h3 className="text-lg font-bold mb-2">Ver Regulamento</h3>
            <p className="text-sm opacity-90">Conheça as regras da competição</p>
          </button>
        </div>
      </main>
    </div>
  );
} 