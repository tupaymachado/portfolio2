import styles from './Desktop.module.css';
// Adicione o useMemo aqui
import { useMemo } from 'react'; 
import blissWallpaper from '../../assets/bgs/bliss-normal.jpg';
import DesktopIcon from '../DesktopIcon/DesktopIcon';
import { PROGRAMS } from '../../data/programs';
import { useWindowStore } from '../../stores/useWindowStore';
import { useFileSystemStore } from '../../stores/useFileSystemStore';
import type { MenuItem } from '../../stores/useWindowStore';

const GRID_CELL_WIDTH = 90;
const GRID_CELL_HEIGHT = 100;

export default function Desktop() {
  const openWindow = useWindowStore(state => state.openWindow);
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);
  const openContextMenu = useWindowStore(state => state.openContextMenu);
  
  // 1. Selecione TODOS os itens do store (isso é barato e estável)
  const allItems = useFileSystemStore(state => state.items);

  // 2. Filtre localmente usando useMemo
  // Isso só vai rodar de novo se 'allItems' mudar de verdade.
  const desktopItems = useMemo(() => {
    return Object.values(allItems).filter(item => item.parentId === 'desktop');
  }, [allItems]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const items: MenuItem[] = [
      {
        label: 'Atualizar',
        onClick: () => window.location.reload() 
      },
      {
        label: 'Novo',
        disabled: true, 
        onClick: () => console.log('Criar novo...')
      },
      {
        label: 'Propriedades',
        onClick: () => alert('Propriedades de Vídeo em breve!')
      },
    ];
    openContextMenu(e.clientX, e.clientY, items);
  };

  return (
    <main
      className={styles.desktop}
      style={{ backgroundImage: `url(${blissWallpaper})` }}
      onMouseDown={deselectAllWindows}
      onContextMenu={handleContextMenu}
    >
      {desktopItems.map(item => {
        
        let iconUrl = ''; 
        let onDoubleClick = () => {};

        if (item.type === 'file' && item.programId) {
           const program = PROGRAMS.find(p => p.id === item.programId);
           
           if (program) {
             iconUrl = program.iconUrl;
             onDoubleClick = () => openWindow(program.id);
           } else {
             iconUrl = '/icons/unknown-file.png'; 
           }
        } 

        if (!item.gridPosition) return null;

        const style = {
          top: `${item.gridPosition.row * GRID_CELL_HEIGHT}px`,
          left: `${item.gridPosition.col * GRID_CELL_WIDTH}px`,
        };

        return (
          <div 
            key={item.id} 
            className={styles.iconContainer} 
            style={style}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <DesktopIcon
              label={item.name} 
              iconUrl={iconUrl}
              onDoubleClick={onDoubleClick}
            />
          </div>
        );
      })}
    </main>
  );
}