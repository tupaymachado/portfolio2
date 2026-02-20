import { useState, useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { useWindowContext, useWindowStore } from '../../../stores/useWindowStore';
import { useShallow } from 'zustand/shallow';
import { INITIAL_PLAYLIST } from '../../../data/music';

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
      initialTracks: INITIAL_PLAYLIST,
    });

    webampRef.current = webamp;

    // renderWhenReady centraliza o Winamp dentro do containerRef
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
  // Como o Webamp cria elementos no body, precisamos garantir que eles acompanhem o zIndex da nossa Janela
  useEffect(() => {
    if (!containerRef) return;

    // Atualiza o zIndex do container
    containerRef.style.zIndex = String(zIndex);

    // Hack: O Webamp cria elementos com a classe #webamp-bundle ou similar
    // Vamos tentar setar o zIndex em todos os elementos relacionados ao Webamp
    const webampElements = document.querySelectorAll('[id^="webamp"]');
    webampElements.forEach((el) => {
      (el as HTMLElement).style.zIndex = String(zIndex);
    });
  }, [containerRef, zIndex]);

  return (
    <div
      ref={setContainerRef}
      onMouseDown={() => bringToFront(instanceId)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none' // Permite clicar no Winamp que está "atrás" mas renderizado no body
      }}
    >
      <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }} />
    </div>
  );
}
