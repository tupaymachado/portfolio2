import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileSystemItem, FileSystemState } from '../types/fileSystem';

// Imports de ícones
import myComputerIcon from '../assets/icons/my-computer.webp';
import myDocumentsIcon from '../assets/icons/my-documents.webp';
import myPicturesIcon from '../assets/icons/my-pictures.webp';
import myMusicIcon from '../assets/icons/my-music.webp';
import myVideosIcon from '../assets/icons/my-videos.webp';
import notepadIcon from '../assets/icons/notepad.webp';
import trashBinIcon from '../assets/icons/trash-bin.webp';

// ============================================================================
// TEMPLATE DO FILE SYSTEM (clonado para cada novo perfil)
// ============================================================================
const createInitialItems = (): Record<string, FileSystemItem> => ({
    // --- PASTAS DO SISTEMA ---
    'root': {
        id: 'root',
        parentId: '',
        name: 'C:',
        type: 'folder',
        iconUrl: myComputerIcon,
        createdAt: Date.now(),
    },
    'recycle-bin': {
        id: 'recycle-bin',
        parentId: 'root',
        name: 'Lixeira',
        type: 'folder',
        iconUrl: trashBinIcon,
        createdAt: Date.now(),
    },
    'desktop': {
        id: 'desktop',
        parentId: 'root',
        name: 'Desktop',
        type: 'folder',
        createdAt: Date.now(),
    },
    'my-documents': {
        id: 'my-documents',
        parentId: 'root',
        name: 'Meus Documentos',
        type: 'folder',
        iconUrl: myDocumentsIcon,
        createdAt: Date.now(),
    },
    'my-pictures': {
        id: 'my-pictures',
        parentId: 'root',
        name: 'Minhas Imagens',
        type: 'folder',
        iconUrl: myPicturesIcon,
        createdAt: Date.now(),
    },
    'my-music': {
        id: 'my-music',
        parentId: 'root',
        name: 'Minha Música',
        type: 'folder',
        iconUrl: myMusicIcon,
        createdAt: Date.now(),
    },
    'my-videos': {
        id: 'my-videos',
        parentId: 'root',
        name: 'Minhas Vídeos',
        type: 'folder',
        iconUrl: myVideosIcon,
        createdAt: Date.now(),
    },

    // --- ATALHOS DO DESKTOP ---
    'shortcut-1': {
        id: 'shortcut-1',
        parentId: 'desktop',
        name: 'Sobre Mim',
        type: 'file',
        programId: 'about-me',
        gridPosition: { row: 0, col: 0 },
        createdAt: Date.now(),
    },
    'shortcut-2': {
        id: 'shortcut-2',
        parentId: 'desktop',
        name: 'Meus Projetos',
        type: 'file',
        programId: 'my-projects',
        gridPosition: { row: 1, col: 0 },
        createdAt: Date.now(),
    },
    'shortcut-3': {
        id: 'shortcut-3',
        parentId: 'desktop',
        name: 'Bloco de Notas',
        type: 'file',
        programId: 'notepad',
        iconUrl: notepadIcon,
        gridPosition: { row: 0, col: 1 },
        createdAt: Date.now(),
    },
});

// ============================================================================
// STORE
// ============================================================================
interface FileSystemStore extends FileSystemState {
    // Per-profile storage
    allUserItems: Record<string, Record<string, FileSystemItem>>;
    activeUserId: string | null;

    // Ações de usuário
    setActiveUser: (userId: string) => void;
    clearActiveUser: () => void;

    // Getters (operam sobre o usuário ativo)
    getItemsByParent: (parentId: string) => FileSystemItem[];
    getItem: (id: string) => FileSystemItem | undefined;
    getPath: (id: string) => string;

    // CRUD
    createFile: (parentId: string, name: string, programId: string, content?: string, extension?: string) => string;
    updateFileContent: (fileId: string, content: string) => void;
    renameItem: (id: string, newName: string) => void;
    deleteItem: (id: string) => void;
    restoreItem: (id: string) => void;
    emptyRecycleBin: () => void;

    // Grid (desktop)
    updateItemGridPosition: (itemId: string, newPosition: { row: number; col: number }, maxRows?: number) => void;
}

