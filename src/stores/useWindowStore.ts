import { create } from 'zustand';
import type { WindowInstance } from '../types/window';
import { PROGRAMS } from '../data/programs';
import { useSystemStore } from './useSystemStore';

export type MenuItem = {
    label: string;
    onClick: () => void;
    disabled?: boolean;
};

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
        get().closeStartMenu();
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
            ...state.contextMenu,
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
            // Se já está aberta, traz pra frente e desmimimiza
            set(state => ({
                openWindows: state.openWindows.map(w =>
                    w.id === alreadyOpen.id ? { ...w, isMinimized: false } : w
                ),
            }));
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
            isMinimized: false,
            isMaximized: shouldMaximize,
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
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

    minimizeWindow: (id) => set(state => ({
        openWindows: state.openWindows.map(win =>
            win.id === id ? { ...win, isMinimized: true } : win
        ),
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
    })),

    toggleMaximize: (id) => {
        set(state => {
            const win = state.openWindows.find(w => w.id === id);
            if (!win) return state;

            if (win.isMaximized) {
                // Restaurando: ajustar tamanho para caber na viewport
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const taskbarHeight = 40;

                const maxWidth = viewportWidth - 20;
                const maxHeight = viewportHeight - taskbarHeight - 20;

                const newWidth = Math.min(win.size.width, maxWidth);
                const newHeight = Math.min(win.size.height, maxHeight);

                const newX = Math.min(win.position.x, viewportWidth - newWidth - 10);
                const newY = Math.min(win.position.y, viewportHeight - taskbarHeight - newHeight - 10);

                return {
                    openWindows: state.openWindows.map(w =>
                        w.id === id ? {
                            ...w,
                            isMaximized: false,
                            size: { width: newWidth, height: newHeight },
                            position: { x: Math.max(0, newX), y: Math.max(0, newY) }
                        } : w
                    ),
                };
            } else {
                // Maximizando
                return {
                    openWindows: state.openWindows.map(w =>
                        w.id === id ? { ...w, isMaximized: true } : w
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

        if (id === activeWindowId) {
            return;
        }

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

        // Caso 1: Janela ativa e visível → minimiza
        if (win.id === activeWindowId && !win.isMinimized) {
            minimizeWindow(id);
            return;
        }

        // Caso 2: Janela minimizada → restaura (mantém isMaximized)
        if (win.isMinimized) {
            set(state => ({
                openWindows: state.openWindows.map(w =>
                    w.id === id ? { ...w, isMinimized: false } : w
                ),
            }));
            bringToFront(id);
            return;
        }

        // Caso 3: Janela não ativa e não minimizada → traz pra frente
        bringToFront(id);
    },
}));