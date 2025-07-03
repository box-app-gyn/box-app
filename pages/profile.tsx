import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged, User, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '../lib/firebase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { sanitizeInput } from '../utils/sanitize';
import { useGamification } from '@/hooks/useGamification';
import GamifiedLeaderboard from '@/components/GamifiedLeaderboard';
import GamifiedRewards from '@/components/GamifiedRewards';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  userType: 'atleta' | 'audiovisual';
  phoneNumber?: string;
  createdAt: Date;
  lastLogin: Date;
  teamId?: string;
  teamName?: string;
  area?: string; // Para audiovisual
  experience?: string; // Para audiovisual
  bio?: string;
  points?: number;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Estados para edição
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    phoneNumber: '',
    area: '',
    experience: ''
  });

  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // 🎯 GAMIFICAÇÃO
  const { 
    stats: gamificationStats, 
    getLevelProgress,
    getLevelInfo
  } = useGamification();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.uid);
      } else {
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentUser = auth.currentUser;
        const profileData: UserProfile = {
          uid,
          email: currentUser?.email || '',
          displayName: userData.displayName || currentUser?.displayName || '',
          photoURL: userData.photoURL || currentUser?.photoURL || '',
          userType: userData.userType || 'atleta',
          phoneNumber: userData.phoneNumber || '',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLogin: userData.lastLogin?.toDate() || new Date(),
          teamId: userData.teamId || '',
          teamName: userData.teamName || '',
          area: userData.area || '',
          experience: userData.experience || '',
          bio: userData.bio || '',
          points: userData.points || 0
        };
        setProfile(profileData);
        
        // Preencher formulário de edição
        setEditForm({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          phoneNumber: profileData.phoneNumber || '',
          area: profileData.area || '',
          experience: profileData.experience || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setError('Erro ao carregar dados do perfil');
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Sanitizar dados
      const sanitizedData = {
        displayName: sanitizeInput(editForm.displayName),
        bio: sanitizeInput(editForm.bio),
        phoneNumber: sanitizeInput(editForm.phoneNumber),
        area: sanitizeInput(editForm.area),
        experience: sanitizeInput(editForm.experience)
      };

      // Atualizar no Firebase Auth
      await updateProfile(user, {
        displayName: sanitizedData.displayName
      });

      // Atualizar no Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: sanitizedData.displayName,
        bio: sanitizedData.bio,
        phoneNumber: sanitizedData.phoneNumber,
        area: sanitizedData.area,
        experience: sanitizedData.experience,
        updatedAt: new Date()
      });

      // Atualizar estado local
      setProfile(prev => prev ? {
        ...prev,
        displayName: sanitizedData.displayName,
        bio: sanitizedData.bio,
        phoneNumber: sanitizedData.phoneNumber,
        area: sanitizedData.area,
        experience: sanitizedData.experience
      } : null);

      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setError('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais
    if (profile) {
      setEditForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        phoneNumber: profile.phoneNumber || '',
        area: profile.area || '',
        experience: profile.experience || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Upload de foto de perfil
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setError('A imagem deve ter no máximo 2MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handlePhotoUpload = async () => {
    if (!user || !photoFile) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, photoFile);
      const url = await getDownloadURL(storageRef);
      // Atualizar Auth
      await updateProfile(user, { photoURL: url });
      // Atualizar Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url, updatedAt: new Date() });
      setProfile(prev => prev ? { ...prev, photoURL: url } : null);
      setPhotoPreview(null);
      setPhotoFile(null);
      setSuccess('Foto de perfil atualizada!');
    } catch (error) {
      setError('Erro ao enviar foto.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-pink-400">Gerencie suas informações pessoais</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Card Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20 mb-8"
          >
            {/* Avatar e Informações Básicas */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-pink-500/30 overflow-hidden">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="rounded-full object-cover"
                    />
                  ) : profile.photoURL ? (
                    <Image
                      src={profile.photoURL}
                      alt="Avatar"
                      width={128}
                      height={128}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    profile.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                  {/* Botão de upload */}
                  <label className="absolute bottom-2 right-2 bg-black/70 rounded-full p-2 cursor-pointer border-2 border-pink-500/60 hover:bg-pink-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={uploading}
                    />
                    <span className="text-white text-lg">📷</span>
                  </label>
                </div>
                {/* Preview e botão de salvar/cancelar */}
                {photoPreview && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handlePhotoUpload}
                      disabled={uploading}
                      className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-1 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 text-sm disabled:opacity-50"
                    >
                      {uploading ? 'Enviando...' : 'Salvar Foto'}
                    </button>
                    <button
                      onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                      className="bg-gray-600 text-white px-4 py-1 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-black"></div>
              </div>

              {/* Informações */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile.displayName || 'Usuário'}
                </h2>
                <p className="text-gray-400 mb-2">{profile.email}</p>
                
                {/* Badge do tipo de usuário */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {profile.userType === 'atleta' ? (
                    <>
                      <span className="text-2xl">🏋️‍♂️</span>
                      <span className="text-pink-400">Atleta</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🎬</span>
                      <span className="text-cyan-400">Audiovisual</span>
                    </>
                  )}
                </div>

                {/* Time (se atleta) */}
                {profile.userType === 'atleta' && profile.teamName && (
                  <div className="bg-pink-500/20 border border-pink-500/30 rounded-lg p-3 mb-4">
                    <p className="text-pink-400 font-medium">Time: {profile.teamName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200"
              >
                {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Voltar ao Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                Sair
              </button>
            </div>
          </motion.div>

          {/* Formulário de Edição */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 backdrop-blur rounded-xl p-8 shadow-lg border border-pink-500/20 mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Editar Informações</h3>

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

              <div className="grid md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                  />
                </div>

                {/* Área (Audiovisual) */}
                {profile.userType === 'audiovisual' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Área de Atuação
                    </label>
                    <select
                      value={editForm.area}
                      onChange={(e) => setEditForm(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Selecione uma área</option>
                      <option value="fotografia">Fotografia</option>
                      <option value="video">Vídeo</option>
                      <option value="edicao">Edição</option>
                      <option value="drone">Drone</option>
                      <option value="social">Social Media</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                )}

                {/* Experiência (Audiovisual) */}
                {profile.userType === 'audiovisual' && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Experiência
                    </label>
                    <select
                      value={editForm.experience}
                      onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white focus:outline-none focus:border-pink-500"
                    >
                      <option value="">Selecione sua experiência</option>
                      <option value="iniciante">Iniciante (0-1 ano)</option>
                      <option value="intermediario">Intermediário (1-3 anos)</option>
                      <option value="avancado">Avançado (3-5 anos)</option>
                      <option value="profissional">Profissional (5+ anos)</option>
                    </select>
                  </div>
                )}

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/40 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}

          {/* Informações Detalhadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Estatísticas */}
            <div className="bg-black/60 backdrop-blur rounded-xl p-6 shadow-lg border border-pink-500/20">
              <h3 className="text-xl font-bold text-white mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Membro desde:</span>
                  <span className="text-white">
                    {profile.createdAt.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Último login:</span>
                  <span className="text-white">
                    {profile.lastLogin.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo de conta:</span>
                  <span className="text-pink-400 capitalize">
                    {profile.userType}
                  </span>
                </div>
                
                {/* 🎯 GAMIFICAÇÃO */}
                {gamificationStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nível:</span>
                      <span 
                        className="font-bold text-lg px-2 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${getLevelInfo(gamificationStats.level).color}20`,
                          color: getLevelInfo(gamificationStats.level).color,
                          border: `1px solid ${getLevelInfo(gamificationStats.level).color}40`
                        }}
                      >
                        {gamificationStats.level.charAt(0).toUpperCase() + gamificationStats.level.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pontos (XP):</span>
                      <span className="text-yellow-400 font-bold text-lg">
                        {gamificationStats.points} ⭐
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ações realizadas:</span>
                      <span className="text-white">
                        {gamificationStats.totalActions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Streak de login:</span>
                      <span className="text-orange-400 font-medium">
                        {gamificationStats.streakDays} dias 🔥
                      </span>
                    </div>
                    {gamificationStats.position && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Posição no ranking:</span>
                        <span className="text-pink-400 font-medium">
                          #{gamificationStats.position}
                        </span>
                      </div>
                    )}
                    
                    {/* Barra de Progresso do Nível */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progresso para próximo nível</span>
                        <span>{getLevelProgress().percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${getLevelProgress().percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{getLevelProgress().current} XP</span>
                        <span>{getLevelProgress().next} XP</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Informações Específicas */}
            <div className="bg-black/60 backdrop-blur rounded-xl p-6 shadow-lg border border-pink-500/20">
              <h3 className="text-xl font-bold text-white mb-4">
                {profile.userType === 'atleta' ? 'Informações do Atleta' : 'Informações Audiovisual'}
              </h3>
              
              {profile.userType === 'atleta' ? (
                <div className="space-y-3">
                  {profile.teamName ? (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-white">{profile.teamName}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">Nenhum time formado ainda</p>
                  )}
                  <button
                    onClick={() => router.push('/times')}
                    className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-all duration-200"
                  >
                    Ver Times
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.area && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Área:</span>
                      <span className="text-white capitalize">{profile.area}</span>
                    </div>
                  )}
                  {profile.experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experiência:</span>
                      <span className="text-white capitalize">{profile.experience}</span>
                    </div>
                  )}
                  <button
                    onClick={() => router.push('/audiovisual')}
                    className="w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-all duration-200"
                  >
                    Área Audiovisual
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* 🎯 SEÇÕES DE GAMIFICAÇÃO */}
          {gamificationStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 grid md:grid-cols-2 gap-8"
            >
              {/* Ranking da Comunidade */}
              <GamifiedLeaderboard 
                title="🏆 Ranking da Comunidade"
                subtitle="Veja quem está dominando"
                maxItems={5}
                showUserPosition={true}
              />

              {/* Recompensas */}
              <GamifiedRewards 
                title="🎁 Suas Recompensas"
                subtitle="Resgate prêmios exclusivos"
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 