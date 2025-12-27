import { create } from 'zustand';
import type { FileSystemItem, FileSystemState } from '../types/fileSystem';

interface FileSystemStore extends FileSystemState {
    // Ações
    getItemsByParent: (parentId: string) => FileSystemItem[];
    updateItemGridPosition: (itemId: string, newPosition: { row: number; col: number }, maxRows?: number) => void;
    // Futuras ações: createItem, deleteItem, renameItem, moveItem...
}

// Dados Iniciais (O "Formato" do seu HD)
const INITIAL_ITEMS: Record<string, FileSystemItem> = {
    // --- PASTAS DO SISTEMA ---
    'root': {
        id: 'root',
        parentId: '',
        name: 'C:',
        type: 'folder',
        createdAt: Date.now(),
    },
    'desktop': {
        id: 'desktop',
        parentId: 'root', // Filha de C:
        name: 'Desktop',
        type: 'folder',
        createdAt: Date.now(),
    },
    'my-documents': {
        id: 'my-documents',
        parentId: 'root',
        name: 'Meus Documentos',
        type: 'folder',
        createdAt: Date.now(),
    },

    // --- ITENS DO DESKTOP (Seus atalhos atuais convertidos para "Arquivos") ---
    'shortcut-1': {
        id: 'shortcut-1',
        parentId: 'desktop', // Vivem na pasta Desktop
        name: 'Sobre Mim',
        type: 'file',
        programId: 'about-me', // Aponta para o ID do programa em src/data/programs
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
        gridPosition: { row: 0, col: 1 },
        createdAt: Date.now(),
    },
};

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
    items: INITIAL_ITEMS,
    rootId: 'root',

    getItemsByParent: (parentId: string) => {
        const { items } = get();
        return Object.values(items).filter(item => item.parentId === parentId);
    },

    updateItemGridPosition: (itemId, newPosition, maxRows = 10) => {
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

            return { items: newItems };
        });
    },
}));