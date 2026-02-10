import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './NotepadApp.module.css';
import NotepadMenuBar from './NotepadMenuBar';
import { useWindowContext } from '../../../stores/useWindowStore';
import { useWindowStore } from '../../../stores/useWindowStore';
import { useFileSystemStore } from '../../../stores/useFileSystemStore';

export default function NotepadApp() {
    const { instanceId } = useWindowContext();

    // Busca initialFileId desta janela
    const initialFileId = useWindowStore(
        state => state.openWindows.find(w => w.id === instanceId)?.initialFileId
    );
    const updateWindowMeta = useWindowStore(state => state.updateWindowMeta);

    // File system
    const getItem = useFileSystemStore(state => state.getItem);
    const createFile = useFileSystemStore(state => state.createFile);
    const updateFileContent = useFileSystemStore(state => state.updateFileContent);

    // Estado local
    const [content, setContent] = useState('');
    const [fileName, setFileName] = useState('Sem título');
    const [fileId, setFileId] = useState<string | null>(null);
    const [wordWrap, setWordWrap] = useState(true);
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Carrega arquivo inicial se existir
    useEffect(() => {
        if (initialFileId) {
            const file = getItem(initialFileId);
            if (file) {
                setContent(file.content || '');
                setFileName(file.name);
                setFileId(initialFileId);
            }
        }
    }, [initialFileId, getItem]);

    // Atualiza título da janela
    useEffect(() => {
        updateWindowMeta(instanceId, {
            title: `${fileName} - Bloco de Notas`,
        });
    }, [fileName, instanceId, updateWindowMeta]);

    // Calcula posição do cursor
    const updateCursorPosition = useCallback(() => {
        const textarea = textAreaRef.current;
        if (!textarea) return;

        const text = textarea.value.substring(0, textarea.selectionStart);
        const lines = text.split('\n');
        setCursorPos({
            line: lines.length,
            col: lines[lines.length - 1].length + 1,
        });
    }, []);

    // Salvar arquivo no file system
    const handleSave = useCallback(() => {
        if (fileId) {
            // Atualiza arquivo existente
            updateFileContent(fileId, content);
        } else {
            // Cria novo arquivo em "Meus Documentos"
            const name = fileName === 'Sem título' ? 'Sem título.txt' : fileName;
            const newId = createFile('my-documents', name, 'notepad', content, 'txt');
            setFileId(newId);
            setFileName(name);
        }
    }, [fileId, content, fileName, createFile, updateFileContent]);

    // Salvar como (sempre cria novo)
    const handleSaveAs = useCallback(() => {
        const name = prompt('Nome do arquivo:', fileName) || fileName;
        const finalName = name.endsWith('.txt') ? name : `${name}.txt`;
        const newId = createFile('my-documents', finalName, 'notepad', content, 'txt');
        setFileId(newId);
        setFileName(finalName);
    }, [fileName, content, createFile]);

    // Novo arquivo
    const handleNew = useCallback(() => {
        setContent('');
        setFileName('Sem título');
        setFileId(null);
        setCursorPos({ line: 1, col: 1 });
    }, []);

    // Toggle word wrap
    const handleToggleWordWrap = useCallback(() => {
        setWordWrap(prev => !prev);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const textarea = textAreaRef.current;
        if (!textarea) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        handleSave();
                        break;
                    case 'n':
                        e.preventDefault();
                        handleNew();
                        break;
                }
            }
        };

        textarea.addEventListener('keydown', handleKeyDown);
        return () => textarea.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, handleNew]);

    return (
        <div className={styles.notepadContainer}>
            <NotepadMenuBar
                onNew={handleNew}
                onSave={handleSave}
                onSaveAs={handleSaveAs}
                wordWrap={wordWrap}
                onToggleWordWrap={handleToggleWordWrap}
                textAreaRef={textAreaRef}
            />

            <textarea
                ref={textAreaRef}
                className={styles.textArea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyUp={updateCursorPosition}
                onClick={updateCursorPosition}
                wrap={wordWrap ? 'soft' : 'off'}
                spellCheck={false}
            />

            <div className={styles.statusBar}>
                <span className={styles.statusBarItem}>
                    Ln {cursorPos.line}, Col {cursorPos.col}
                </span>
            </div>
        </div>
    );
}
