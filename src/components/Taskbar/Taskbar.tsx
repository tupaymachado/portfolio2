import styles from './Taskbar.module.css';
import StartBtn from '../StartBtn/StartBtn.tsx';
import SystemTray from '../SystemTray/SystemTray.tsx';
import TaskbarButton from '../TaskbarButton/TaskbarButton';
import type { WindowInstance } from '../../types/window.ts';
import { PROGRAMS } from '../../data/programs.tsx'

interface TaskbarProps {
  openWindows: WindowInstance[];
  onTaskbarButtonClick: (id: number) => void;
  activeWindowId: number | null;
  onDeselectAllWindows: () => void;
}

const Taskbar = ({ openWindows, onTaskbarButtonClick, activeWindowId, onDeselectAllWindows }: TaskbarProps) => {
  return (
    <footer className={styles.taskbar} onMouseDown={onDeselectAllWindows}>
      <StartBtn />
      <div className={styles.taskbarPrograms}>
        {openWindows.map(win => {
          
          // 3. FAÇA A BUSCA (LOOKUP)
          const program = PROGRAMS.find(p => p.id === win.programId);

          // Medida de segurança: se a janela aponta para um programa inválido, não renderize seu botão.
          if (!program) {
            return null;
          }

          // 4. USE O 'program.name' EM VEZ DE 'win.title'
          return (
            <TaskbarButton
              key={win.id}
              title={program.name} // <-- A CORREÇÃO PRINCIPAL
              iconUrl={program.iconUrl} // <-- BÔNUS: agora você também pode passar o ícone!
              onClick={() => onTaskbarButtonClick(win.id)}
              isActive={win.id === activeWindowId && win.displayState !== 'minimized'}
            />
          );
        })}
      </div>
      <SystemTray />
    </footer>
  );
};

export default Taskbar