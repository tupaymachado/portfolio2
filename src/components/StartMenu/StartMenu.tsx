import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './StartMenu.module.css';
import { useWindowStore } from '../../stores/useWindowStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { useUserStore } from '../../stores/useUserStore';
import { PROGRAMS, SYSTEM_LINKS } from '../../data/programs';
import power from '../../assets/icons/power.webp';
import logout from '../../assets/icons/logout.webp';
import arrowRight from '../../assets/icons/arrow-right.webp';
import arrowLeft from '../../assets/icons/back.webp';

// Delays em milissegundos
const OPEN_DELAY = 300;  // Simula lentidão de HD antigo
const CLOSE_DELAY = 500; // Evita fechar sem querer

export default function StartMenu() {
  // Seletores individuais para evitar re-renders desnecessários
  const isStartMenuOpen = useWindowStore(state => state.isStartMenuOpen);
  const toggleStartMenu = useWindowStore(state => state.toggleStartMenu);
  const openWindow = useWindowStore(state => state.openWindow);
  const openShutdownDialog = useWindowStore(state => state.openShutdownDialog);
  const isMobile = useSystemStore(state => state.isMobile);
  const currentUser = useUserStore(state => state.getCurrentUser());
  const logoutUser = useUserStore(state => state.logout);

  const menuRef = useRef<HTMLDivElement>(null);

  // Estado do submenu "Todos os programas"
  const [isAllProgramsOpen, setIsAllProgramsOpen] = useState(false);

  // Refs para controlar timeouts
  const openTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  // Limpa os timeouts quando componente desmonta
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Reseta o submenu quando o Start Menu fecha
  useEffect(() => {
    if (!isStartMenuOpen) {
      setIsAllProgramsOpen(false);
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    }
  }, [isStartMenuOpen]);

  // Handlers para hover (desktop)
  const handleMouseEnterTrigger = useCallback(() => {
    if (isMobile) return;

    // Cancela timeout de fechamento se existir
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // Inicia timeout de abertura
    openTimeoutRef.current = window.setTimeout(() => {
      setIsAllProgramsOpen(true);
    }, OPEN_DELAY);
  }, [isMobile]);

  const handleMouseLeaveTrigger = useCallback(() => {
    if (isMobile) return;

    // Cancela timeout de abertura se existir
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // Inicia timeout de fechamento
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsAllProgramsOpen(false);
    }, CLOSE_DELAY);
  }, [isMobile]);

  const handleMouseEnterSubmenu = useCallback(() => {
    if (isMobile) return;

    // Cancela timeout de fechamento quando entra no submenu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [isMobile]);

  const handleMouseLeaveSubmenu = useCallback(() => {
    if (isMobile) return;

    // Inicia timeout de fechamento quando sai do submenu
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsAllProgramsOpen(false);
    }, CLOSE_DELAY);
  }, [isMobile]);

  useEffect(() => {
    if (!isStartMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const clickedStartButton = (event.target as HTMLElement).closest('[data-id="start-button"]');

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

  // Ordena os programas alfabeticamente
  const sortedPrograms = [...PROGRAMS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={styles.startMenu} ref={menuRef}>
      <header className={styles.header}>
        <div className={styles.profilePic}>
          <img src={currentUser?.avatarUrl || '/src/assets/profile/duck.webp'} alt="Profile" />
        </div>
        <span className={styles.username}>{currentUser?.name || 'Usuário'}</span>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.programList}>
          {PROGRAMS.map(program => (
            <button
              key={program.id}
              className={styles.menuItem}
              onClick={() => openWindow(program.id)}
            >
              <img src={program.iconUrl} alt={program.name} className={styles.menuItemIcon} />
              <span className={styles.menuItemName}>{program.name}</span>
            </button>
          ))}
          <div className={styles.containerAllPrograms}>
            <div className={styles.border}></div>
            <button
              className={styles.allPrograms}
              onMouseEnter={handleMouseEnterTrigger}
              onMouseLeave={handleMouseLeaveTrigger}
              onClick={() => isMobile && setIsAllProgramsOpen(true)}
            >
              Todos os programas <img src={arrowRight} alt="" />
            </button>
          </div>
        </div>
        <div className={styles.systemList}>
          {SYSTEM_LINKS.map(link => (
            <button
              key={link.id}
              className={styles.systemItem}
              onClick={() => {
                if (link.type === 'folder') {
                  openWindow('explorer', { folderId: link.targetId });
                } else {
                  openWindow(link.targetId);
                }
              }}
            >
              <img src={link.iconUrl} alt={link.name} className={styles.systemItemIcon} />
              <span className={styles.systemItemName}>{link.name}</span>
            </button>
          ))}
        </div>

        {/* Submenu "Todos os programas" */}
        {isAllProgramsOpen && (
          <div
            className={styles.allProgramsSubmenu}
            onMouseEnter={handleMouseEnterSubmenu}
            onMouseLeave={handleMouseLeaveSubmenu}
          >
            {/* Botão Voltar só aparece no mobile */}
            {isMobile && (
              <>
                <button
                  className={styles.backButton}
                  onClick={() => setIsAllProgramsOpen(false)}
                >
                  <img src={arrowLeft} alt="" /> Voltar
                </button>
                <div className={styles.submenuBorder}></div>
              </>
            )}
            <div className={styles.submenuList}>
              {sortedPrograms.map(program => (
                <button
                  key={program.id}
                  className={styles.submenuItem}
                  onClick={() => openWindow(program.id)}
                >
                  <img src={program.iconUrl} alt={program.name} className={styles.submenuItemIcon} />
                  <span>{program.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className={styles.startMenuFooter}>
        <div className={styles.powerButtons} onClick={logoutUser}>
          <img src={logout} alt="Fazer logoff" />
          <span>Fazer logoff</span>
        </div>
        <div className={styles.powerButtons} onClick={openShutdownDialog}>
          <img src={power} alt="Desligar" />
          <span>Desligar o computador</span>
        </div>
      </footer>
    </div>
  );
}
