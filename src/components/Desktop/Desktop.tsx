import { useState } from 'react';
import styles from './Desktop.module.css';
import blissWallpaper from '../../assets/bgs/bliss-normal.jpg';
import DesktopIcon from '../DesktopIcon/DesktopIcon';
import type { DesktopShortcut } from '../../types/desktopShortcut';
import { PROGRAMS } from '../../data/programs'

const GRID_CELL_WIDTH = 90; // em pixels
const GRID_CELL_HEIGHT = 100; // em pixels

// Interface para as props que o Desktop recebe (a função para abrir uma janela)
interface DesktopProps {
  onOpenWindow: (programId: string) => void;
  onDeselectAllWindows: () => void;
}

export function Desktop({ onOpenWindow, onDeselectAllWindows }: DesktopProps) {
  const [shortcuts, setShortcuts] = useState<DesktopShortcut[]>([
    { id: 'shortcut-1', programId: 'about-me', gridPosition: { row: 0, col: 0 } },
    { id: 'shortcut-2', programId: 'my-projects', gridPosition: { row: 1, col: 0 } },
    { id: 'shortcut-3', programId: 'notepad', gridPosition: { row: 0, col: 1 } },
  ]);

  return (
    // Usamos 'relative' para que os ícones com 'absolute' se posicionem dentro dele
    <main className={styles.desktop}
      style={{ backgroundImage: `url(${blissWallpaper})` }}
      onMouseDown={onDeselectAllWindows}
    >

      {/* 3. A MÁGICA DO .MAP() */}
      {/* Mapeamos o array de *atalhos*, não o de programas. */}
      {shortcuts.map(shortcut => {

        // 4. BUSCA DE DADOS (LOOKUP)
        // Para cada atalho, encontramos a definição completa do programa correspondente
        // na nossa "base de dados" PROGRAMS.
        const program = PROGRAMS.find(p => p.id === shortcut.programId);

        // Medida de segurança: se o atalho apontar para um programa que não existe, não renderize nada.
        if (!program) {
          return null;
        }

        // 5. CÁLCULO DA POSIÇÃO CSS A PARTIR DO GRID
        const style = {
          top: `${shortcut.gridPosition.row * GRID_CELL_HEIGHT}px`,
          left: `${shortcut.gridPosition.col * GRID_CELL_WIDTH}px`,
        };

        // 6. RENDERIZAÇÃO DO ÍCONE
        // Retornamos um componente DesktopIcon para cada atalho.
        return (
          <div key={shortcut.id} className={styles.iconContainer}
            style={style}
          >
            <DesktopIcon
              label={program.name}
              iconUrl={program.iconUrl}
              // O callback passa o ID do *programa* a ser aberto.
              onDoubleClick={() => onOpenWindow(program.id)}
            />
          </div>
        );
      })}
    </main>
  );
};

export default Desktop;