import styles from './StartBtn.module.css';
import WinLogo from '../../assets/icons/win-logo.png';

export function StartBtn() {
    return (
        <button className={styles.startBtn}>
            <img src={WinLogo} alt="Windows Logo" className={styles.startIcon} />
            <span className={styles.startText}>Iniciar</span>
        </button>
    );
}

export default StartBtn;