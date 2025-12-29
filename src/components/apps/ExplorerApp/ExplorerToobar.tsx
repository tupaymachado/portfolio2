import styles from './ExplorerToolbar.module.css';
import back from '../../../assets/icons/back.png'
import forward from '../../../assets/icons/forward.png'
import folderViewClassic from '../../../assets/icons/folder-view-classic.png'
import search from '../../../assets/icons/search.png'
import up from '../../../assets/icons/up.png'
import folderView from '../../../assets/icons/folder-view.png'
import go from '../../../assets/icons/go.png'
import winLogo from '../../../assets/icons/win-logo.png'

export default function ExplorerToolbar() {
  return (
    <div className={styles.toolbar}>
      <div className={styles.rowStandard}>
        {/* Menus de Texto (Arquivo, Editar...) - Estáticos por enquanto */}
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
        <button className={styles.toolBtn}>
          <img src={back} alt="Voltar" />
          <span>Voltar</span>
          <svg viewBox="0 0 320 512" width="8" height="8" fill="currentColor">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>
          </svg>
        </button>
        <button className={styles.toolBtn}>
          <img src={forward} alt="Avançar" />
          <svg viewBox="0 0 320 512" width="8" height="8" fill="currentColor">
            <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>
          </svg>
        </button>
        <button className={styles.toolBtn}>
          <img src={up} alt="Acima" />
        </button>
        <div className={styles.separator}></div>
        <button className={styles.toolBtn}>
          <img src={search} alt="Pesquisar" />
          <span>Pesquisar</span>
        </button>
        <button className={styles.toolBtn}>
          <img src={folderView} alt="Pastas" />
          <span>Pastas</span>
        </button>
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
          {/* Ícone de pasta aqui */}
          <input type="text" value="C:\" readOnly className={styles.addressInput} />
        </div>
        <button className={styles.goBtn}>
          <img src={go} alt="Ir" />
        </button>
      </div>
    </div>
  );
}