import { useEffect, Suspense } from 'react';
import styles from './App.module.css';
import Desktop from './components/Desktop/Desktop';
import Taskbar from './components/Taskbar/Taskbar';
import Window from './components/Window/Window';
import ContextMenu from './components/ContextMenu/ContextMenu';
import ShutdownDialog from './components/ShutdownDialog/ShutdownDialog';
import LoginScreen from './components/LoginScreen/LoginScreen';
import { useWindowStore, WindowContext } from './stores/useWindowStore';
import { useSystemStore } from './stores/useSystemStore';
import { useUserStore } from './stores/useUserStore';
import { useFileSystemStore } from './stores/useFileSystemStore';
import { PROGRAMS_MAP } from './data/programs';
import { preloadAll } from './data/programs';
import { useShallow } from 'zustand/shallow';
import type { ProgramComponent } from './types/program';

function App() {
  // User state
  const currentUserId = useUserStore(state => state.currentUserId);
  const isShuttingDown = useUserStore(state => state.isShuttingDown);

  // File system sync
  const setActiveUser = useFileSystemStore(state => state.setActiveUser);
  const clearActiveUser = useFileSystemStore(state => state.clearActiveUser);

  // useShallow: evita re-render se o array tiver mesmos itens (comparação rasa)
  const openWindows = useWindowStore(useShallow(state => state.openWindows));
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);
  const initializeMobileDetection = useSystemStore(state => state.initializeMobileDetection);

  // Initialize mobile detection on mount
  useEffect(() => {
    const cleanup = initializeMobileDetection();
    // Silently preload all lazy chunks so they're ready when user opens a window
    preloadAll();
    return cleanup;
  }, [initializeMobileDetection]);

  // Sync file system with user login/logout
  useEffect(() => {
    if (currentUserId) {
      setActiveUser(currentUserId);
    } else {
      clearActiveUser();
    }
  }, [currentUserId, setActiveUser, clearActiveUser]);

  const renderProgramComponent = (component: ProgramComponent) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof component === 'object' && component !== null && '$$typeof' in (component as any)) {
      const LazyComponent = component as React.ComponentType;
      return <LazyComponent />;
    }
    if (typeof component === 'function') {
      return (component as () => React.ReactNode)();
    }
    return null;
  };

  // Se não está logado ou está desligando, mostra a tela de login
  if (!currentUserId || isShuttingDown) {
    return <LoginScreen />;
  }

  // Usuário logado: mostra o desktop
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

        if (program.chromeless) {
          return (
            <WindowContext.Provider key={win.id} value={{ instanceId: win.id }}>
              <Suspense fallback={null}>
                {renderProgramComponent(program.component)}
              </Suspense>
            </WindowContext.Provider>
          );
        }

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