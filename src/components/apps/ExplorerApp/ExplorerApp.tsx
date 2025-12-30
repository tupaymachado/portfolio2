import styles from './ExplorerApp.module.css';
import ExplorerToolbar from './ExplorerToobar';
import ShortcutCard from './ShortcutCard';
import type { cardContent } from './ShortcutCard';
import startMenuPrograms from '../../../assets/icons/start-menu-programs.png'
import programs from '../../../assets/icons/programs.png'
import search from '../../../assets/icons/search.png'
import myComputer from '../../../assets/icons/my-computer.png'
import myPictures from '../../../assets/icons/my-pictures.png'
import myMusic from '../../../assets/icons/my-music.png'
import myVideos from '../../../assets/icons/my-videos.png'
import newFolder from '../../../assets/icons/new-folder.png'
import publishToInternet from '../../../assets/icons/publish-to-web.png'
import shareFolder from '../../../assets/icons/shared-folder.png'

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
  return (
    <div className={styles.explorerContainer}>
      <ExplorerToolbar />

      <div className={styles.mainArea}>
        {/* Sidebar Esquerda (Tarefas) */}
        <div className={styles.sidebar}>
          <ShortcutCard title="Tarefas " content={card1} />
          <ShortcutCard title="Arquivos" content={card2} />
          <ShortcutCard title="Ações" content={card3} />
        </div>

        {/* Área de Conteúdo (Ícones) */}
        <div className={styles.contentView}>
          {/* Aqui faremos o map() dos arquivos, igual ao Desktop! */}
          <p style={{ padding: 20 }}>Conteúdo da pasta aqui...</p>
        </div>
      </div>
    </div>
  );
}