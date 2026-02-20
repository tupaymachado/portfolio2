import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../config/firebase';
import styles from './MsnLogin.module.css';
import msnLogo from '../../../assets/icons/msn-messenger.webp';

export default function MsnLogin() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      // Não mostrar erro se o usuário apenas fechou o popup
      if (!message.includes('popup-closed')) {
        setError(message);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.header}>
        <div className={styles.headerGradient} />
      </div>

      <div className={styles.body}>
        <img src={msnLogo} alt="MSN Messenger" className={styles.logo} />
        <h2 className={styles.title}>MSN Messenger</h2>
        <p className={styles.subtitle}>Conecte-se com seus amigos!</p>

        <button
          className={styles.signInButton}
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
        >
          {isSigningIn ? 'Conectando...' : 'Entrar com Google'}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.footer}>
        <span>Windows Live Messenger — Portfolio Edition</span>
      </div>
    </div>
  );
}
