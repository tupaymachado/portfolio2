import styles from './ExplorerApp.module.css';
import ExplorerToolbar from './ExplorerToobar';

export default function ExplorerApp() {
  return (
    <div className={styles.explorerContainer}>
      <ExplorerToolbar />
      
      <div className={styles.mainArea}>
        {/* Sidebar Esquerda (Tarefas) */}
        <div className={styles.sidebar}>
            <div className={styles.sidebarBox}>
                <div className={styles.sidebarHeader}>Tarefas de Arquivo</div>
                <div className={styles.sidebarContent}>Fazer nova pasta</div>
            </div>
        </div>

        {/* Área de Conteúdo (Ícones) */}
        <div className={styles.contentView}>
            {/* Aqui faremos o map() dos arquivos, igual ao Desktop! */}
            <p style={{padding: 20}}>Conteúdo da pasta aqui...</p>
        </div>
      </div>
    </div>
  );
}