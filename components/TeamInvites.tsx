import React, { useState, useEffect, useCallback } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@/hooks/useAuth';

interface Convite {
  id: string;
  teamId: string;
  teamName: string;
  captainId: string;
  captainName: string;
  captainEmail: string;
  invitedEmail: string;
  invitedName: string;
  status: 'pendente' | 'aceito' | 'recusado' | 'cancelado' | 'expirado';
  createdAt: { toDate: () => Date } | Date;
  expiresAt: { toDate: () => Date } | Date;
}

export default function TeamInvites() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const { user } = useAuth();
  const functions = getFunctions();

  const loadConvites = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const listarConvites = httpsCallable(functions, 'listarConvitesUsuarioFunction');
      const result = await listarConvites({ userId: user.uid });
      const data = result.data as { success: boolean; convites: Convite[] };
      
      if (data.success) {
        setConvites(data.convites);
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoading(false);
    }
  }, [user, functions]);

  useEffect(() => {
    loadConvites();
  }, [loadConvites]);

  const responderConvite = async (conviteId: string, resposta: 'aceito' | 'recusado') => {
    if (!user) return;
    
    try {
      setResponding(conviteId);
      const responderConviteFn = httpsCallable(functions, 'responderConviteTimeFunction');
      const result = await responderConviteFn({
        conviteId,
        resposta,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuário'
      });
      
      const data = result.data as { success: boolean; message: string };
      if (data.success) {
        // Recarregar convites
        await loadConvites();
        alert(data.message);
      }
    } catch (error: unknown) {
      console.error('Erro ao responder convite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao responder convite';
      alert(errorMessage);
    } finally {
      setResponding(null);
    }
  };

  const formatarData = (timestamp: Convite['createdAt']) => {
    if (!timestamp) return 'N/A';
    const date = 'toDate' in timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleDateString('pt-BR');
  };

  const isExpirado = (expiresAt: Convite['expiresAt']) => {
    if (!expiresAt) return false;
    const expira = 'toDate' in expiresAt ? expiresAt.toDate() : expiresAt;
    return new Date() > expira;
  };

  if (loading) {
    return (
      <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
        <h2 className="text-2xl font-bold text-pink-500 mb-4">Convites Pendentes</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Carregando convites...</p>
        </div>
      </div>
    );
  }

  if (convites.length === 0) {
    return (
      <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
        <h2 className="text-2xl font-bold text-pink-500 mb-4">Convites Pendentes</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">Você não tem convites pendentes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 rounded-xl p-6 border border-pink-500/20">
      <h2 className="text-2xl font-bold text-pink-500 mb-4">Convites Pendentes</h2>
      <div className="space-y-4">
        {convites.map((convite) => {
          const expirado = isExpirado(convite.expiresAt);
          
          return (
            <div key={convite.id} className="bg-[#0a0a1a] rounded-lg p-4 border border-cyan-500/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-cyan-400">{convite.teamName}</h3>
                  <p className="text-gray-400">Capitão: {convite.captainName}</p>
                  <p className="text-gray-400">Enviado em: {formatarData(convite.createdAt)}</p>
                  {expirado && (
                    <p className="text-red-400 text-sm font-semibold">⚠️ Convite expirado</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    expirado ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {expirado ? 'Expirado' : 'Pendente'}
                  </span>
                </div>
              </div>
              
              {!expirado && (
                <div className="flex gap-2">
                  <button
                    onClick={() => responderConvite(convite.id, 'aceito')}
                    disabled={responding === convite.id}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex-1"
                  >
                    {responding === convite.id ? 'Processando...' : 'Aceitar'}
                  </button>
                  <button
                    onClick={() => responderConvite(convite.id, 'recusado')}
                    disabled={responding === convite.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex-1"
                  >
                    {responding === convite.id ? 'Processando...' : 'Recusar'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 