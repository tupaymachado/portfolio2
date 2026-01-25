import styles from './FolderContentView.module.css';
import { useFileSystemStore } from '../../../stores/useFileSystemStore';
import { useWindowStore } from '../../../stores/useWindowStore';
import DesktopIcon from '../../DesktopIcon/DesktopIcon';
import { PROGRAMS } from '../../../data/programs';

// Imports de ícones para fallback
import folderIcon from '../../../assets/icons/folder.webp';
import appIcon from '../../../assets/icons/app.webp';

interface FolderContentViewProps {
    folderId: string;
    onNavigate: (folderId: string) => void;
}

export default function FolderContentView({ folderId, onNavigate }: FolderContentViewProps) {
    const getItemsByParent = useFileSystemStore(state => state.getItemsByParent);
    const openWindow = useWindowStore(state => state.openWindow);

    const items = getItemsByParent(folderId);

    const handleDoubleClick = (item: { id: string; type: string; programId?: string }) => {
        if (item.type === 'folder') {
            onNavigate(item.id);
        } else if (item.programId) {
            openWindow(item.programId);
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

    return (
        <div className={styles.contentView}>
            {items.map(item => (
                <div key={item.id} className={styles.iconWrapper}>
                    <DesktopIcon
                        label={item.name}
                        iconUrl={getIconUrl(item)}
                        onClick={() => { }}
                        onDoubleClick={() => handleDoubleClick(item)}
                        variant="explorer"
                    />
                </div>
            ))}
            {items.length === 0 && (
                <p className={styles.emptyMessage}>Esta pasta está vazia.</p>
            )}
        </div>
    );
}
