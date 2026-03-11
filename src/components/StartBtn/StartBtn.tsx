import { useTranslation } from 'react-i18next';
import styles from './StartBtn.module.css';
import WinLogo from '../../assets/icons/win-logo.webp';
import { useWindowStore } from '../../stores/useWindowStore';

export function StartBtn() {
    const { t } = useTranslation();
    const toggleStartMenu = useWindowStore(state => state.toggleStartMenu);
    const handleClick = () => {
        toggleStartMenu();
    };

    return (
        <button className={styles.startBtn} onClick={handleClick} data-id="start-button">
            <img
                src={WinLogo}
                className={styles.startIcon}
                alt="Windows Logo"
            />
            <span className={styles.startText}>
                {t('startMenu.start')}
            </span>
        </button>
    );
}

export default StartBtn;