import { useState, useCallback, useEffect } from 'react';
import styles from './ExplorerApp.module.css';
import ExplorerToolbar from './ExplorerToobar';
import FolderContentView from './FolderContentView';
import ShortcutCard from './ShortcutCard';
import type { cardContent } from './ShortcutCard';
import { useFileSystemStore } from '../../../stores/useFileSystemStore';
import { useWindowStore, useWindowContext } from '../../../stores/useWindowStore';
import { useSystemStore } from '../../../stores/useSystemStore';
import startMenuPrograms from '../../../assets/icons/start-menu-programs.webp'
import programs from '../../../assets/icons/programs.webp'
import search from '../../../assets/icons/search.webp'
import myComputer from '../../../assets/icons/my-computer.webp'
import myPictures from '../../../assets/icons/my-pictures.webp'
import myMusic from '../../../assets/icons/my-music.webp'
import myVideos from '../../../assets/icons/my-videos.webp'
import newFolder from '../../../assets/icons/new-folder.webp'
import publishToInternet from '../../../assets/icons/publish-to-web.webp'
import shareFolder from '../../../assets/icons/shared-folder.webp'
import folderIcon from '../../../assets/icons/folder.webp'
import trashBinIcon from '../../../assets/icons/trash-bin.webp'

const card1: cardContent[] = [
  {
    icon: startMenuPrograms,
    description: 'Esconder o conteúdo desse drive'
  },
  {
    icon: programs,
    description: 'Adicionar ou remover programas'
  },
  {
    icon: search,
    description: 'Procurar por arquivos ou pastas'
  }
]

const card2: cardContent[] = [
  {
    icon: myComputer,
    description: 'Meu Computador'
  },
  {
    icon: myPictures,
    description: 'Minhas Imagens'
  },
  {
    icon: myMusic,
    description: 'Minhas Músicas'
  },
  {
    icon: myVideos,
    description: 'Minhas Vídeos'
  }
]

const card3: cardContent[] = [
  {
    icon: newFolder,
    description: 'Nova Pasta'
  },
  {
    icon: publishToInternet,
    description: 'Publicar na Internet'
  },
  {
    icon: shareFolder,
    description: 'Compartilhar Pasta'
  }
]

export default function ExplorerApp() {
  const { instanceId } = useWindowContext();
  // Seletor otimizado: só re-renderiza quando o initialFolderId DESTA janela muda
  const initialFolderId = useWindowStore(
    state => state.openWindows.find(w => w.id === instanceId)?.initialFolderId
  );
  const initialFolder = initialFolderId || 'root';

  // Mobile Detection
  const isMobile = useSystemStore(state => state.isMobile);
  const isSmallScreen = useSystemStore(state => state.isSmallScreen);

  // Define se mobile/tela pequena (para lógica de toggle)
  const isCompact = isMobile || isSmallScreen;

  // Sidebar começa fechada no mobile, aberta no desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isCompact);

  const [currentFolderId, setCurrentFolderId] = useState(initialFolder);
  const [history, setHistory] = useState<string[]>([initialFolder]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const getPath = useFileSystemStore(state => state.getPath);
  const getItem = useFileSystemStore(state => state.getItem);
  const updateWindowMeta = useWindowStore(state => state.updateWindowMeta);

  const currentPath = getPath(currentFolderId);
  const currentFolder = getItem(currentFolderId);

  // Atualiza título e ícone da janela quando a pasta muda
  useEffect(() => {
    if (currentFolder) {
      updateWindowMeta(instanceId, {
        title: currentFolder.name,
        iconUrl: currentFolder.iconUrl || folderIcon,
      });
    }
  }, [currentFolder, instanceId, updateWindowMeta]);

  const navigate = useCallback((folderId: string) => {
    console.log('[NAV] navigate to:', folderId);
    console.log('[NAV] before:', { history, historyIndex });
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    console.log('[NAV] after:', { newHistory, newIndex: newHistory.length - 1 });
  }, [history, historyIndex]);

  const goBack = useCallback(() => {
    console.log('[NAV] goBack');
    console.log('[NAV] state:', { history, historyIndex, canGoBack: historyIndex > 0 });
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(history[newIndex]);
      console.log('[NAV] going to index:', newIndex, 'folder:', history[newIndex]);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    console.log('[NAV] goForward');
    console.log('[NAV] state:', { history, historyIndex, canGoForward: historyIndex < history.length - 1 });
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentFolderId(history[newIndex]);
      console.log('[NAV] going to index:', newIndex, 'folder:', history[newIndex]);
    }
  }, [history, historyIndex]);

  const goUp = useCallback(() => {
    if (currentFolder?.parentId) {
      navigate(currentFolder.parentId);
    }
  }, [currentFolder, navigate]);

  const emptyRecycleBin = useFileSystemStore(state => state.emptyRecycleBin);
  const restoreItem = useFileSystemStore(state => state.restoreItem);
  const getItemsByParent = useFileSystemStore(state => state.getItemsByParent);

  // Garante sidebar aberta no desktop
  useEffect(() => {
    if (!isCompact) setIsSidebarOpen(true);
  }, [isCompact]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className={styles.explorerContainer}>
      <ExplorerToolbar
        iconUrl={currentFolder?.iconUrl || folderIcon}
        currentPath={currentPath}
        canGoBack={historyIndex > 0}
        canGoForward={historyIndex < history.length - 1}
        canGoUp={!!currentFolder?.parentId}
        onBack={goBack}
        onForward={goForward}
        onUp={goUp}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        isMobile={isCompact}
      />

      <div className={styles.mainArea}>
        {/* Sidebar Esquerda (Tarefas) - Controlada pelo botão Pastas */}
        {isSidebarOpen && (
          <div className={styles.sidebar}>
            {currentFolderId === 'recycle-bin' ? (
              <ShortcutCard
                title="Tarefas da Lixeira"
                content={[
                  {
                    icon: trashBinIcon,
                    description: 'Esvaziar a Lixeira',
                    action: () => {
                      if (window.confirm('Tem certeza que deseja apagar todos os itens da lixeira permanentemente?')) {
                        emptyRecycleBin();
                      }
                    }
                  },
                  {
                    icon: folderIcon,
                    description: 'Restaurar todos os itens',
                    action: () => {
                      const items = getItemsByParent('recycle-bin');
                      items.forEach(item => restoreItem(item.id));
                    }
                  }
                ]}
              />
            ) : (
              <ShortcutCard title="Tarefas" content={card1} />
            )}
            <ShortcutCard title="Arquivos" content={card2} />
            <ShortcutCard title="Ações" content={card3} />
          </div>
        )}

        {/* Área de Conteúdo (Ícones) */}
        <FolderContentView folderId={currentFolderId} onNavigate={navigate} />
      </div>
    </div>
  );
}