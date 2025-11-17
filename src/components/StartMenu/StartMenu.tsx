import { useEffect, useRef } from 'react';
import styles from './StartMenu.module.css';
import { useWindowStore } from '../../stores/useWindowStore';
import { PROGRAMS } from '../../data/programs';

export default function StartMenu() {
  // Seleciona os dados e ações do store
  const { isStartMenuOpen, toggleStartMenu, openWindow } = useWindowStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Lógica para "clicar fora para fechar"
  useEffect(() => {
    if (!isStartMenuOpen) return; // Só execute se o menu estiver aberto

    function handleClickOutside(event: MouseEvent) {
      const clickedStartButton = (event.target as HTMLElement).closest('[data-id="start-button"]');

      // A lógica principal permanece a mesma
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !clickedStartButton) {
          toggleStartMenu();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartMenuOpen, toggleStartMenu]);

  if (!isStartMenuOpen) {
    return null;
  }

  return (
    <div className={styles.startMenu} ref={menuRef}>
      <header className={styles.header}>
        {/* Adicione sua foto de perfil aqui */}
        <div className={styles.profilePic}></div> 
        <span className={styles.username}>Tupay</span>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.programList}>
          {PROGRAMS.map(program => (
            <button key={program.id} className={styles.menuItem} onClick={() => openWindow(program.id)}>
              <img src={program.iconUrl} alt={program.name} className={styles.menuItemIcon} />
              <span className={styles.menuItemName}>{program.name}</span>
            </button>
          ))}
        </div>
        <div className={styles.systemList}>
          {/* Adicione links estáticos aqui */}
        </div>
      </main>
      <footer className={styles.footer}>
        {/* Botões de Desligar/Logoff */}
      </footer>
    </div>
  );
}