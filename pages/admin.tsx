import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, where, orderBy, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Image from 'next/image';
import { useAnalytics } from '@/hooks/useAnalytics';

interface UserData {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  createdAt: Timestamp;
  mfaEnabled: boolean;
  phoneNumber?: string;
}

interface Team {
  id: string;
  nome: string;
  captainId: string;
  captainName: string;
  atletas: string[];
  atletasData: UserData[];
  status: string;
  categoria: string;
  createdAt: Timestamp;
  inscricaoPaga: boolean;
}

interface Pedido {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  tipo: string;
  quantidade: number;
  valorTotal: number;
  status: string;
  createdAt: Timestamp;
  paymentMethod?: string;
  transactionId?: string;
}

interface Stats {
  totalUsers: number;
  totalTeams: number;
  totalPedidos: number;
  totalRevenue: number;
  pendingPedidos: number;
  activeUsers: number;
  teamsPending: number;
  teamsApproved: number;
}

export default function AdminDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeams: 0,
    totalPedidos: 0,
    totalRevenue: 0,
    pendingPedidos: 0,
    activeUsers: 0,
    teamsPending: 0,
    teamsApproved: 0
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const { trackPage, trackAdmin } = useAnalytics();

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() } as UserData;
        setUserData(userData);
        
        // Verificar se é admin ou marketing
        if (userData.role !== 'admin' && userData.role !== 'marketing') {
          router.push('/dashboard');
          return;
        }
        
        // Carregar dados baseado no role
        await loadAdminData();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }, [router]);

  const loadStats = async () => {
    try {
      // Total de usuários
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().isActive).length;

      // Total de times
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const totalTeams = teamsSnapshot.size;
      const teamsPending = teamsSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
      const teamsApproved = teamsSnapshot.docs.filter(doc => doc.data().status === 'approved').length;

      // Total de pedidos e receita
      const pedidosSnapshot = await getDocs(collection(db, 'pedidos'));
      const totalPedidos = pedidosSnapshot.size;
      const pendingPedidos = pedidosSnapshot.docs.filter(doc => doc.data().status === 'pending').length;
      const totalRevenue = pedidosSnapshot.docs
        .filter(doc => doc.data().status === 'paid')
        .reduce((sum, doc) => sum + (doc.data().valorTotal || 0), 0);

      setStats({
        totalUsers,
        totalTeams,
        totalPedidos,
        totalRevenue,
        pendingPedidos,
        activeUsers,
        teamsPending,
        teamsApproved
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const teamsQuery = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
      const teamsSnapshot = await getDocs(teamsQuery);
      const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeams(teamsData);
    } catch (error) {
      console.error('Erro ao carregar times:', error);
    }
  };

  const loadPedidos = async () => {
    try {
      const pedidosQuery = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
      const pedidosSnapshot = await getDocs(pedidosQuery);
      const pedidosData = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const loadAdminData = useCallback(async () => {
    try {
      // Carregar estatísticas
      await loadStats();
      // Carregar dados baseado na aba ativa
      switch (activeTab) {
        case 'users':
          await loadUsers();
          break;
        case 'teams':
          await loadTeams();
          break;
        case 'pedidos':
          await loadPedidos();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados admin:', error);
    }
  }, [activeTab, loadStats, loadUsers, loadTeams, loadPedidos]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, loadUserData]);

  // Tracking de acesso ao painel admin
  useEffect(() => {
    if (userData && !loading) {
      trackPage('admin');
      trackAdmin('access', userData.email);
      // Carregar dados admin após o usuário ser carregado
      loadAdminData();
    }
  }, [userData, loading, trackPage, trackAdmin, loadAdminData]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    trackAdmin('tab_change', `${userData?.email}_${tab}`);
    if (tab !== 'overview') {
      loadAdminData();
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      trackAdmin('update_user_role', `${userData?.email}_${newRole}`);
      await loadUsers();
      await loadStats();
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
    }
  };

  const updateTeamStatus = async (teamId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'teams', teamId), { status: newStatus });
      trackAdmin('update_team_status', `${userData?.email}_${newStatus}`);
      await loadTeams();
      await loadStats();
    } catch (error) {
      console.error('Erro ao atualizar status do time:', error);
    }
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'pedidos', pedidoId), { status: newStatus });
      trackAdmin('update_pedido_status', `${userData?.email}_${newStatus}`);
      await loadPedidos();
      await loadStats();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  const handleLogout = async () => {
    try {
      trackAdmin('logout', userData?.email || 'unknown');
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Funções de verificação de permissões
  const canViewFinancialData = () => userData?.role === 'admin';
  const canEditUsers = () => userData?.role === 'admin';
  const canEditTeams = () => userData?.role === 'admin';
  const canEditPedidos = () => userData?.role === 'admin';
  const canViewUserEmails = () => userData?.role === 'admin' || userData?.role === 'marketing';
  const canViewUserNames = () => userData?.role === 'admin' || userData?.role === 'marketing';
  const canViewTeams = () => userData?.role === 'admin' || userData?.role === 'marketing';
  const canViewStats = () => userData?.role === 'admin' || userData?.role === 'marketing';

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.captainName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pedido.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando painel admin...</p>
        </div>
      </div>
    );
  }

  if (!userData || (userData.role !== 'admin' && userData.role !== 'marketing')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Acesso Negado</h1>
          <p>Você não tem permissão para acessar o painel administrativo.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Voltar ao Dashboard
          </button>
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
            <h1 className="text-xl font-bold text-pink-500">PAINEL ADMINISTRATIVO</h1>
            <p className="text-xs text-cyan-400">CERRADØ INTERBOX 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {userData.role === 'admin' ? 'Admin' : 'Marketing'}: {userData.displayName}
          </span>
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

      {/* Navigation Tabs */}
      <nav className="bg-black/60 border-b border-pink-500/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: '📊', roles: ['admin', 'marketing'] },
              { id: 'users', label: 'Usuários', icon: '👥', roles: ['admin', 'marketing'] },
              { id: 'teams', label: 'Times', icon: '🏆', roles: ['admin', 'marketing'] },
              { id: 'pedidos', label: 'Pedidos', icon: '💰', roles: ['admin'] },
              { id: 'settings', label: 'Configurações', icon: '⚙️', roles: ['admin'] }
            ].filter(tab => tab.roles.includes(userData?.role || '')).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && canViewStats() && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Usuários</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-green-400 text-sm">+{stats.activeUsers} ativos</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-black/60 rounded-xl p-6 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Times Inscritos</p>
                    <p className="text-3xl font-bold text-white">{stats.totalTeams}</p>
                    <p className="text-yellow-400 text-sm">{stats.teamsPending} pendentes</p>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </div>

              {canViewFinancialData() && (
                <>
                  <div className="bg-black/60 rounded-xl p-6 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Receita Total</p>
                        <p className="text-3xl font-bold text-white">R$ {stats.totalRevenue.toFixed(2)}</p>
                        <p className="text-green-400 text-sm">{stats.totalPedidos} pedidos</p>
                      </div>
                      <div className="text-4xl">💰</div>
                    </div>
                  </div>

                  <div className="bg-black/60 rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Pedidos Pendentes</p>
                        <p className="text-3xl font-bold text-white">{stats.pendingPedidos}</p>
                        <p className="text-yellow-400 text-sm">Aguardando pagamento</p>
                      </div>
                      <div className="text-4xl">⏳</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleTabChange('users')}
                className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
              >
                <h3 className="text-lg font-bold mb-2">Gerenciar Usuários</h3>
                <p className="text-sm opacity-90">Ver e editar usuários do sistema</p>
              </button>
              
              <button
                onClick={() => handleTabChange('teams')}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all"
              >
                <h3 className="text-lg font-bold mb-2">Aprovar Times</h3>
                <p className="text-sm opacity-90">Validar e aprovar inscrições</p>
              </button>
              
              {canViewFinancialData() && (
                <button
                  onClick={() => handleTabChange('pedidos')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  <h3 className="text-lg font-bold mb-2">Gestão Financeira</h3>
                  <p className="text-sm opacity-90">Controlar pagamentos e pedidos</p>
                </button>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
              <h2 className="text-2xl font-bold text-pink-500 mb-4">Atividade Recente</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#0a0a1a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Novo usuário registrado</span>
                  </div>
                  <span className="text-gray-400 text-sm">2 min atrás</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#0a0a1a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Time aguardando aprovação</span>
                  </div>
                  <span className="text-gray-400 text-sm">5 min atrás</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#0a0a1a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Novo pedido realizado</span>
                  </div>
                  <span className="text-gray-400 text-sm">10 min atrás</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-500">Gestão de Usuários</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">Todos os roles</option>
                  <option value="admin">Admin</option>
                  <option value="atleta">Atleta</option>
                  <option value="publico">Público</option>
                </select>
              </div>
            </div>

            <div className="bg-black/60 rounded-xl border border-pink-500/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0a0a1a]">
                    <tr>
                      {canViewUserNames() && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuário</th>
                      )}
                      {canViewUserEmails() && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                      )}
                      {canEditUsers() && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">MFA</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#0a0a1a]">
                        {canViewUserNames() && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{user.displayName}</div>
                          </td>
                        )}
                        {canViewUserEmails() && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                        )}
                        {canEditUsers() && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="bg-transparent border border-gray-600 rounded px-2 py-1 text-sm"
                              >
                                <option value="admin">Admin</option>
                                <option value="marketing">Marketing</option>
                                <option value="atleta">Atleta</option>
                                <option value="publico">Público</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {user.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.mfaEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                              }`}>
                                {user.mfaEnabled ? 'Habilitado' : 'Desabilitado'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button className="text-pink-400 hover:text-pink-300 mr-2">Editar</button>
                              <button className="text-red-400 hover:text-red-300">Excluir</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && canViewTeams() && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-500">Gestão de Times</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Buscar times..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredTeams.map((team) => (
                <div key={team.id} className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-cyan-400">{team.nome}</h3>
                      <p className="text-gray-400">Capitão: {team.captainName}</p>
                      <p className="text-gray-400">Categoria: {team.categoria}</p>
                    </div>
                    {canEditTeams() && (
                      <div className="flex gap-2">
                        <select
                          value={team.status}
                          onChange={(e) => updateTeamStatus(team.id, e.target.value)}
                          className="bg-transparent border border-gray-600 rounded px-3 py-1 text-sm"
                        >
                          <option value="pending">Pendente</option>
                          <option value="approved">Aprovado</option>
                          <option value="rejected">Rejeitado</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Atletas ({team.atletas.length}/4)</h4>
                      <div className="space-y-1">
                        {team.atletasData?.map((atleta, index) => (
                          <div key={index} className="text-sm text-white">
                            {atleta.displayName} ({atleta.email})
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Informações</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className={`${
                            team.status === 'approved' ? 'text-green-400' :
                            team.status === 'rejected' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {team.status === 'approved' ? 'Aprovado' :
                             team.status === 'rejected' ? 'Rejeitado' :
                             'Pendente'}
                          </span>
                        </div>
                        {canViewFinancialData() && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Inscrição:</span>
                            <span className={team.inscricaoPaga ? 'text-green-400' : 'text-red-400'}>
                              {team.inscricaoPaga ? 'Paga' : 'Pendente'}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Criado em:</span>
                          <span className="text-white">
                            {team.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos Tab */}
        {activeTab === 'pedidos' && canEditPedidos() && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-500">Gestão de Pedidos</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="bg-black/60 rounded-xl border border-pink-500/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0a0a1a]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredPedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-[#0a0a1a]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{pedido.userName}</div>
                          <div className="text-sm text-gray-400">{pedido.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{pedido.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{pedido.quantidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                          R$ {pedido.valorTotal.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={pedido.status}
                            onChange={(e) => updatePedidoStatus(pedido.id, e.target.value)}
                            className="bg-transparent border border-gray-600 rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {pedido.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-pink-400 hover:text-pink-300 mr-2">Ver Detalhes</button>
                          <button className="text-red-400 hover:text-red-300">Cancelar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && canEditUsers() && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-pink-500">Configurações do Evento</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">Configurações Gerais</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Evento</label>
                    <input
                      type="text"
                      defaultValue="CERRADØ INTERBOX 2025"
                      className="w-full bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Data do Evento</label>
                    <input
                      type="date"
                      defaultValue="2025-03-15"
                      className="w-full bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Limite de Times</label>
                    <input
                      type="number"
                      defaultValue="32"
                      className="w-full bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">Configurações de Pagamento</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Valor da Inscrição</label>
                    <input
                      type="number"
                      defaultValue="150.00"
                      step="0.01"
                      className="w-full bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Valor do Ingresso</label>
                    <input
                      type="number"
                      defaultValue="50.00"
                      step="0.01"
                      className="w-full bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Prazo de Pagamento</label>
                    <input
                      type="date"
                      defaultValue="2025-02-28"
                      className="w-full bg-black/60 border border-pink-500/20 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Ações do Sistema</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Fazer Backup
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Exportar Dados
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Limpar Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 