import AppMenuBar from '../../AppMenuBar/AppMenuBar';
import type { AppMenuBarItem } from '../../AppMenuBar/AppMenuBar';

interface NotepadMenuBarProps {
    onNew: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    wordWrap: boolean;
    onToggleWordWrap: () => void;
    textAreaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function NotepadMenuBar({
    onNew,
    onSave,
    onSaveAs,
    wordWrap,
    onToggleWordWrap,
    textAreaRef,
}: NotepadMenuBarProps) {
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
                navigator.clipboard.readText().then(text => {
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    textarea.value = value.substring(0, start) + text + value.substring(end);
                    textarea.selectionStart = textarea.selectionEnd = start + text.length;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }).catch(() => {
                    document.execCommand('paste');
                });
                break;
            case 'undo':
                document.execCommand('undo');
                break;
        }
    };

    const items: AppMenuBarItem[] = [
        {
            label: 'Arquivo',
            items: [
                { label: 'Novo', onClick: onNew, shortcut: 'Ctrl+N' },
                { separator: true },
                { label: 'Salvar', onClick: onSave, shortcut: 'Ctrl+S' },
                { label: 'Salvar como...', onClick: onSaveAs },
            ],
        },
        {
            label: 'Editar',
            items: [
                { label: 'Desfazer', onClick: () => execCommand('undo'), shortcut: 'Ctrl+Z' },
                { separator: true },
                { label: 'Recortar', onClick: () => execCommand('cut'), shortcut: 'Ctrl+X' },
                { label: 'Copiar', onClick: () => execCommand('copy'), shortcut: 'Ctrl+C' },
                { label: 'Colar', onClick: () => execCommand('paste'), shortcut: 'Ctrl+V' },
                { separator: true },
                { label: 'Selecionar tudo', onClick: () => execCommand('selectAll'), shortcut: 'Ctrl+A' },
            ],
        },
        {
            label: 'Formatar',
            items: [
                { label: 'Quebra automática de linha', onClick: onToggleWordWrap, checked: wordWrap },
            ],
        },
    ];

    return <AppMenuBar items={items} />;
}
