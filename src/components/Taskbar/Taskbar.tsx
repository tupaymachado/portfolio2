import styles from './Taskbar.module.css';
import StartBtn from '../StartBtn/StartBtn';
import SystemTray from '../SystemTray/SystemTray';
import TaskbarButton from '../TaskbarButton/TaskbarButton';
import { useWindowStore } from '../../stores/useWindowStore'; // <-- Mágica aqui
import { PROGRAMS } from '../../data/programs';
import StartMenu from '../StartMenu/StartMenu';

export default function Taskbar() {
  // Seleciona todos os dados e ações de que a Taskbar precisa, diretamente do store
  const openWindows = useWindowStore(state => state.openWindows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const handleTaskbarClick = useWindowStore(state => state.handleTaskbarClick);
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);
  
  return (
    <footer
      className={styles.taskbar}
      onMouseDown={deselectAllWindows} // Para a propagação
    >
      <StartBtn />
      <StartMenu />
      <div className={styles.taskbarPrograms}>
        {openWindows.map(win => {
          const program = PROGRAMS.find(p => p.id === win.programId);
          if (!program) return null;

          return (
            <TaskbarButton
              key={win.id}
              title={program.name}
              iconUrl={program.iconUrl}
              onClick={() => handleTaskbarClick(win.id)}
              isActive={win.id === activeWindowId && win.displayState !== 'minimized'}
            />
          );
        })}
      </div>
      <SystemTray />
    </footer>
  );
}