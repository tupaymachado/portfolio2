import { useState } from 'react';
import Desktop from './components/Desktop/Desktop';
import Taskbar from './components/Taskbar/Taskbar';
import Window from './components/Window/Window';
import type { WindowInstance } from './types/window';
import { PROGRAMS } from './data/programs';

function App() {

  const [openWindows, setOpenWindows] = useState<WindowInstance[]>([]);
  const [zIndexCounter, setZIndexCounter] = useState(1); // Começa em 1
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);

  const handleDeselectAllWindows = () => {
    setActiveWindowId(null);
  };

  const handleTaskbarButtonClick = (id: number) => {
    setOpenWindows(prevWindows =>
      prevWindows.map(win => {
        // Encontra a janela clicada
        if (win.id === id) {
          // Se já for a janela ativa E não estiver minimizada, minimize-a.
          // Se estiver minimizada ou inativa, traga-a para a frente e normalize.
          if (win.id === activeWindowId && win.displayState !== 'minimized') {
            return { ...win, displayState: 'minimized' };
          }
          return { ...win, displayState: 'normal' };
        }
        return win;
      })
    );

    // Lógica para trazer a janela clicada para a frente
    // Se a janela estava minimizada, isso a tornará ativa.
    handleBringToFront(id);
  };

  // Modificação Sutil: no botão Minimizar da Janela, só queremos minimizar.
  const handleMinimizeWindow = (id: number) => {
    setOpenWindows(prevWindows =>
      prevWindows.map(win =>
        win.id === id ? { ...win, displayState: 'minimized' } : win
      )
    );
  }

  const handleOpenWindow = (programId: string) => {
    // 3. BUSQUE o programa correspondente
    const program = PROGRAMS.find(p => p.id === programId);

    // 4. Se o programa não for encontrado, não faça nada (medida de segurança)
    if (!program) {
      console.error(`Programa com id "${programId}" não encontrado.`);
      return;
    }

    // Opcional: Impedir que a mesma janela seja aberta várias vezes
    const isAlreadyOpen = openWindows.some(win => win.programId === programId);
    if (isAlreadyOpen) {
      handleBringToFront(openWindows.find(win => win.programId === programId)!.id);
      return;
    }

    const newPosition = {
      x: 150 + openWindows.length * 20,
      y: 100 + openWindows.length * 20
    }

    const newId = Date.now();

    // 5. CONSTRUA a nova janela usando os dados do 'program'
    const newWindow: WindowInstance = {
      id: newId,
      programId: program.id, // Armazena qual programa está rodando
      // displayState, zIndex e position são gerados dinamicamente
      displayState: 'normal',
      zIndex: zIndexCounter,
      position: newPosition,
      // size é pego do padrão do programa, ou um fallback
      size: program.defaultSize || { width: 600, height: 400 },
      // minSize e isResizable também viriam daqui para passar para a <Window />
      minSize: program.minSize || { width: 150, height: 100 },
      isResizable: program.isResizable !== false, // Padrão é true
    };

    setOpenWindows(prevWindows => [...prevWindows, newWindow]);
    setZIndexCounter(prev => prev + 1);
    setActiveWindowId(newId);
  };

  const handleWindowResize = (id: number, newSize: { width: number; height: number }) => {
    setOpenWindows(prevWindows =>
      prevWindows.map(win =>
        win.id === id ? { ...win, size: newSize } : win
      )
    );
  };

  const handleCloseWindow = (idToClose: number) => {
    setOpenWindows(prevWindows =>
      prevWindows.filter(win => win.id != idToClose)
    );
  };

  const handleBringToFront = (id: number) => {
    // Apenas atualiza se a janela já não estiver na frente
    if (id !== activeWindowId) {
      setOpenWindows(prevWindows =>
        prevWindows.map(win =>
          win.id === id ? { ...win, zIndex: zIndexCounter } : win
        )
      );
      setZIndexCounter(prev => prev + 1);
      setActiveWindowId(id);
    }
  };


  const handleUpdateWindowPosition = (id: number, newPosition: { x: number, y: number }) => {
    setOpenWindows(prevWindows =>
      prevWindows.map(win =>
        win.id === id ? { ...win, position: newPosition } : win
      )
    )
  }

  const handleToggleMaximize = (id: number) => {
    setOpenWindows(prevWindows =>
      prevWindows.map(win => {
        if (win.id === id) {
          // Se está normal, maximize. Se está maximizada, normalize.
          const newDisplayState = win.displayState === 'normal' ? 'maximized' : 'normal';
          return { ...win, displayState: newDisplayState };
        }
        return win;
      })
    );
    // Também trazemos para a frente ao maximizar/restaurar
    handleBringToFront(id);
  };

  return (
    <div>
      <Desktop
        onOpenWindow={handleOpenWindow}
        onDeselectAllWindows={handleDeselectAllWindows}
      />
      <Taskbar
        openWindows={openWindows}
        onTaskbarButtonClick={handleTaskbarButtonClick}
        activeWindowId={activeWindowId}
        onDeselectAllWindows={handleDeselectAllWindows}
      />

      {openWindows.map(win => {
        // Busca os dados estáticos do programa para esta instância de janela
        const program = PROGRAMS.find(p => p.id === win.programId);

        // Se o programa não for encontrado, não renderize a janela
        if (!program) return null;

        return (
          <Window
            key={win.id}
            // Dados do programa
            title={program.name}
            iconUrl={program.iconUrl}
            isResizable={program.isResizable}
            minSize={program.minSize}

            // Dados da instância
            initialPosition={win.position}
            initialSize={win.size}
            displayState={win.displayState}
            isActive={win.id === activeWindowId}
            zIndex={win.zIndex}

            // Callbacks
            onClose={() => handleCloseWindow(win.id)}
            onDrag={(newPos) => handleUpdateWindowPosition(win.id, newPos)}
            onFocus={() => handleBringToFront(win.id)}
            onToggleMaximize={() => handleToggleMaximize(win.id)}
            onResize={(newSize) => handleWindowResize(win.id, newSize)}
            onMinimize={() => handleMinimizeWindow(win.id)}
          >
            {/* O conteúdo da janela vem do programa */}
            {program.component}
          </Window>
        )
      })}
    </div>
  );
}

export default App;