import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../config/firebase';
import styles from './MsnLogin.module.css';
import msnLogo from '../../../assets/icons/msn-messenger.webp';
import msnLogoTitle from '../../../assets/icons/msn-logo-title.webp'
import AppMenuBar from '../../AppMenuBar/AppMenuBar'

export default function MsnLogin() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('online');

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
      <AppMenuBar
        items={[
          {
            label: 'Arquivo',
            onClick: () => { },
          },
          {
            label: 'Editar',
            onClick: () => { },
          },
          {
            label: 'Ajuda',
            onClick: () => { },
          },
        ]}
      />
      <div className={styles.header}>
        <img src={msnLogoTitle} alt="MSN Messenger" className={styles.logoTitle} />
        <span className={styles.headerText}>Messenger</span>
      </div>

      <div className={styles.body}>
        <div className={styles.logoContainer}>
          <img src={msnLogo} alt="MSN Messenger" className={styles.logo} />
        </div>

        <div className={styles.statusContainer}>
          <label htmlFor="status-select" className={styles.statusLabel}>Status:</label>
          <select
            id="status-select"
            className={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="online">Online</option>
            <option value="busy">Ocupado</option>
            <option value="away">Ausente</option>
            <option value="brb">Já volto</option>
          </select>
        </div>
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
