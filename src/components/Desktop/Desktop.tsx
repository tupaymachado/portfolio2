import styles from './Desktop.module.css';
import { useMemo, useState, useRef, useEffect } from 'react';
import blissWallpaper from '../../assets/bgs/bliss-normal.webp';
import DesktopIcon from '../DesktopIcon/DesktopIcon';
import { PROGRAMS_MAP } from '../../data/programs';
import { useWindowStore } from '../../stores/useWindowStore';
import { useFileSystemStore } from '../../stores/useFileSystemStore';
// import { useSystemStore } from '../../stores/useSystemStore'; // TODO: usar para responsividade
import type { MenuItem } from '../../stores/useWindowStore';
import { useShallow } from 'zustand/shallow';

// Import de ícone fallback
import unknownFileIcon from '../../assets/icons/app.webp';

const GRID_CELL_WIDTH = 90;
const GRID_CELL_HEIGHT = 100;

export default function Desktop() {
  // TODO: usar para responsividade
  // const isMobile = useSystemStore(state => state.isMobile);
  // const isSmallScreen = useSystemStore(state => state.isSmallScreen);

  const openWindow = useWindowStore(state => state.openWindow);
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);
  const openContextMenu = useWindowStore(state => state.openContextMenu);
  const closeContextMenu = useWindowStore(state => state.closeContextMenu);
  const closeStartMenu = useWindowStore(state => state.closeStartMenu);

  // useShallow: evita re-render quando itens individuais mudam (comparação rasa)
  const allItems = useFileSystemStore(useShallow(state => state.items));
  const updateItemGridPosition = useFileSystemStore(state => state.updateItemGridPosition);

  const desktopItems = useMemo(() => {
    return Object.values(allItems).filter(item => item.parentId === 'desktop');
  }, [allItems]);

  // --- DRAG AND DROP STATE ---
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggingItemIdRef = useRef<string | null>(null);

  // --- UNIFIED DRAG START ---
  const startDrag = (clientX: number, clientY: number, itemId: string, currentLeft: number, currentTop: number) => {
    closeStartMenu();

    if (draggingItemIdRef.current !== null) return;

    draggingItemIdRef.current = itemId;
    setDraggingItemId(itemId);

    const offsetX = clientX - currentLeft;
    const offsetY = clientY - currentTop;
    dragOffsetRef.current = { x: offsetX, y: offsetY };
    setDragPosition({ x: currentLeft, y: currentTop });
  };

  // --- MOUSE HANDLER ---
  const handleMouseDown = (e: React.MouseEvent, itemId: string, currentLeft: number, currentTop: number) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY, itemId, currentLeft, currentTop);
  };

  // --- TOUCH HANDLER ---
  const handleTouchStart = (e: React.TouchEvent, itemId: string, currentLeft: number, currentTop: number) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY, itemId, currentLeft, currentTop);
  };

  // --- GLOBAL MOVE/END HANDLERS ---
  useEffect(() => {
    if (!draggingItemId) return;

    const getEventPosition = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0];
        return { x: touch.clientX, y: touch.clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const pos = getEventPosition(e);
      setDragPosition({
        x: pos.x - dragOffsetRef.current.x,
        y: pos.y - dragOffsetRef.current.y,
      });

      // Prevent scrolling on touch
      if ('touches' in e) {
        e.preventDefault();
      }
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (draggingItemIdRef.current) {
        const pos = getEventPosition(e);
        const finalX = pos.x - dragOffsetRef.current.x;
        const finalY = pos.y - dragOffsetRef.current.y;

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
    };

    // Mouse events
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    // Touch events
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [draggingItemId, updateItemGridPosition]);

  // --- CONTEXT MENU ---
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
          const program = PROGRAMS_MAP.get(item.programId);

          if (program) {
            iconUrl = program.iconUrl;
            onDoubleClick = () => openWindow(program.id);
          } else {
            iconUrl = unknownFileIcon;
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
          zIndex: isDragging ? 1000 : 1,
        };

        const currentLeft = item.gridPosition.col * GRID_CELL_WIDTH;
        const currentTop = item.gridPosition.row * GRID_CELL_HEIGHT;

        return (
          <div
            key={item.id}
            className={styles.iconContainer}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, item.id, currentLeft, currentTop)}
            onTouchStart={(e) => handleTouchStart(e, item.id, currentLeft, currentTop)}
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