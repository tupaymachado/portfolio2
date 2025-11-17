import styles from './Window.module.css';
import { useEffect, useRef, useState } from 'react';
import minimize from '../../assets/icons/minimize.png';
import maximize from '../../assets/icons/maximize.png';
import restore from '../../assets/icons/restore.png';
import close from '../../assets/icons/close.png';
import { useWindowStore } from '../../stores/useWindowStore';
import { PROGRAMS } from '../../data/programs';
import type { ResizeHandle } from '../../types/window';

// Interface das novas, e muito mais simples, props
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

  // --- LÓGICA DE DRAG E RESIZE (continua interna ao componente) ---
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartData = useRef<{
    handle: ResizeHandle;
    initialSize: { width: number; height: number };
    initialPosition: { x: number; y: number };
    initialMousePos: { x: number; y: number };
  } | null>(null);

  // Se a instância ou programa não forem encontrados, não renderize nada (segurança)
  if (!instance || !program) {
    return null;
  }

  const { isResizable, minSize } = program;
  const MIN_WIDTH = minSize?.width || 150;
  const MIN_HEIGHT = minSize?.height || 100;

  // --- HANDLERS DE MOUSEDOWN ---
  const onMouseDown_Drag = (e: React.MouseEvent<HTMLElement>) => { 

    // Não permita arrastar uma janela maximizada
    if (instance.displayState === 'maximized') return;    
    setIsDragging(true);
    dragOffsetRef.current = { x: e.clientX - instance.position.x, y: e.clientY - instance.position.y };
  };

  const onMouseDown_Resize = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
    setIsResizing(true);
    resizeStartData.current = {
      handle,
      initialSize: instance.size,
      initialPosition: instance.position,
      initialMousePos: { x: e.clientX, y: e.clientY },
    };
  };

  const handleFocusAndStopPropagation = (e: React.MouseEvent) => {
    bringToFront(instanceId); // Sempre tenta focar
    e.stopPropagation(); // Impede o evento de "vazar" para o Desktop/App
  }

  // --- GERENCIADOR GLOBAL DE EVENTOS (useEffect) ---
  useEffect(() => {
    const onMouseMove_Global = (e: MouseEvent) => {
      if (isResizing && resizeStartData.current) {
        const { handle, initialSize, initialPosition, initialMousePos } = resizeStartData.current;
        const dx = e.clientX - initialMousePos.x;
        const dy = e.clientY - initialMousePos.y;
        let newWidth = initialSize.width, newHeight = initialSize.height, newLeft = initialPosition.x, newTop = initialPosition.y;

        if (handle.includes('e')) newWidth = initialSize.width + dx;
        if (handle.includes('w')) newWidth = initialSize.width - dx;
        if (handle.includes('s')) newHeight = initialSize.height + dy;
        if (handle.includes('n')) newHeight = initialSize.height - dy;

        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
        if (handle.includes('w')) newLeft = initialPosition.x + (initialSize.width - newWidth);
        if (handle.includes('n')) newTop = initialPosition.y + (initialSize.height - newHeight);
        
        // Em vez de 'setState', chamamos as ações do store, mas de forma otimizada no mouseUp
        updateWindowSize(instanceId, { width: newWidth, height: newHeight });
        updateWindowPosition(instanceId, { x: newLeft, y: newTop });
      } else if (isDragging) {
        updateWindowPosition(instanceId, { x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });
      }
    };

    const onMouseUp_Global = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', onMouseMove_Global);
      window.addEventListener('mouseup', onMouseUp_Global);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove_Global);
      window.removeEventListener('mouseup', onMouseUp_Global);
    };
  }, [isDragging, isResizing, instanceId, updateWindowPosition, updateWindowSize, MIN_WIDTH, MIN_HEIGHT]);

  // --- RENDERIZAÇÃO ---
  const isActive = instance.id === activeWindowId;
  const maximizeIcon = instance.displayState === 'maximized' ? restore : maximize;

  return (
    <div
        className={`${styles.window} ${isActive ? styles.active : ''} ${instance.displayState === 'maximized' ? styles.maximized : ''}`}
        style={{
            top: instance.position.y,
            left: instance.position.x,
            width: instance.size.width,
            height: instance.size.height,
            zIndex: instance.zIndex,
            display: instance.displayState === 'minimized' ? 'none' : 'block'
        }}
        onMouseDown={handleFocusAndStopPropagation}
    >
      <header
        className={`${styles.titleBar} ${isActive ? styles.active : ''}`}
        style={{ cursor: isDragging ? 'move' : 'default' }}
        onMouseDown={onMouseDown_Drag}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img className={styles.icon} src={program.iconUrl} alt={`${program.name} icon`} />
          <span className={styles.title}>{program.name}</span>
        </div>
        <div className={styles.windowControls}>
          <button className={styles.windowButton} onClick={() => minimizeWindow(instanceId)}>
            <img src={minimize} alt="Minimize Button" />
          </button>
          {isResizable !== false && ( // Só mostra o botão se a janela for redimensionável
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
      {isResizable !== false && ( // Só renderiza as alças se a janela for redimensionável
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