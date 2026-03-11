import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

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
            label: t('notepad.menu.file'),
            items: [
                { label: t('notepad.menu.new'), onClick: onNew, shortcut: 'Ctrl+N' },
                { separator: true },
                { label: t('notepad.menu.save'), onClick: onSave, shortcut: 'Ctrl+S' },
                { label: t('notepad.menu.saveAs'), onClick: onSaveAs },
            ],
        },
        {
            label: t('notepad.menu.edit'),
            items: [
                { label: t('notepad.menu.undo'), onClick: () => execCommand('undo'), shortcut: 'Ctrl+Z' },
                { separator: true },
                { label: t('notepad.menu.cut'), onClick: () => execCommand('cut'), shortcut: 'Ctrl+X' },
                { label: t('notepad.menu.copy'), onClick: () => execCommand('copy'), shortcut: 'Ctrl+C' },
                { label: t('notepad.menu.paste'), onClick: () => execCommand('paste'), shortcut: 'Ctrl+V' },
                { separator: true },
                { label: t('notepad.menu.selectAll'), onClick: () => execCommand('selectAll'), shortcut: 'Ctrl+A' },
            ],
        },
        {
            label: t('notepad.menu.format'),
            items: [
                { label: t('notepad.menu.wordWrap'), onClick: onToggleWordWrap, checked: wordWrap },
            ],
        },
    ];

    return <AppMenuBar items={items} />;
}
