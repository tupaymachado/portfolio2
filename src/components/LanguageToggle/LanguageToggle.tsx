import { useTranslation } from 'react-i18next';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
    const { i18n } = useTranslation();
    const isPT = i18n.language.startsWith('pt');

    const toggle = () => {
        i18n.changeLanguage(isPT ? 'en' : 'pt-BR');
    };

    return (
        <button
            className={styles.toggle}
            onClick={toggle}
            title={isPT ? 'Switch to English' : 'Mudar para Português'}
        >
            <span className={isPT ? styles.active : styles.inactive}>PT</span>
            <span className={styles.sep}>|</span>
            <span className={!isPT ? styles.active : styles.inactive}>EN</span>
        </button>
    );
}
