import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

type FirebaseEnvConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const getFirebaseEnvConfig = (): FirebaseEnvConfig => {
  // Vite exposes env vars via import.meta.env
  const env = import.meta.env as any;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getFirebaseEnvConfig();
  return !!(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
};

export const getFirestoreDb = () => {
  if (!isFirebaseConfigured()) return null;

  const cfg = getFirebaseEnvConfig();
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  return getFirestore(app);
};
