import { useState, useCallback, useEffect } from 'react';
import styles from './ExplorerApp.module.css';
import ExplorerToolbar from './ExplorerToobar';
import FolderContentView from './FolderContentView';
import ShortcutCard from './ShortcutCard';
import type { cardContent } from './ShortcutCard';
import { useFileSystemStore } from '../../../stores/useFileSystemStore';
import { useWindowStore, useWindowContext } from '../../../stores/useWindowStore';
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
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [history, setHistory] = useState<string[]>(['root']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const getPath = useFileSystemStore(state => state.getPath);
  const getItem = useFileSystemStore(state => state.getItem);
  const updateWindowMeta = useWindowStore(state => state.updateWindowMeta);
  const { instanceId } = useWindowContext();

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
      />

      <div className={styles.mainArea}>
        {/* Sidebar Esquerda (Tarefas) */}
        <div className={styles.sidebar}>
          <ShortcutCard title="Tarefas " content={card1} />
          <ShortcutCard title="Arquivos" content={card2} />
          <ShortcutCard title="Ações" content={card3} />
        </div>

        {/* Área de Conteúdo (Ícones) */}
        <FolderContentView folderId={currentFolderId} onNavigate={navigate} />
      </div>
    </div>
  );
}