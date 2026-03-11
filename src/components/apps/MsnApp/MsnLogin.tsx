import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../../config/firebase';
import styles from './MsnLogin.module.css';
import msnLogo from '../../../assets/icons/msn-messenger.webp';
import msnLogoTitle from '../../../assets/icons/msn-logo-title.webp'
import AppMenuBar from '../../AppMenuBar/AppMenuBar'

// Interface for props
interface MsnLoginProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export default function MsnLogin({ status, onStatusChange }: MsnLoginProps) {
  const { t } = useTranslation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('msn.error');
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
            label: t('msn.menu.file'),
            onClick: () => { },
          },
          {
            label: t('msn.menu.edit'),
            onClick: () => { },
          },
          {
            label: t('msn.menu.help'),
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
          <label htmlFor="status-select" className={styles.statusLabel}>{t('msn.login.statusLabel')}</label>
          <select
            id="status-select"
            className={styles.statusSelect}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="online">{t('msn.login.statusOnline')}</option>
            <option value="busy">{t('msn.login.statusBusy')}</option>
            <option value="away">{t('msn.login.statusAway')}</option>
            <option value="brb">{t('msn.login.statusBrb')}</option>
          </select>
        </div>
        <h2 className={styles.title}>{t('msn.login.title')}</h2>
        <p className={styles.subtitle}>{t('msn.login.subtitle')}</p>

        <button
          className={styles.signInButton}
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
        >
          {isSigningIn ? t('msn.login.signingIn') : t('msn.login.signInButton')}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.footer}>
        <span>{t('msn.login.footer')}</span>
      </div>
    </div>
  );
}
