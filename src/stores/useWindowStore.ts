import { create } from 'zustand';
import type { WindowInstance } from '../types/window';
import { PROGRAMS } from '../data/programs';

// Definimos a "forma" do nosso store: o estado e as ações
interface WindowState {
    openWindows: WindowInstance[];
    activeWindowId: number | null;
    zIndexCounter: number;
    openWindow: (programId: string) => void;
    closeWindow: (id: number) => void;
    minimizeWindow: (id: number) => void;
    toggleMaximize: (id: number) => void;
    bringToFront: (id: number) => void;
    deselectAllWindows: () => void;
    handleTaskbarClick: (id: number) => void;
    updateWindowPosition: (id: number, position: { x: number; y: number }) => void;
    updateWindowSize: (id: number, size: { width: number; height: number }) => void;
    isStartMenuOpen: boolean;
    toggleStartMenu: () => void;
}

export const useWindowStore = create<WindowState>((set, get) => ({
    // --- ESTADO INICIAL ---
    openWindows: [],
    activeWindowId: null,
    zIndexCounter: 1,
    isStartMenuOpen: false,

    // --- AÇÕES ---

    toggleStartMenu: () => set(state => ({
        isStartMenuOpen: !state.isStartMenuOpen
    })),

    openWindow: (programId) => {
        const program = PROGRAMS.find(p => p.id === programId);
        if (!program) return;

        const { openWindows, bringToFront } = get();
        const alreadyOpen = openWindows.find(win => win.programId === programId);
        if (alreadyOpen) {
            bringToFront(alreadyOpen.id);
            return;
        }

        const newId = Date.now();
        const newWindow: WindowInstance = {
            id: newId,
            programId,
            displayState: 'normal',
            zIndex: get().zIndexCounter,
            position: { x: 150 + openWindows.length * 20, y: 100 + openWindows.length * 20 },
            size: program.defaultSize || { width: 600, height: 400 },
            minSize: program.minSize || { width: 150, height: 100 },
            isResizable: program.isResizable !== false,
        };

        set(state => ({
            openWindows: [...state.openWindows, newWindow],
            zIndexCounter: state.zIndexCounter + 1,
            activeWindowId: newId,
        }));
        
    },

    closeWindow: (id) => set(state => ({
        openWindows: state.openWindows.filter(win => win.id !== id),
    })),

    minimizeWindow: (id) => set(state => ({
        openWindows: state.openWindows.map(win =>
            win.id === id ? { ...win, displayState: 'minimized' } : win
        ),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

    toggleMaximize: (id) => {
        set(state => ({
            openWindows: state.openWindows.map(win =>
                win.id === id ? { ...win, displayState: win.displayState === 'normal' ? 'maximized' : 'normal' } : win
            ),
        }));
        get().bringToFront(id);
    },

    bringToFront: (id) => {
        const { activeWindowId, zIndexCounter } = get();

        // Se a janela já estiver ativa, não faça nada. APENAS RETORNE.
        if (id === activeWindowId) {
            return;
        }

        // Se a janela NÃO estava ativa, atualize tudo.
        set(state => ({
            openWindows: state.openWindows.map(win =>
                win.id === id ? { ...win, zIndex: zIndexCounter } : win
            ),
            zIndexCounter: state.zIndexCounter + 1,
            activeWindowId: id,
        }));
    },

    deselectAllWindows: () => {
        set({ activeWindowId: null })
    },

    updateWindowPosition: (id, position) => set(state => ({
        openWindows: state.openWindows.map(win =>
            win.id === id ? { ...win, position } : win
        ),
    })),

    updateWindowSize: (id, size) => set(state => ({
        openWindows: state.openWindows.map(win =>
            win.id === id ? { ...win, size } : win
        ),
    })),

    handleTaskbarClick: (id) => {
        const { openWindows, activeWindowId, bringToFront, minimizeWindow } = get();
        const win = openWindows.find(w => w.id === id);
        if (!win) return;

        if (win.id === activeWindowId && win.displayState !== 'minimized') {
            minimizeWindow(id);
        } else {
            set(state => ({
                openWindows: state.openWindows.map(w =>
                    w.id === id ? { ...w, displayState: 'normal' } : w
                ),
            }));
            bringToFront(id);
        }
    },
}));