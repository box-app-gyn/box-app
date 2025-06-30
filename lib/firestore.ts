import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp as FirestoreTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  FirestoreUser, 
  FirestorePedido, 
  FirestoreAudiovisual,
  FirestoreAdminLog,
  UserRole,
  PaymentStatus,
  ApprovalStatus,
  AudiovisualTipo
} from '@/types/firestore';

// Funções para Users
export const createUser = async (
  uid: string,
  userData: Omit<FirestoreUser, 'uid' | 'createdAt' | 'updatedAt'>
) => {
  const userRef = doc(db, 'users', uid);
  const userDoc = {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(userRef, userDoc);
  return userRef;
};

export const getUser = async (uid: string): Promise<FirestoreUser | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as FirestoreUser;
  }
  return null;
};

export const updateUser = async (uid: string, updates: Partial<FirestoreUser>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getUsersByRole = async (role: UserRole): Promise<FirestoreUser[]> => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as FirestoreUser);
};

// Funções para Pedidos
export const createPedido = async (pedidoData: Omit<FirestorePedido, 'id' | 'createdAt' | 'updatedAt'>) => {
  const pedidosRef = collection(db, 'pedidos');
  const pedidoDoc = {
    ...pedidoData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(pedidosRef, pedidoDoc);
  return docRef;
};

export const getPedido = async (id: string): Promise<FirestorePedido | null> => {
  const pedidoRef = doc(db, 'pedidos', id);
  const pedidoSnap = await getDoc(pedidoRef);
  
  if (pedidoSnap.exists()) {
    return { id: pedidoSnap.id, ...pedidoSnap.data() } as FirestorePedido;
  }
  return null;
};

export const updatePedido = async (id: string, updates: Partial<FirestorePedido>) => {
  const pedidoRef = doc(db, 'pedidos', id);
  await updateDoc(pedidoRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getPedidosByUser = async (userId: string): Promise<FirestorePedido[]> => {
  const q = query(
    collection(db, 'pedidos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestorePedido);
};

export const getPedidosByStatus = async (status: PaymentStatus): Promise<FirestorePedido[]> => {
  const q = query(
    collection(db, 'pedidos'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestorePedido);
};

// Funções para Audiovisual (engloba fotógrafos, videomakers, etc.)
export const createAudiovisual = async (audiovisualData: Omit<FirestoreAudiovisual, 'id' | 'createdAt' | 'updatedAt'>) => {
  const audiovisualRef = collection(db, 'audiovisual');
  const audiovisualDoc = {
    ...audiovisualData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(audiovisualRef, audiovisualDoc);
  return docRef;
};

export const getAudiovisual = async (id: string): Promise<FirestoreAudiovisual | null> => {
  const audiovisualRef = doc(db, 'audiovisual', id);
  const audiovisualSnap = await getDoc(audiovisualRef);
  
  if (audiovisualSnap.exists()) {
    return { id: audiovisualSnap.id, ...audiovisualSnap.data() } as FirestoreAudiovisual;
  }
  return null;
};

export const updateAudiovisual = async (id: string, updates: Partial<FirestoreAudiovisual>) => {
  const audiovisualRef = doc(db, 'audiovisual', id);
  await updateDoc(audiovisualRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getAudiovisualByStatus = async (status: ApprovalStatus): Promise<FirestoreAudiovisual[]> => {
  const q = query(
    collection(db, 'audiovisual'),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestoreAudiovisual);
};

export const getAudiovisualByTipo = async (tipo: AudiovisualTipo): Promise<FirestoreAudiovisual[]> => {
  const q = query(
    collection(db, 'audiovisual'),
    where('tipo', '==', tipo),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestoreAudiovisual);
};

export const getAudiovisualByTipoAndStatus = async (tipo: AudiovisualTipo, status: ApprovalStatus): Promise<FirestoreAudiovisual[]> => {
  const q = query(
    collection(db, 'audiovisual'),
    where('tipo', '==', tipo),
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestoreAudiovisual);
};

// Funções para AdminLogs
export const createAdminLog = async (logData: Omit<FirestoreAdminLog, 'id' | 'createdAt'>) => {
  const logsRef = collection(db, 'adminLogs');
  const logDoc = {
    ...logData,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(logsRef, logDoc);
  return docRef;
};

export const getAdminLogs = async (): Promise<FirestoreAdminLog[]> => {
  const q = query(
    collection(db, 'adminLogs'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FirestoreAdminLog);
};

// Funções utilitárias
export const convertTimestamp = (timestamp: FirestoreTimestamp) => {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds,
  };
};

export const createTimestamp = () => {
  return convertTimestamp(FirestoreTimestamp.now());
};

// Valida se o time está completo e todos pagaram
export async function validarTimeCompletoEPago(teamId: string) {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap = await getDoc(teamRef);
  if (!teamSnap.exists()) return { status: 'not_found' };
  
  const team = teamSnap.data();
  const atletas: string[] = team.atletas || [];
  
  if (atletas.length < 4) return { status: 'incomplete' };
  
  const pedidosRef = collection(db, 'pedidos');
  const q = query(pedidosRef, where('teamId', '==', teamId), where('status', '==', 'paid'));
  const pedidosSnap = await getDocs(q);
  const pagantes = pedidosSnap.docs.map(doc => doc.data().userId);
  
  if (pagantes.length === atletas.length) {
    await updateDoc(teamRef, { status: 'confirmado' });
    return { status: 'confirmado' };
  }
  
  return { status: 'aguardando_pagamento' };
}

// Busca times formados (status confirmado) e gera ícone war tech
export async function getTimesFormados() {
  const teamsRef = collection(db, 'teams');
  const q = query(teamsRef, where('status', '==', 'confirmado'));
  const teamsSnap = await getDocs(q);
  
  return teamsSnap.docs.map(doc => {
    const team = doc.data();
    return {
      id: doc.id,
      nome: team.nome,
      icone: '⚔️' // Ícone war tech
    };
  });
} 