// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdLZo5ZO32WOpxNgqqSQw381cekJPfVBg",
  authDomain: "interbox-app-8d400.firebaseapp.com",
  projectId: "interbox-app-8d400",
  storageBucket: "interbox-app-8d400.firebasestorage.app",
  messagingSenderId: "1087720410628",
  appId: "1:1087720410628:web:cedfd152820e2b28102f51",
  measurementId: "G-56WEKYTCJZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Connect to auth emulator in development (only if explicitly enabled)
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === 'true' && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch {
    console.log('Auth emulator not available, using production auth');
  }
}

// Initialize Analytics only if supported (browser environment)
let analytics = null;
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  isSupported()
    .then(yes => {
      if (yes) analytics = getAnalytics(app);
    })
    .catch(() => {
      // Ignora erro de fetch em ambiente local
    });
}
export { analytics };

export default app;