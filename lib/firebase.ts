import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics conditionally (only in browser and if supported)
let analytics = null;

if (typeof window !== 'undefined') {
  // Verificar se o measurement ID está disponível
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  
  if (measurementId) {
    isSupported().then(yes => {
      if (yes) {
        try {
          analytics = getAnalytics(app);
          console.log('✅ Firebase Analytics inicializado com sucesso');
        } catch (error) {
          console.log('⚠️ Firebase Analytics falhou ao inicializar:', error);
        }
      } else {
        console.log('ℹ️ Firebase Analytics não suportado neste ambiente');
      }
    }).catch((error) => {
      console.log('⚠️ Firebase Analytics não suportado:', error);
    });
  } else {
    console.log('ℹ️ Measurement ID não configurado - Analytics desabilitado');
  }
}

export { analytics };
export default app; 