import styles from './Desktop.module.css';
import { useMemo, useState, useRef } from 'react';
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
  const closeContextMenu = useWindowStore(state => state.closeContextMenu);
  const closeStartMenu = useWindowStore(state => state.closeStartMenu);

  const allItems = useFileSystemStore(state => state.items);
  const updateItemGridPosition = useFileSystemStore(state => state.updateItemGridPosition);

  const desktopItems = useMemo(() => {
    return Object.values(allItems).filter(item => item.parentId === 'desktop');
  }, [allItems]);

  // --- DRAG AND DROP STATE ---
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggingItemIdRef = useRef<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, itemId: string, currentLeft: number, currentTop: number) => {
    e.stopPropagation();
    closeStartMenu();

    if (e.button !== 0) return;

    if (draggingItemIdRef.current !== null) return;

    draggingItemIdRef.current = itemId;
    setDraggingItemId(itemId);

    const offsetX = e.clientX - currentLeft;
    const offsetY = e.clientY - currentTop;
    dragOffsetRef.current = { x: offsetX, y: offsetY };
    setDragPosition({ x: currentLeft, y: currentTop });

    const handleMouseMove = (ev: MouseEvent) => {
      setDragPosition({
        x: ev.clientX - dragOffsetRef.current.x,
        y: ev.clientY - dragOffsetRef.current.y,
      });
    };

    const handleMouseUp = (ev: MouseEvent) => {
      if (draggingItemIdRef.current) {
        const finalX = ev.clientX - dragOffsetRef.current.x;
        const finalY = ev.clientY - dragOffsetRef.current.y;

        let col = Math.round(finalX / GRID_CELL_WIDTH);
        let row = Math.round(finalY / GRID_CELL_HEIGHT);

        if (col < 0) col = 0;
        if (row < 0) row = 0;

        const maxRows = Math.floor(window.innerHeight / GRID_CELL_HEIGHT);
        updateItemGridPosition(draggingItemIdRef.current, { row, col }, maxRows);
      }

      draggingItemIdRef.current = null;
      setDraggingItemId(null);
      setDragPosition(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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
        let onClick = () => closeContextMenu();
        let onDoubleClick = () => { };

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

        const isDragging = draggingItemId === item.id;

        // Calculate position: if dragging, use dragPosition, else use gridPosition
        let top = item.gridPosition.row * GRID_CELL_HEIGHT;
        let left = item.gridPosition.col * GRID_CELL_WIDTH;

        if (isDragging && dragPosition) {
          top = dragPosition.y;
          left = dragPosition.x;
        }

        const style = {
          top: `${top}px`,
          left: `${left}px`,
          zIndex: isDragging ? 1000 : 1, // Bring to front when dragging
        };

        return (
          <div
            key={item.id}
            className={styles.iconContainer}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, item.id, item.gridPosition!.col * GRID_CELL_WIDTH, item.gridPosition!.row * GRID_CELL_HEIGHT)}
          >
            <DesktopIcon
              label={item.name}
              iconUrl={iconUrl}
              onClick={onClick}
              onDoubleClick={onDoubleClick}
            />
          </div>
        );
      })}
    </main>
  );
}