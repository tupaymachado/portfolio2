import Desktop from './components/Desktop/Desktop';
import Taskbar from './components/Taskbar/Taskbar';
import Window from './components/Window/Window';
import { useWindowStore } from './stores/useWindowStore'; // 1. Importe o store
import { PROGRAMS } from './data/programs';

function App() {
  // 2. "Selecione" apenas os dados de que você precisa para a renderização
  const openWindows = useWindowStore(state => state.openWindows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const deselectAllWindows = useWindowStore(state => state.deselectAllWindows);

  return (
    // 3. O handler de deselecionar agora vive no contêiner principal
    <div onMouseDown={deselectAllWindows}>
      <Desktop />
      <Taskbar />

      {openWindows.map(win => {
        const program = PROGRAMS.find(p => p.id === win.programId);
        if (!program) return null;

        return (
          // 4. Passamos os dados e os IDs para o Window, ele buscará as ações no store
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