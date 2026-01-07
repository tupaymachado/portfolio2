import styles from './Window.module.css';
import { useEffect, useRef, useState } from 'react';
import minimize from '../../assets/icons/minimize.png';
import maximize from '../../assets/icons/maximize.png';
import restore from '../../assets/icons/restore.png';
import close from '../../assets/icons/close.png';
import { useWindowStore } from '../../stores/useWindowStore';
import { PROGRAMS } from '../../data/programs';
import type { ResizeHandle } from '../../types/window';

interface WindowProps {
  instanceId: number;
  programId: string;
}

export default function Window({ instanceId, programId }: WindowProps) {
  // --- SELEÇÃO DE DADOS E AÇÕES DO STORE ---
  const {
    closeWindow,
    updateWindowPosition,
    bringToFront,
    toggleMaximize,
    updateWindowSize,
    minimizeWindow
  } = useWindowStore();

  const instance = useWindowStore(state => state.openWindows.find(w => w.id === instanceId));
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const program = PROGRAMS.find(p => p.id === programId);

  // --- ESTADO DE DRAG E RESIZE ---
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartData = useRef<{
    handle: ResizeHandle;
    initialSize: { width: number; height: number };
    initialPosition: { x: number; y: number };
    initialMousePos: { x: number; y: number };
  } | null>(null);

  // Se a instância ou programa não forem encontrados, não renderize nada
  if (!instance || !program) {
    return null;
  }

  const { isResizable, minSize } = program;
  const MIN_WIDTH = minSize?.width || 150;
  const MIN_HEIGHT = minSize?.height || 100;

  // --- FUNÇÕES AUXILIARES ---
  const getEventPosition = (e: MouseEvent | TouchEvent): { x: number; y: number } => {
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  // --- DRAG HANDLERS (Mouse + Touch) ---
  const startDrag = (clientX: number, clientY: number) => {
    if (instance.isMaximized) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: clientX - instance.position.x,
      y: clientY - instance.position.y
    };
  };

  const onMouseDown_Drag = (e: React.MouseEvent<HTMLElement>) => {
    startDrag(e.clientX, e.clientY);
  };

  const onTouchStart_Drag = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  // --- RESIZE HANDLERS ---
  const onMouseDown_Resize = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
    setIsResizing(true);
    resizeStartData.current = {
      handle,
      initialSize: instance.size,
      initialPosition: instance.position,
      initialMousePos: { x: e.clientX, y: e.clientY },
    };
  };

  // --- FOCUS HANDLER ---
  const handleFocusAndStopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    bringToFront(instanceId);
    e.stopPropagation();
  };

  // --- GLOBAL EVENT LISTENERS ---
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const pos = getEventPosition(e);

      if (isResizing && resizeStartData.current) {
        const { handle, initialSize, initialPosition, initialMousePos } = resizeStartData.current;
        const dx = pos.x - initialMousePos.x;
        const dy = pos.y - initialMousePos.y;
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newLeft = initialPosition.x;
        let newTop = initialPosition.y;

        if (handle.includes('e')) newWidth = initialSize.width + dx;
        if (handle.includes('w')) newWidth = initialSize.width - dx;
        if (handle.includes('s')) newHeight = initialSize.height + dy;
        if (handle.includes('n')) newHeight = initialSize.height - dy;

        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
        if (handle.includes('w')) newLeft = initialPosition.x + (initialSize.width - newWidth);
        if (handle.includes('n')) newTop = initialPosition.y + (initialSize.height - newHeight);

        updateWindowSize(instanceId, { width: newWidth, height: newHeight });
        updateWindowPosition(instanceId, { x: newLeft, y: newTop });
      } else if (isDragging) {
        updateWindowPosition(instanceId, {
          x: pos.x - dragOffsetRef.current.x,
          y: pos.y - dragOffsetRef.current.y
        });
      }

      // Prevent scrolling on touch devices while dragging
      if ('touches' in e) {
        e.preventDefault();
      }
    };

    const onEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    // Mouse events
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    // Touch events
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [isDragging, isResizing, instanceId, updateWindowPosition, updateWindowSize, MIN_WIDTH, MIN_HEIGHT]);

  // --- RENDERIZAÇÃO ---
  const isActive = instance.id === activeWindowId;
  const maximizeIcon = instance.isMaximized ? restore : maximize;

  return (
    <div
      className={`${styles.window} ${isActive ? styles.active : ''} ${instance.isMaximized ? styles.maximized : ''}`}
      style={{
        top: instance.position.y,
        left: instance.position.x,
        width: instance.size.width,
        height: instance.size.height,
        zIndex: instance.zIndex,
        display: instance.isMinimized ? 'none' : 'block'
      }}
      onMouseDown={handleFocusAndStopPropagation}
      onTouchStart={handleFocusAndStopPropagation}
    >
      <header
        className={`${styles.titleBar} ${isActive ? styles.active : ''}`}
        style={{ cursor: isDragging ? 'move' : 'default' }}
        onMouseDown={onMouseDown_Drag}
        onTouchStart={onTouchStart_Drag}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img className={styles.icon} src={program.iconUrl} alt={`${program.name} icon`} />
          <span className={styles.title}>{program.name}</span>
        </div>
        <div className={styles.windowControls}>
          <button className={styles.windowButton} onClick={() => minimizeWindow(instanceId)}>
            <img src={minimize} alt="Minimize Button" />
          </button>
          {isResizable !== false && (
            <button className={styles.windowButton} onClick={() => toggleMaximize(instanceId)}>
              <img src={maximizeIcon} alt="Maximize/Restore Button" />
            </button>
          )}
          <button className={`${styles.windowButton} ${styles.closeButton}`} onClick={() => closeWindow(instanceId)}>
            <img src={close} alt="Close Button" />
          </button>
        </div>
      </header>
      <div className={`${styles.windowBody} ${isActive ? styles.active : ''}`}>
        {program.component}
      </div>
      {isResizable !== false && !instance.isMaximized && (
        <>
          <div className={`${styles.resizeHandle} ${styles.n}`} onMouseDown={(e) => onMouseDown_Resize(e, 'n')}></div>
          <div className={`${styles.resizeHandle} ${styles.ne}`} onMouseDown={(e) => onMouseDown_Resize(e, 'ne')}></div>
          <div className={`${styles.resizeHandle} ${styles.e}`} onMouseDown={(e) => onMouseDown_Resize(e, 'e')}></div>
          <div className={`${styles.resizeHandle} ${styles.se}`} onMouseDown={(e) => onMouseDown_Resize(e, 'se')}></div>
          <div className={`${styles.resizeHandle} ${styles.s}`} onMouseDown={(e) => onMouseDown_Resize(e, 's')}></div>
          <div className={`${styles.resizeHandle} ${styles.sw}`} onMouseDown={(e) => onMouseDown_Resize(e, 'sw')}></div>
          <div className={`${styles.resizeHandle} ${styles.w}`} onMouseDown={(e) => onMouseDown_Resize(e, 'w')}></div>
          <div className={`${styles.resizeHandle} ${styles.nw}`} onMouseDown={(e) => onMouseDown_Resize(e, 'nw')}></div>
        </>
      )}
    </div>
  );
}