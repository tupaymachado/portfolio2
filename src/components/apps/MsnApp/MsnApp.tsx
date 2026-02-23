import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import MsnLogin from './MsnLogin';
import MsnContactList from './MsnContactList';
import { msnUserService } from '../../../services/msnUserService';
import styles from './MsnApp.module.css';

export type MsnScreen = 'login' | 'contacts' | 'chat';

export default function MsnApp() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<MsnScreen>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string>('online');

  // Escutar mudanças de auth do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Interceptar os usuários do DEV ou Anônimos para injetar dados fakes
      if (user && import.meta.env.DEV && (user.isAnonymous || !user.displayName)) {
        const mockedUser = Object.create(user);
        mockedUser.displayName = 'Tupay (Dev)';
        mockedUser.email = 'tupay@dev.local';
        // Avatar padrão pro MSN se mockado
        mockedUser.photoURL = 'https://github.com/tupaymachado.png';

        msnUserService.syncUserOnLogin(
          mockedUser.uid,
          mockedUser.email,
          mockedUser.displayName,
          mockedUser.photoURL,
          userStatus
        );

        setFirebaseUser(mockedUser);
        setScreen('contacts');
      } else if (user) {
        msnUserService.syncUserOnLogin(
          user.uid,
          user.email || '',
          user.displayName || 'Novo Usuário',
          user.photoURL || '',
          userStatus
        );

        setFirebaseUser(user);
        setScreen('contacts');
      } else {
        setFirebaseUser(null);
        setScreen('login');
      }
      setIsLoading(false);
    });

    // Em dev, faz login anônimo automático para pular a tela de login
    if (import.meta.env.DEV && !auth.currentUser) {
      signInAnonymously(auth);
    }

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    if (firebaseUser) {
      msnUserService.updateStatus(firebaseUser.uid, 'offline');
    }
    auth.signOut();
    setScreen('login');
  };

  if (isLoading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      {screen === 'login' && (
        <MsnLogin
          status={userStatus}
          onStatusChange={setUserStatus}
        />
      )}
      {screen === 'contacts' && firebaseUser && (
        <MsnContactList
          user={firebaseUser}
          initialStatus={userStatus}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
