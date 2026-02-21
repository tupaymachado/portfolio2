import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { auth } from '../../../config/firebase';
import MsnLogin from './MsnLogin';
import MsnContactList from './MsnContactList';
import MsnChatWindow from './MsnChatWindow';
import styles from './MsnApp.module.css';

export type MsnScreen = 'login' | 'contacts' | 'chat';

export default function MsnApp() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<MsnScreen>('login');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Escutar mudanças de auth do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setScreen(user ? 'contacts' : 'login');
      setIsLoading(false);
    });

    // Em dev, faz login anônimo automático para pular a tela de login
    if (import.meta.env.DEV && !auth.currentUser) {
      signInAnonymously(auth);
    }

    return unsubscribe;
  }, []);

  const handleOpenChat = (roomId: string) => {
    setActiveRoom(roomId);
    setScreen('chat');
  };

  const handleBackToContacts = () => {
    setActiveRoom(null);
    setScreen('contacts');
  };

  const handleLogout = () => {
    auth.signOut();
    setScreen('login');
  };

  if (isLoading) {
    return <div className={styles.container}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      {screen === 'login' && (
        <MsnLogin />
      )}
      {screen === 'contacts' && firebaseUser && (
        <MsnContactList
          user={firebaseUser}
          onOpenChat={handleOpenChat}
          onLogout={handleLogout}
        />
      )}
      {screen === 'chat' && firebaseUser && activeRoom && (
        <MsnChatWindow
          user={firebaseUser}
          roomId={activeRoom}
          onBack={handleBackToContacts}
        />
      )}
    </div>
  );
}
