import { create } from 'zustand';
import type { WindowInstance } from '../types/window';
import { PROGRAMS } from '../data/programs';
import { useSystemStore } from './useSystemStore';

export type MenuItem = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
};

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
    closeStartMenu: () => void;

    contextMenu: {
        isOpen: boolean;
        position: { x: number; y: number };
        items: MenuItem[];
    };
    openContextMenu: (x: number, y: number, items: MenuItem[]) => void;
    closeContextMenu: () => void;
};

export const useWindowStore = create<WindowState>((set, get) => ({
    // --- ESTADO INICIAL ---
    openWindows: [],
    activeWindowId: null,
    zIndexCounter: 1,
    isStartMenuOpen: false,
    contextMenu: {
        isOpen: false,
        position: { x: 0, y: 0 },
        items: [],
    },

    // --- AÇÕES ---

    openContextMenu: (x, y, items) => {
        // Ao abrir um context menu, sempre feche o start menu, e vice-versa.
        get().closeStartMenu(); // Supondo que você tenha uma ação closeStartMenu
        set({
            contextMenu: {
                isOpen: true,
                position: { x, y },
                items,
            }
        });
    },

    closeContextMenu: () => set(state => ({
        contextMenu: {
            ...state.contextMenu, // Mantém a posição e os itens para não piscar
            isOpen: false,
        }
    })),

    closeStartMenu: () => set({ isStartMenuOpen: false }),

    toggleStartMenu: () => set(state => ({
        isStartMenuOpen: !state.isStartMenuOpen
    })),

    openWindow: (programId) => {
        const program = PROGRAMS.find(p => p.id === programId);
        if (!program) return;

        get().closeContextMenu();
        get().closeStartMenu();
        const { openWindows, bringToFront } = get();
        const alreadyOpen = openWindows.find(win => win.programId === programId);
        if (alreadyOpen) {
            bringToFront(alreadyOpen.id);
            return;
        }

        // Check if we're on a mobile/small screen device
        const { isMobile, isSmallScreen } = useSystemStore.getState();
        const shouldMaximize = isMobile || isSmallScreen;

        const newId = Date.now();
        const newWindow: WindowInstance = {
            id: newId,
            programId,
            displayState: shouldMaximize ? 'maximized' : 'normal',
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
        set(state => {
            const win = state.openWindows.find(w => w.id === id);
            if (!win) return state;

            const isRestoring = win.displayState === 'maximized';

            if (isRestoring) {
                // When restoring, ensure window fits within viewport
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const taskbarHeight = 40; // Approximate taskbar height

                // Clamp size to fit viewport
                const maxWidth = viewportWidth - 20; // 10px margin on each side
                const maxHeight = viewportHeight - taskbarHeight - 20;

                const newWidth = Math.min(win.size.width, maxWidth);
                const newHeight = Math.min(win.size.height, maxHeight);

                // Clamp position to keep window visible
                const newX = Math.min(win.position.x, viewportWidth - newWidth - 10);
                const newY = Math.min(win.position.y, viewportHeight - taskbarHeight - newHeight - 10);

                return {
                    openWindows: state.openWindows.map(w =>
                        w.id === id ? {
                            ...w,
                            displayState: 'normal' as const,
                            size: { width: newWidth, height: newHeight },
                            position: { x: Math.max(0, newX), y: Math.max(0, newY) }
                        } : w
                    ),
                };
            } else {
                // Maximizing - just toggle state
                return {
                    openWindows: state.openWindows.map(w =>
                        w.id === id ? { ...w, displayState: 'maximized' as const } : w
                    ),
                };
            }
        });
        get().bringToFront(id);
    },


    bringToFront: (id) => {
        const { activeWindowId, zIndexCounter } = get();

        get().closeContextMenu();
        get().closeStartMenu();

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