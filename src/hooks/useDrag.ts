import { useRef, useCallback } from 'react';

interface Position {
    x: number;
    y: number;
}

interface UseDragOptions {
    /** Called when drag starts, return false to cancel */
    onDragStart?: (startPos: Position) => boolean | void;
    /** Called continuously during drag */
    onDrag: (currentPos: Position, delta: Position) => void;
    /** Called when drag ends */
    onDragEnd?: (endPos: Position) => void;
    /** If true, drag is disabled */
    disabled?: boolean;
}

interface UseDragReturn {
    /** Attach to element's onMouseDown */
    onMouseDown: (e: React.MouseEvent) => void;
    /** Attach to element's onTouchStart */
    onTouchStart: (e: React.TouchEvent) => void;
    /** Whether currently dragging */
    isDragging: boolean;
}

/**
 * Hook that unifies mouse and touch drag handling.
 * Works on both desktop (mouse) and mobile (touch).
 */
export function useDrag(options: UseDragOptions): UseDragReturn {
    const { onDragStart, onDrag, onDragEnd, disabled } = options;

    const isDraggingRef = useRef(false);
    const startPosRef = useRef<Position>({ x: 0, y: 0 });
    const lastPosRef = useRef<Position>({ x: 0, y: 0 });

    // --- MOUSE HANDLERS ---
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (disabled || e.button !== 0) return; // Only left click

        const startPos = { x: e.clientX, y: e.clientY };

        if (onDragStart) {
            const shouldContinue = onDragStart(startPos);
            if (shouldContinue === false) return;
        }

        isDraggingRef.current = true;
        startPosRef.current = startPos;
        lastPosRef.current = startPos;

        const handleMouseMove = (ev: MouseEvent) => {
            if (!isDraggingRef.current) return;

            const currentPos = { x: ev.clientX, y: ev.clientY };
            const delta = {
                x: currentPos.x - lastPosRef.current.x,
                y: currentPos.y - lastPosRef.current.y,
            };

            onDrag(currentPos, delta);
            lastPosRef.current = currentPos;
        };

        const handleMouseUp = (ev: MouseEvent) => {
            if (!isDraggingRef.current) return;

            isDraggingRef.current = false;
            onDragEnd?.({ x: ev.clientX, y: ev.clientY });

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [disabled, onDragStart, onDrag, onDragEnd]);

    // --- TOUCH HANDLERS ---
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled) return;
        if (e.touches.length !== 1) return; // Only single finger

        const touch = e.touches[0];
        const startPos = { x: touch.clientX, y: touch.clientY };

        if (onDragStart) {
            const shouldContinue = onDragStart(startPos);
            if (shouldContinue === false) return;
        }

        isDraggingRef.current = true;
        startPosRef.current = startPos;
        lastPosRef.current = startPos;

        const handleTouchMove = (ev: TouchEvent) => {
            if (!isDraggingRef.current) return;
            if (ev.touches.length !== 1) return;

            const touch = ev.touches[0];
            const currentPos = { x: touch.clientX, y: touch.clientY };
            const delta = {
                x: currentPos.x - lastPosRef.current.x,
                y: currentPos.y - lastPosRef.current.y,
            };

            onDrag(currentPos, delta);
            lastPosRef.current = currentPos;

            // Prevent scrolling while dragging
            ev.preventDefault();
        };

        const handleTouchEnd = () => {
            if (!isDraggingRef.current) return;

            isDraggingRef.current = false;

            // Use last known position since touchend doesn't have touch coordinates
            onDragEnd?.(lastPosRef.current);

            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);
    }, [disabled, onDragStart, onDrag, onDragEnd]);

    return {
        onMouseDown: handleMouseDown,
        onTouchStart: handleTouchStart,
        isDragging: isDraggingRef.current,
    };
}
