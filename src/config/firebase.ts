import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDyZi1zl5Kt5-5BJicMk3XcG8JuNmmqNIs',
  authDomain: 'msn-messenger-81e2a.firebaseapp.com',
  projectId: 'msn-messenger-81e2a',
  storageBucket: 'msn-messenger-81e2a.firebasestorage.app',
  messagingSenderId: '232085066563',
  appId: '1:232085066563:web:24d76110f4f1bb5fad15f6',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getDatabase(app);
