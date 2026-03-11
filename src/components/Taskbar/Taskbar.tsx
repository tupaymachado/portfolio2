import { useTranslation } from 'react-i18next';
import styles from './Taskbar.module.css';
import StartBtn from '../StartBtn/StartBtn';
import SystemTray from '../SystemTray/SystemTray';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import TaskbarButton from '../TaskbarButton/TaskbarButton';
import { useWindowStore } from '../../stores/useWindowStore';
import { PROGRAMS_MAP } from '../../data/programs';
import StartMenu from '../StartMenu/StartMenu';
import type { MenuItem } from '../../stores/useWindowStore';
import { useShallow } from 'zustand/shallow';

export default function Taskbar() {
  const { t } = useTranslation();
  const openContextMenu = useWindowStore(state => state.openContextMenu);
  // useShallow: evita re-render quando outras janelas mudam internamente
  const openWindows = useWindowStore(useShallow(state => state.openWindows));
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const handleTaskbarClick = useWindowStore(state => state.handleTaskbarClick);
  const closeWindow = useWindowStore(state => state.closeWindow);
  const openWindow = useWindowStore(state => state.openWindow);
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);

  const handleTaskbarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Importante: impede que suba para outros elementos se houver

    const items: MenuItem[] = [
      {
        label: t('taskbar.contextMenu.taskManager'),
        disabled: true,
        onClick: () => { }
      },
      {
        label: t('taskbar.contextMenu.lockTaskbar'),
        onClick: () => openWindow('error', { context: { title: t('taskbar.contextMenu.lockTaskbar'), message: 'O bloqueio da barra de tarefas não é suportado nesta versão.' } })
      },
      {
        label: t('taskbar.contextMenu.properties'),
        onClick: () => openWindow('error', { context: { title: t('taskbar.contextMenu.properties'), message: 'Configurações de propriedades da barra de tarefas ainda não estão disponíveis.' } })
      }
    ];

    openContextMenu(e.clientX, e.clientY, items);
  };

  return (
    <footer
      className={styles.taskbar}
      onMouseDown={deselectAllWindows}
      onContextMenu={handleTaskbarContextMenu}
    >
      <StartBtn />
      <StartMenu />
      <div className={styles.taskbarPrograms}>
        {openWindows.map(win => {
          const program = PROGRAMS_MAP.get(win.programId);
          if (!program) return null;

          return (
            <TaskbarButton
              key={win.id}
              title={win.title || t(`programs.${win.programId}`, { defaultValue: program.name })}
              iconUrl={win.iconUrl || program.iconUrl}
              onClick={() => handleTaskbarClick(win.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContextMenu(e.clientX, e.clientY, [
                  { label: t('taskbar.contextMenu.close'), onClick: () => closeWindow(win.id) },
                ]);
              }}
              isActive={win.id === activeWindowId && !win.isMinimized}
            />
          );
        })}
      </div>
      <LanguageToggle />
      <SystemTray />
    </footer>
  );
}