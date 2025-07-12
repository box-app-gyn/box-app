import { Firestore, FieldValue } from 'firebase-admin/firestore';

export interface TeamData {
  id: string;
  nome: string;
  categoria: string;
  lote: string;
  valor: number;
  statusPagamento: 'pending' | 'paid' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}

export class FirestoreHelper {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getTeam(teamId: string): Promise<TeamData | null> {
    const doc = await this.db.collection('teams').doc(teamId).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as TeamData;
  }

  async updatePaymentStatus(teamId: string, status: 'pending' | 'paid' | 'cancelled'): Promise<void> {
    await this.db.collection('teams').doc(teamId).update({
      statusPagamento: status,
      updatedAt: FieldValue.serverTimestamp()
    });
  }

  async createPaymentRecord(teamId: string, paymentData: any): Promise<void> {
    await this.db.collection('payments').add({
      teamId,
      ...paymentData,
      createdAt: FieldValue.serverTimestamp()
    });
  }

  async getTeamsByPaymentStatus(status: 'pending' | 'paid' | 'cancelled'): Promise<TeamData[]> {
    const snapshot = await this.db
      .collection('teams')
      .where('statusPagamento', '==', status)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TeamData[];
  }
} 