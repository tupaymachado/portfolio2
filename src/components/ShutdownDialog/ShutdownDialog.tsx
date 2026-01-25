import { useEffect, useRef } from 'react';
import styles from './ShutdownDialog.module.css';
import { useWindowStore } from '../../stores/useWindowStore';
import standbyIcon from '../../assets/icons/stand-by.webp';
import powerIcon from '../../assets/icons/power.webp';
import restartIcon from '../../assets/icons/restart.webp';
import winLogo from '../../assets/icons/win-logo.webp';

export default function ShutdownDialog() {
    const { isShutdownDialogOpen, closeShutdownDialog } = useWindowStore();
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isShutdownDialogOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                closeShutdownDialog();
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeShutdownDialog();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isShutdownDialogOpen, closeShutdownDialog]);

    if (!isShutdownDialogOpen) {
        return null;
    }

    const handleStandby = () => {
        // Simula stand-by - poderia escurecer a tela
        alert('Colocando o computador em espera...');
        closeShutdownDialog();
    };

    const handlePowerOff = () => {
        // Simula desligamento - poderia mostrar tela de "shutting down"
        document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(to bottom, #1c5da8, #0d3c79);
        color: white;
        font-family: 'Tahoma', sans-serif;
        font-size: 24px;
      ">
        <p>O Windows está sendo desligado...</p>
      </div>
    `;
    };

    const handleRestart = () => {
        // Simula reinicialização
        window.location.reload();
    };

    return (
        <>
            {/* Overlay escuro */}
            <div className={styles.overlay} />

            {/* Dialog */}
            <div className={styles.dialog} ref={dialogRef}>
                <header className={styles.header}>
                    <span className={styles.title}>Desligar o computador</span>
                    <img src={winLogo} alt="Windows Logo" className={styles.winLogo} />
                </header>
                <div className={styles.border}></div>

                <main className={styles.content}>
                    <div className={styles.options}>
                        <button className={styles.optionButton} onClick={handleStandby}>
                            <img src={standbyIcon} alt="Em Espera" />
                            <span>Em Espera</span>
                        </button>

                        <button className={styles.optionButton} onClick={handlePowerOff}>
                            <img src={powerIcon} alt="Desligar" />
                            <span>Desligar</span>
                        </button>

                        <button className={styles.optionButton} onClick={handleRestart}>
                            <img src={restartIcon} alt="Reiniciar" />
                            <span>Reiniciar</span>
                        </button>
                    </div>
                </main>

                <footer className={styles.footer}>
                    <button className={styles.cancelButton} onClick={closeShutdownDialog}>
                        Cancelar
                    </button>
                </footer>
            </div>
        </>
    );
}
