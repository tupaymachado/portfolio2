import { useState, useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { useWindowContext, useWindowStore } from '../../../stores/useWindowStore';
import { useShallow } from 'zustand/shallow';
import { INITIAL_PLAYLIST } from '../../../data/music';

export default function WebampApp() {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const webampRef = useRef<Webamp | null>(null);
  // useState (não useRef!) para que mudanças re-disparem os effects de z-index e visibilidade
  const [webampEl, setWebampEl] = useState<HTMLElement | null>(null);
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

    webamp.renderWhenReady(containerRef).then(() => {
      // O Webamp renderiza div#webamp direto no <body>, fora do #root.
      // Movemos para dentro do appContainer para compartilhar o mesmo stacking context das janelas.
      const el = document.getElementById('webamp');
      const appContainer = document.querySelector('[class*="appContainer"]');
      if (el && appContainer) {
        appContainer.appendChild(el);
        setWebampEl(el); // useState → re-dispara effects de z-index e visibilidade
      }
    });

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
      setWebampEl(null);
      webamp.dispose();
    };
  }, [containerRef, instanceId, closeWindow, minimizeWindow]);

  // Sincronizar visibilidade (minimizar/restaurar)
  useEffect(() => {
    if (!webampEl) return;
    webampEl.style.display = isMinimized ? 'none' : '';
  }, [webampEl, isMinimized]);

  // Sincronizar z-index com o sistema de janelas
  useEffect(() => {
    if (!webampEl) return;
    webampEl.style.setProperty('z-index', String(zIndex), 'important');
  }, [webampEl, zIndex]);

  // Clicar no Webamp traz ele para frente (bringToFront)
  // O listener precisa estar no div#webamp (que vive no appContainer), não no nosso container
  useEffect(() => {
    if (!webampEl) return;
    const handleMouseDown = () => bringToFront(instanceId);
    webampEl.addEventListener('mousedown', handleMouseDown);
    return () => webampEl.removeEventListener('mousedown', handleMouseDown);
  }, [webampEl, instanceId, bringToFront]);

  return (
    <div
      ref={setContainerRef}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
}
