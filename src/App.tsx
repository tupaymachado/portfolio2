import { useEffect } from 'react';
import styles from './App.module.css';
import Desktop from './components/Desktop/Desktop';
import Taskbar from './components/Taskbar/Taskbar';
import Window from './components/Window/Window';
import ContextMenu from './components/ContextMenu/ContextMenu';
import ShutdownDialog from './components/ShutdownDialog/ShutdownDialog';
import { useWindowStore } from './stores/useWindowStore';
import { useSystemStore } from './stores/useSystemStore';
import { PROGRAMS_MAP } from './data/programs';
import { useShallow } from 'zustand/shallow';

function App() {
  // useShallow: evita re-render se o array tiver mesmos itens (comparação rasa)
  const openWindows = useWindowStore(useShallow(state => state.openWindows));
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);
  const initializeMobileDetection = useSystemStore(state => state.initializeMobileDetection);

  // Initialize mobile detection on mount
  useEffect(() => {
    const cleanup = initializeMobileDetection();
    return cleanup;
  }, [initializeMobileDetection]);

  return (
    <div
      className={styles.appContainer}
      onMouseDown={deselectAllWindows}
    >
      <div>
        <Desktop />
        <Taskbar />
      </div>
      <ContextMenu />
      <ShutdownDialog />
      {openWindows.map(win => {
        const program = PROGRAMS_MAP.get(win.programId);
        if (!program) return null;

        return (
          <Window
            key={win.id}
            instanceId={win.id}
            programId={program.id}
          />
        );
      })}
    </div>
  );
}

export default App;