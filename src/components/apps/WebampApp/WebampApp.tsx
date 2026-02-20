import { useState, useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { useWindowContext, useWindowStore } from '../../../stores/useWindowStore';
import { useShallow } from 'zustand/shallow';

export default function WebampApp() {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const webampRef = useRef<Webamp | null>(null);
  const { instanceId } = useWindowContext();
  const closeWindow = useWindowStore(state => state.closeWindow);
  const minimizeWindow = useWindowStore(state => state.minimizeWindow);
  const bringToFront = useWindowStore(state => state.bringToFront);

  const { isMinimized, zIndex } = useWindowStore(
    useShallow(state => {
      const win = state.openWindows.find(w => w.id === instanceId);
      return { isMinimized: win?.isMinimized ?? false, zIndex: win?.zIndex ?? 1 };
    })
  );

  // Inicializar o Webamp
  useEffect(() => {
    if (!containerRef) return;
    if (!Webamp.browserIsSupported()) return;

    const webamp = new Webamp({
      zIndex: 1,
      initialTracks: [
        {
          metaData: { artist: 'DJ Mike Llama', title: "Llama Whippin' Intro" },
          url: 'https://cdn.webamp.org/llama-2.91.mp3',
          duration: 5.322286,
        },
      ],
    });

    webampRef.current = webamp;
    webamp.renderWhenReady(containerRef);

    const unsubClose = webamp.onClose(() => {
      closeWindow(instanceId);
    });

    const unsubMinimize = webamp.onMinimize(() => {
      minimizeWindow(instanceId);
    });

    return () => {
      unsubClose();
      unsubMinimize();
      webampRef.current = null;
      webamp.dispose();
    };
  }, [containerRef, instanceId, closeWindow, minimizeWindow]);

  // Sincronizar visibilidade (minimizar/restaurar)
  useEffect(() => {
    if (!containerRef) return;
    containerRef.style.display = isMinimized ? 'none' : '';
  }, [containerRef, isMinimized]);

  // Sincronizar z-index com o sistema de janelas
  useEffect(() => {
    if (!containerRef) return;
    containerRef.style.zIndex = String(zIndex);
  }, [containerRef, zIndex]);

  return (
    <div
      ref={setContainerRef}
      onMouseDown={() => bringToFront(instanceId)}
      style={{ position: 'fixed', top: 0, left: 0 }}
    />
  );
}