export const useFileSystemStore = create<FileSystemStore>()(
    persist(
        (set, get) => ({
            // Estado indexado por userId
            allUserItems: {},
            activeUserId: null,

            // `items` e `rootId` continuam existindo para compatibilidade
            // Sempre refletem o file system do usuário ativo
            items: createInitialItems(),
            rootId: 'root',

            setActiveUser: (userId: string) => {
                const { allUserItems } = get();
                // Se o usuário não tem file system ainda, cria um com o template
                if (!allUserItems[userId]) {
                    const newItems = createInitialItems();
                    set({
                        activeUserId: userId,
                        allUserItems: { ...allUserItems, [userId]: newItems },
                        items: newItems,
                    });
                } else {
                    set({
                        activeUserId: userId,
                        items: allUserItems[userId],
                    });
                }
            },

            clearActiveUser: () => {
                set({
                    activeUserId: null,
                    items: createInitialItems(),
                });
            },

            getItemsByParent: (parentId: string) => {
                const { items } = get();
                return Object.values(items).filter(item => item.parentId === parentId);
            },

            getItem: (id: string) => {
                const { items } = get();
                return items[id];
            },

            getPath: (id: string) => {
                const { items, getPath } = get();
                const item = items[id];
                if (!item) return '';
                if (!item.parentId) return item.name; // root
                return `${getPath(item.parentId)}\\${item.name}`;
            },

            createFile: (parentId, name, programId, content = '', extension) => {
                const id = crypto.randomUUID();
                const now = Date.now();
                const { activeUserId, allUserItems } = get();

                const newItem: FileSystemItem = {
                    id,
                    parentId,
                    name,
                    type: 'file',
                    programId,
                    content,
                    extension,
                    createdAt: now,
                    updatedAt: now,
                };

                set(state => {
                    const newItems = { ...state.items, [id]: newItem };
                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;
                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });

                return id;
            },

            updateFileContent: (fileId, content) => {
                const { activeUserId, allUserItems } = get();

                set(state => {
                    const item = state.items[fileId];
                    if (!item) return state;

                    const updatedItem = { ...item, content, updatedAt: Date.now() };
                    const newItems = { ...state.items, [fileId]: updatedItem };
                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;

                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });
            },

            renameItem: (id, newName) => {
                const { activeUserId, allUserItems } = get();

                set(state => {
                    const item = state.items[id];
                    if (!item) return state;

                    const updatedItem = { ...item, name: newName, updatedAt: Date.now() };
                    const newItems = { ...state.items, [id]: updatedItem };
                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;

                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });
            },

            deleteItem: (id) => {
                const { activeUserId, allUserItems } = get();

                set(state => {
                    const newItems = { ...state.items };
                    const itemToDelete = newItems[id];
                    if (!itemToDelete) return state;

                    if (itemToDelete.parentId !== 'recycle-bin' && id !== 'recycle-bin') {
                        newItems[id] = {
                            ...itemToDelete,
                            originalParentId: itemToDelete.parentId,
                            parentId: 'recycle-bin',
                            updatedAt: Date.now(),
                        };
                    } else {
                        const deleteRecursive = (itemId: string) => {
                            const children = Object.values(newItems).filter(i => i.parentId === itemId);
                            children.forEach(child => deleteRecursive(child.id));
                            delete newItems[itemId];
                        };
                        deleteRecursive(id);
                    }

                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;

                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });
            },

            restoreItem: (id) => {
                const { activeUserId, allUserItems } = get();

                set(state => {
                    const newItems = { ...state.items };
                    const itemToRestore = newItems[id];

                    if (!itemToRestore || itemToRestore.parentId !== 'recycle-bin') return state;

                    newItems[id] = {
                        ...itemToRestore,
                        parentId: itemToRestore.originalParentId || 'desktop',
                        originalParentId: undefined,
                        updatedAt: Date.now(),
                    };

                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;

                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });
            },

            emptyRecycleBin: () => {
                const { activeUserId, allUserItems } = get();

                set(state => {
                    const newItems = { ...state.items };
                    const idsToDelete = new Set<string>();

                    Object.values(newItems).forEach(item => {
                        if (item.parentId === 'recycle-bin') {
                            idsToDelete.add(item.id);
                        }
                    });

                    const deleteRecursive = (itemId: string) => {
                        const children = Object.values(newItems).filter(i => i.parentId === itemId);
                        children.forEach(child => deleteRecursive(child.id));
                        delete newItems[itemId];
                    };

                    idsToDelete.forEach(id => deleteRecursive(id));

                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;

                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });
            },

            updateItemGridPosition: (itemId, newPosition, maxRows = 10) => {
                const { activeUserId, allUserItems } = get();

                set(state => {
                    const newItems = { ...state.items };

                    const moveItem = (id: string, pos: { row: number; col: number }) => {
                        const occupantId = Object.keys(newItems).find(
                            key => key !== id &&
                                newItems[key].parentId === 'desktop' &&
                                newItems[key].gridPosition?.row === pos.row &&
                                newItems[key].gridPosition?.col === pos.col
                        );

                        newItems[id] = {
                            ...newItems[id],
                            gridPosition: pos
                        };

                        if (occupantId) {
                            let nextRow = pos.row + 1;
                            let nextCol = pos.col;

                            if (nextRow >= maxRows) {
                                nextRow = 0;
                                nextCol = pos.col + 1;
                            }

                            moveItem(occupantId, { row: nextRow, col: nextCol });
                        }
                    };

                    moveItem(itemId, newPosition);

                    const newAllUserItems = activeUserId
                        ? { ...allUserItems, [activeUserId]: newItems }
                        : allUserItems;

                    return {
                        items: newItems,
                        allUserItems: newAllUserItems,
                    };
                });
            },
        }),
        {
            name: 'file-system-storage',
            // Persistir apenas allUserItems para não duplicar dados
            partialize: (state) => ({
                allUserItems: state.allUserItems,
            }),
        }
    )
);