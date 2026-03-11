import { useTranslation } from 'react-i18next';
import styles from './FolderContentView.module.css';
import { useFileSystemStore } from '../../../stores/useFileSystemStore';
import { useWindowStore } from '../../../stores/useWindowStore';
import DesktopIcon from '../../DesktopIcon/DesktopIcon';
import { PROGRAMS } from '../../../data/programs';
import { getDisplayName } from '../../../utils/fileSystemNames';

// Imports de ícones para fallback
import folderIcon from '../../../assets/icons/folder.webp';
import appIcon from '../../../assets/icons/app.webp';

interface FolderContentViewProps {
    folderId: string;
    onNavigate: (folderId: string) => void;
}

export default function FolderContentView({ folderId, onNavigate }: FolderContentViewProps) {
    const { t } = useTranslation();
    const getItemsByParent = useFileSystemStore(state => state.getItemsByParent);
    const deleteItem = useFileSystemStore(state => state.deleteItem);
    const restoreItem = useFileSystemStore(state => state.restoreItem);
    const openWindow = useWindowStore(state => state.openWindow);
    const openContextMenu = useWindowStore(state => state.openContextMenu);
    const closeContextMenu = useWindowStore(state => state.closeContextMenu);

    const items = getItemsByParent(folderId);

    const handleDoubleClick = (item: { id: string; type: string; targetId?: string; programId?: string; extension?: string; content?: string }) => {
        if (item.type === 'folder') {
            // Atalho de pasta: navega para o destino; pasta normal: navega para si mesma
            onNavigate(item.targetId ?? item.id);
        } else if (item.extension === 'url' && item.content) {
            window.open(item.content, '_blank', 'noopener,noreferrer');
        } else if (item.programId) {
            openWindow(item.programId, item.content !== undefined ? { fileId: item.id } : undefined);
        }
    };

    const getIconUrl = (item: { type: string; iconUrl?: string; programId?: string }) => {
        // 1. Ícone customizado do próprio item (prioridade máxima)
        if (item.iconUrl) {
            return item.iconUrl;
        }

        // 2. Se for pasta, usa ícone padrão de pasta
        if (item.type === 'folder') {
            return folderIcon;
        }

        // 3. Se tiver programId, busca o ícone do programa
        if (item.programId) {
            const program = PROGRAMS.find(p => p.id === item.programId);
            return program?.iconUrl || appIcon;
        }

        // 4. Fallback
        return appIcon;
    };

    const handleContextMenu = (e: React.MouseEvent, item: { id: string; name: string }) => {
        e.preventDefault();
        e.stopPropagation();

        const menuItems = [];

        const displayName = getDisplayName(item.id, item.name, t);
        if (folderId === 'recycle-bin') {
            menuItems.push({
                label: t('explorer.contextMenu.restore'),
                onClick: () => restoreItem(item.id)
            });
            menuItems.push({
                label: t('explorer.contextMenu.deleteForever'),
                onClick: () => {
                    if (window.confirm(t('explorer.contextMenu.confirmDelete', { name: displayName }))) {
                        deleteItem(item.id);
                    }
                }
            });
        } else {
            menuItems.push({
                label: t('explorer.contextMenu.delete'),
                onClick: () => deleteItem(item.id)
            });
        }

        openContextMenu(e.clientX, e.clientY, menuItems);
    };

    return (
        <div className={styles.contentView} onClick={closeContextMenu}>
            {items.map(item => (
                <div key={item.id} className={styles.iconWrapper} onContextMenu={(e) => handleContextMenu(e, item)}>
                    <DesktopIcon
                        label={getDisplayName(item.id, item.name, t)}
                        iconUrl={getIconUrl(item)}
                        onClick={() => { }}
                        onDoubleClick={() => handleDoubleClick(item)}
                        variant="explorer"
                    />
                </div>
            ))}
            {items.length === 0 && (
                <p className={styles.emptyMessage}>{t('explorer.emptyFolder')}</p>
            )}
        </div>
    );
}
