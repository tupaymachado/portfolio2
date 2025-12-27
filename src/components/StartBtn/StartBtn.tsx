import styles from './StartBtn.module.css';
import WinLogo from '../../assets/icons/win-logo.png';
import { useWindowStore } from '../../stores/useWindowStore';

export function StartBtn() {
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
                Iniciar
            </span>
        </button>
    );
}

export default StartBtn;