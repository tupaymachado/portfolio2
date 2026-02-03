import styles from './ExplorerToolbar.module.css';
import back from '../../../assets/icons/back.webp'
import forward from '../../../assets/icons/forward.webp'
import folderViewClassic from '../../../assets/icons/folder-view-classic.webp'
import search from '../../../assets/icons/search.webp'
import up from '../../../assets/icons/up.webp'
import folderView from '../../../assets/icons/folder-view.webp'
import go from '../../../assets/icons/go.webp'
import winLogo from '../../../assets/icons/win-logo.webp'

interface ExplorerToolbarProps {
  iconUrl?: string;
  currentPath?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  canGoUp?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  onUp?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isMobile?: boolean;
}

export default function ExplorerToolbar({
  iconUrl,
  currentPath = 'C:\\',
  canGoBack = false,
  canGoForward = false,
  canGoUp = false,
  onBack,
  onForward,
  onUp,
  onToggleSidebar,
  isSidebarOpen = true,
  isMobile = false
}: ExplorerToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.rowStandard}>
        {/* Menus de Texto (Arquivo, Editar...) - Estáticos por enquanto */}
        {/* Esconde menu de texto no mobile para economizar espaço */}

        <div>
          <span>Arquivo</span>
          <span>Exibir</span>
          <span>Favoritos</span>
          <span>Ferramentas</span>
          <span>Ajuda</span>
        </div>

        <div className={styles.winLogoContainer}>
          <img src={winLogo} alt="Windows" />
        </div>
      </div>

      <div className={styles.rowButtons}>
        {/* Botões de Navegação - Placeholders Visuais */}
        <button className={styles.toolBtn} onClick={onBack} disabled={!canGoBack}>
          <img src={back} alt="Voltar" />
          <span>Voltar</span>
          <svg viewBox="0 0 320 512" width="8" height="8" fill="currentColor">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>
          </svg>
        </button>
        <button className={styles.toolBtn} onClick={onForward} disabled={!canGoForward}>
          <img src={forward} alt="Avançar" />
          {/* Seta removida no mobile para economizar espaço se necessário, mas mantida por fidelidade desktop */}
          <svg viewBox="0 0 320 512" width="8" height="8" fill="currentColor">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>
          </svg>
        </button>
        <button className={styles.toolBtn} onClick={onUp} disabled={!canGoUp}>
          <img src={up} alt="Acima" />
        </button>
        <div className={styles.separator}></div>
        <button className={styles.toolBtn}>
          <img src={search} alt="Pesquisar" />
          <span>Pesquisar</span>
        </button>

        {/* BOTÃO TOGGLE SIDEBAR (Apenas Mobile) */}
        {isMobile && (
          <button
            className={`${styles.toolBtn} ${isSidebarOpen ? styles.active : ''}`}
            onClick={onToggleSidebar}
            title="Mostrar/Esconder Painel Lateral"
          >
            <img src={go} alt="Painel" />
            <span>{isSidebarOpen ? 'Fechar Painel' : 'Painel'}</span>
          </button>
        )}

        <div className={styles.separator}></div>
        <button className={styles.toolBtn}>
          <img src={folderViewClassic} alt="folder-view-classic" />
          <svg viewBox="0 0 320 512" width="8" height="8" fill="currentColor">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>
          </svg>
        </button>
      </div>

      <div className={styles.rowAddress}>
        <span>Endereço</span>
        <div className={styles.addressInputWrapper}>
          <img src={iconUrl || folderView} alt="Pastas" />
          <input type="text" value={currentPath} readOnly className={styles.addressInput} />
        </div>
        <button className={styles.goBtn}>
          <img src={go} alt="Ir" />
        </button>
      </div>
    </div>
  );
}