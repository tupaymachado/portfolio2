import styles from './ErrorDialog.module.css';
import windowStyles from '../Window/Window.module.css';
import closeIcon from '../../assets/icons/close.webp';

// Use um fallback caso não haja ícone de erro na pasta (o padrão app.webp serve)
import errorIcon from '../../assets/icons/app.webp';

interface ErrorDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
    // Opcional caso no futuro o usuário queira passar um ícone customizado de erro
    iconUrl?: string;
}

export default function ErrorDialog({ isOpen, title, message, onClose, iconUrl = errorIcon }: ErrorDialogProps) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialogWindow}>
                {/* Usamos a classe da TitleBar original para ter exatamente a mesma renderização de cores do XP */}
                <header className={`${windowStyles.titleBar} ${windowStyles.active}`}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Opcional: Se quiser, podemos colocar o ícone na barra de título também */}
                        <span className={windowStyles.title}>{title}</span>
                    </div>
                    <div className={windowStyles.windowControls}>
                        <button className={`${windowStyles.windowButton} ${windowStyles.closeButton}`} onClick={onClose}>
                            <img src={closeIcon} alt="Close Button" />
                        </button>
                    </div>
                </header>

                <div className={styles.dialogBody}>
                    <div className={styles.contentRow}>
                        <img src={iconUrl} alt="Error Icon" className={styles.icon} />
                        <div className={styles.message}>
                            {message}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.okButton} onClick={onClose}>
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
