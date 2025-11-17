import styles from './Desktop.module.css';
import { useState } from 'react';
import blissWallpaper from '../../assets/bgs/bliss-normal.jpg';
import DesktopIcon from '../DesktopIcon/DesktopIcon';
import type { DesktopShortcut } from '../../types/desktopShortcut';
import { PROGRAMS } from '../../data/programs';
import { useWindowStore } from '../../stores/useWindowStore'; // <-- Mágica aqui

export default function Desktop() {
  // Pega apenas a ação 'openWindow' do store. Sem props!
  const openWindow = useWindowStore(state => state.openWindow);
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);

  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>([
    { id: 'shortcut-1', programId: 'about-me', gridPosition: { row: 0, col: 0 } },
    { id: 'shortcut-2', programId: 'my-projects', gridPosition: { row: 1, col: 0 } },
    { id: 'shortcut-3', programId: 'notepad', gridPosition: { row: 0, col: 1 } },
  ]);

  return (
    // Lembre-se de parar a propagação para a deseleção
    <main
      className={styles.desktop}
      style={{ backgroundImage: `url(${blissWallpaper})` }}
      onMouseDown={deselectAllWindows}
    >
      {shortcuts.map(shortcut => {
        const program = PROGRAMS.find(p => p.id === shortcut.programId);
        if (!program) return null;

        const style = {
          top: `${shortcut.gridPosition.row * 100}px`,
          left: `${shortcut.gridPosition.col * 90}px`,
        };

        return (
          <div key={shortcut.id} className={styles.iconContainer} style={style}>
            <DesktopIcon
              label={program.name}
              iconUrl={program.iconUrl}
              // Chama a ação do store diretamente
              onDoubleClick={() => openWindow(program.id)}
            />
          </div>
        );
      })}
    </main>
  );
}