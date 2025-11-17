import styles from './Window.module.css';
import { useState, useEffect, useRef } from 'react';
import minimize from '../../assets/icons/Minimize.png';
import maximize from '../../assets/icons/maximize.png';
import restore from '../../assets/icons/restore.png';
import close from '../../assets/icons/close.png';
import type { WindowDisplayState } from '../../types/window';

const MIN_WINDOW_WIDTH = 500;
const MIN_WINDOW_HEIGHT = 400;

type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

interface WindowProps {
    title: string;
    children: React.ReactNode;
    initialPosition: { x: number; y: number };
    onClose: () => void;
    onDrag: (newPosition: { x: number; y: number }) => void;
    zIndex: number;
    isActive: boolean;
    onFocus: () => void;
    displayState: WindowDisplayState;
    onToggleMaximize: () => void;
    initialSize: { width: number, height: number };
    onResize: (newSize: { width: number, height: number }) => void;
    onMinimize: () => void;
    iconUrl: string;
    minSize?: { width: number, height: number };
    isResizable: boolean;
}

export default function Window({
    title, children, initialPosition, onClose, onDrag, zIndex,
    onFocus, isActive, onToggleMaximize, displayState, initialSize, onResize, onMinimize, minSize, iconUrl, isResizable
}: WindowProps) {

    // --- ESTADOS E REFS ---
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState(initialSize);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const resizeStartData = useRef<{
        handle: ResizeHandle;
        initialSize: { width: number; height: number };
        initialPosition: { x: number; y: number };
        initialMousePos: { x: number; y: number };
    } | null>(null);

    // --- LÓGICA PARA ARRASTAR (DRAG) ---
    const onMouseDown_Drag = (e: React.MouseEvent<HTMLElement>) => {
        setIsDragging(true);
        onFocus(); // Também foca a janela ao arrastar
        dragOffsetRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    // --- LÓGICA PARA REDIMENSIONAR (RESIZE) ---
    const onMouseDown_Resize = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
        e.stopPropagation();
        setIsResizing(true);
        onFocus();
        resizeStartData.current = {
            handle,
            initialSize: size,
            initialPosition: position,
            initialMousePos: { x: e.clientX, y: e.clientY },
        };
    };

    // --- GERENCIADOR GLOBAL DE EVENTOS DO MOUSE (useEffect) ---
    useEffect(() => {
        const onMouseMove_Global = (e: MouseEvent) => {
            // Lógica de Redimensionamento
            if (isResizing && resizeStartData.current) {
                const { handle, initialSize, initialPosition, initialMousePos } = resizeStartData.current;
                const dx = e.clientX - initialMousePos.x;
                const dy = e.clientY - initialMousePos.y;

                let newWidth = initialSize.width;
                let newHeight = initialSize.height;
                let newLeft = initialPosition.x;
                let newTop = initialPosition.y;

                if (handle.includes('e')) newWidth = initialSize.width + dx;
                if (handle.includes('w')) newWidth = initialSize.width - dx;
                if (handle.includes('s')) newHeight = initialSize.height + dy;
                if (handle.includes('n')) newHeight = initialSize.height - dy;

                if (newWidth < MIN_WINDOW_WIDTH) newWidth = MIN_WINDOW_WIDTH;
                if (newHeight < MIN_WINDOW_HEIGHT) newHeight = MIN_WINDOW_HEIGHT;

                if (handle.includes('w')) newLeft = initialPosition.x + (initialSize.width - newWidth);
                if (handle.includes('n')) newTop = initialPosition.y + (initialSize.height - newHeight);

                setSize({ width: newWidth, height: newHeight });
                setPosition({ x: newLeft, y: newTop });

                // Lógica de Arrastar
            } else if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffsetRef.current.x,
                    y: e.clientY - dragOffsetRef.current.y,
                });
            }
        };

        const onMouseUp_Global = () => {
            if (isResizing) {
                setIsResizing(false);
                // A ordem aqui não importa, ambas informam o estado mais recente
                onResize(size);
                onDrag(position);
            }
            if (isDragging) {
                setIsDragging(false);
                onDrag(position);
            }
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', onMouseMove_Global);
            window.addEventListener('mouseup', onMouseUp_Global);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove_Global);
            window.removeEventListener('mouseup', onMouseUp_Global);
        };
    }, [isDragging, isResizing, size, position, onDrag, onResize]);


    // --- RENDERIZAÇÃO ---
    const maximizeIcon = displayState === 'maximized' ? restore : maximize;

    return (
        <div
            className={`${styles.window} 
            ${displayState === 'maximized' ? styles.maximized : ''}`}
            style={{
                top: position.y,
                left: position.x,
                width: size.width,
                height: size.height,
                minHeight: minSize ? minSize.height : '',
                minWidth: minSize ? minSize.width : '',
                zIndex: zIndex,
                display: displayState === 'minimized' ? 'none' : 'block'
            }}
            onMouseDown={onFocus}
        >
            <header
                className={`${styles.titleBar} ${isActive ? styles.active : ''}`}
                style={{ cursor: isDragging ? 'move' : 'default' }}
                onMouseDown={onMouseDown_Drag}
            >
                <div style={{display: 'flex'}}>
                    <span className={styles.icon}><img className={styles.icon} src={iconUrl} /></span>
                    <span className={styles.title}>{title}</span>
                </div>
                <div className={styles.windowControls}>
                    <button className={styles.windowButton} onClick={onMinimize}>
                        <img src={minimize} alt="Minimize Button" />
                    </button>
                    <button className={styles.windowButton} onClick={onToggleMaximize}>
                        <img src={maximizeIcon} alt="Maximize/Restore Button" />
                    </button>
                    <button className={`${styles.windowButton} ${styles.closeButton}`} onClick={onClose}>
                        <img src={close} alt="Close Button" />
                    </button>
                </div>
            </header>
            <div className={styles.windowBody}>
                {children}
            </div>
            <div className={`${styles.resizeHandle} ${styles.n}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'n')}></div>
            <div className={`${styles.resizeHandle} ${styles.ne}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'ne')}></div>
            <div className={`${styles.resizeHandle} ${styles.e}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'e')}></div>
            <div className={`${styles.resizeHandle} ${styles.se}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'se')}></div>
            <div className={`${styles.resizeHandle} ${styles.s}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 's')}></div>
            <div className={`${styles.resizeHandle} ${styles.sw}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'sw')}></div>
            <div className={`${styles.resizeHandle} ${styles.w}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'w')}></div>
            <div className={`${styles.resizeHandle} ${styles.nw}`} style={{ display: isResizable ? '' : 'none' }} onMouseDown={(e) => onMouseDown_Resize(e, 'nw')}></div>
        </div>
    );
}