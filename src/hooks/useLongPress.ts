import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
    /** Called when long press is detected */
    onLongPress: (position: { x: number; y: number }) => void;
    /** Called on regular click/tap (optional) */
    onClick?: () => void;
    /** Duration in ms to trigger long press (default: 500) */
    delay?: number;
    /** Movement threshold in px to cancel long press (default: 10) */
    moveThreshold?: number;
}

interface UseLongPressReturn {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
}

/**
 * Hook that detects long press (touch hold) for context menu on mobile.
 * Also handles regular clicks/taps.
 */
export function useLongPress(options: UseLongPressOptions): UseLongPressReturn {
    const { onLongPress, onClick, delay = 500, moveThreshold = 10 } = options;

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressRef = useRef(false);
    const startPosRef = useRef({ x: 0, y: 0 });

    const clear = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const start = useCallback((x: number, y: number) => {
        isLongPressRef.current = false;
        startPosRef.current = { x, y };

        timerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            onLongPress({ x, y });
        }, delay);
    }, [onLongPress, delay]);

    const end = useCallback((shouldClick: boolean = true) => {
        clear();

        // If it wasn't a long press and we have an onClick, trigger it
        if (!isLongPressRef.current && shouldClick && onClick) {
            onClick();
        }
    }, [clear, onClick]);

    const checkMove = useCallback((x: number, y: number) => {
        const dx = Math.abs(x - startPosRef.current.x);
        const dy = Math.abs(y - startPosRef.current.y);

        if (dx > moveThreshold || dy > moveThreshold) {
            clear();
        }
    }, [clear, moveThreshold]);

    // --- MOUSE HANDLERS ---
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 2) return; // Don't interfere with actual right-click
        start(e.clientX, e.clientY);
    }, [start]);

    const onMouseUp = useCallback((_e: React.MouseEvent) => {
        end(true);
    }, [end]);

    const onMouseLeave = useCallback((_e: React.MouseEvent) => {
        clear();
    }, [clear]);

    // --- TOUCH HANDLERS ---
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 1) {
            clear();
            return;
        }
        const touch = e.touches[0];
        start(touch.clientX, touch.clientY);
    }, [start, clear]);

    const onTouchEnd = useCallback((_e: React.TouchEvent) => {
        end(!isLongPressRef.current); // Don't trigger onClick if was long press
    }, [end]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        checkMove(touch.clientX, touch.clientY);
    }, [checkMove]);

    return {
        onMouseDown,
        onMouseUp,
        onMouseLeave,
        onTouchStart,
        onTouchEnd,
        onTouchMove,
    };
}
