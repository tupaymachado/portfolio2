import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './NotepadApp.module.css';

interface NotepadMenuBarProps {
    onNew: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    wordWrap: boolean;
    onToggleWordWrap: () => void;
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

interface MenuState {
    openMenu: string | null;
}

export default function NotepadMenuBar({
    onNew,
    onSave,
    onSaveAs,
    wordWrap,
    onToggleWordWrap,
    textAreaRef,
}: NotepadMenuBarProps) {
    const [menuState, setMenuState] = useState<MenuState>({ openMenu: null });
    const menuBarRef = useRef<HTMLDivElement>(null);

    const closeMenu = useCallback(() => {
        setMenuState({ openMenu: null });
    }, []);

    // Fechar menu ao clicar fora
    useEffect(() => {
        if (!menuState.openMenu) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuState.openMenu, closeMenu]);

    const toggleMenu = (menu: string) => {
        setMenuState(prev => ({
            openMenu: prev.openMenu === menu ? null : menu,
        }));
    };

    const handleAction = (action: () => void) => {
        action();
        closeMenu();
    };

    // Ações de edição usando o textarea diretamente
    const execCommand = (command: string) => {
        const textarea = textAreaRef.current;
        if (!textarea) return;
        textarea.focus();

        switch (command) {
            case 'selectAll':
                textarea.select();
                break;
            case 'cut':
                document.execCommand('cut');
                break;
            case 'copy':
                document.execCommand('copy');
                break;
            case 'paste':
                // Clipboard API fallback
                navigator.clipboard.readText().then(text => {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    textarea.value = value.substring(0, start) + text + value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + text.length;
                    // Dispara evento de input para atualizar o state
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }).catch(() => {
                    document.execCommand('paste');
                });
                break;
            case 'undo':
                document.execCommand('undo');
                break;
        }
        closeMenu();
    };

    return (
        <div className={styles.menuBar} ref={menuBarRef}>
            {/* Arquivo */}
            <button
                className={`${styles.menuItem} ${menuState.openMenu === 'file' ? styles.menuItemActive : ''}`}
                onClick={() => toggleMenu('file')}
                onMouseEnter={() => menuState.openMenu && toggleMenu('file')}
            >
                Arquivo
                {menuState.openMenu === 'file' && (
                    <div className={styles.menuDropdown}>
                        <button className={styles.menuDropdownItem} onClick={() => handleAction(onNew)}>
                            Novo <span className={styles.menuShortcut}>Ctrl+N</span>
                        </button>
                        <div className={styles.menuSeparator} />
                        <button className={styles.menuDropdownItem} onClick={() => handleAction(onSave)}>
                            Salvar <span className={styles.menuShortcut}>Ctrl+S</span>
                        </button>
                        <button className={styles.menuDropdownItem} onClick={() => handleAction(onSaveAs)}>
                            Salvar como...
                        </button>
                    </div>
                )}
            </button>

            {/* Editar */}
            <button
                className={`${styles.menuItem} ${menuState.openMenu === 'edit' ? styles.menuItemActive : ''}`}
                onClick={() => toggleMenu('edit')}
                onMouseEnter={() => menuState.openMenu && toggleMenu('edit')}
            >
                Editar
                {menuState.openMenu === 'edit' && (
                    <div className={styles.menuDropdown}>
                        <button className={styles.menuDropdownItem} onClick={() => execCommand('undo')}>
                            Desfazer <span className={styles.menuShortcut}>Ctrl+Z</span>
                        </button>
                        <div className={styles.menuSeparator} />
                        <button className={styles.menuDropdownItem} onClick={() => execCommand('cut')}>
                            Recortar <span className={styles.menuShortcut}>Ctrl+X</span>
                        </button>
                        <button className={styles.menuDropdownItem} onClick={() => execCommand('copy')}>
                            Copiar <span className={styles.menuShortcut}>Ctrl+C</span>
                        </button>
                        <button className={styles.menuDropdownItem} onClick={() => execCommand('paste')}>
                            Colar <span className={styles.menuShortcut}>Ctrl+V</span>
                        </button>
                        <div className={styles.menuSeparator} />
                        <button className={styles.menuDropdownItem} onClick={() => execCommand('selectAll')}>
                            Selecionar tudo <span className={styles.menuShortcut}>Ctrl+A</span>
                        </button>
                    </div>
                )}
            </button>

            {/* Formatar */}
            <button
                className={`${styles.menuItem} ${menuState.openMenu === 'format' ? styles.menuItemActive : ''}`}
                onClick={() => toggleMenu('format')}
                onMouseEnter={() => menuState.openMenu && toggleMenu('format')}
            >
                Formatar
                {menuState.openMenu === 'format' && (
                    <div className={styles.menuDropdown}>
                        <button className={styles.menuDropdownItem} onClick={() => handleAction(onToggleWordWrap)}>
                            <span className={styles.menuCheck}>{wordWrap ? '✓' : '\u00A0\u00A0'}</span>
                            Quebra automática de linha
                        </button>
                    </div>
                )}
            </button>
        </div>
    );
}
