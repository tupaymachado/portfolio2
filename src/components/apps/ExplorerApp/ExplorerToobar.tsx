import styles from './ExplorerToolbar.module.css';

export default function ExplorerToolbar() {
  return (
    <div className={styles.toolbar}>
      <div className={styles.rowStandard}>
        {/* Menus de Texto (Arquivo, Editar...) - Estáticos por enquanto */}
        <span>Arquivo</span>
        <span>Editar</span>
        <span>Exibir</span>
        <span>Favoritos</span>
        <span>Ferramentas</span>
        <span>Ajuda</span>
      </div>
      
      <div className={styles.rowButtons}>
        {/* Botões de Navegação - Placeholders Visuais */}
        <button className={styles.toolBtn}> {'<-'} Voltar</button>
        <button className={styles.toolBtn}> {'->'} </button>
        <div className={styles.separator}></div>
        <button className={styles.toolBtn}> Acima </button>
        <div className={styles.separator}></div>
        <button className={styles.toolBtn}> Pesquisar </button>
        <button className={styles.toolBtn}> Pastas </button>
      </div>
      
      <div className={styles.rowAddress}>
        <span>Endereço</span>
        <div className={styles.addressInputWrapper}>
           {/* Ícone de pasta aqui */}
           <input type="text" value="C:\" readOnly className={styles.addressInput} />
        </div>
        <button className={styles.goBtn}>Ir</button>
      </div>
    </div>
  );
}