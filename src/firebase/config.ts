import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Debug: Log all environment variables
console.log('Environment variables check:');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('Database URL:', import.meta.env.VITE_FIREBASE_DATABASE_URL);
console.log('Test var:', import.meta.env.VITE_TEST_VAR);
// Check if required environment variables are present
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  throw new Error('VITE_FIREBASE_API_KEY is not defined in environment variables');
}

if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
  throw new Error('VITE_FIREBASE_AUTH_DOMAIN is not defined in environment variables');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('Firebase config:', firebaseConfig);
console.log('Test var:', import.meta.env.VITE_TEST_VAR);
const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Database = getDatabase(app);
export const storage: FirebaseStorage = getStorage(app);

export default app; 