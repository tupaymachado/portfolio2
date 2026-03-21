import { lazy } from 'react';
import type { ProgramDefinition } from '../types/program';

// ============================================================================
// IMPORTS DE ÍCONES
// ============================================================================
import explorerIcon from '../assets/icons/explorer.webp';
import myComputerIcon from '../assets/icons/my-computer.webp';
import notepadIcon from '../assets/icons/notepad.webp';
import minesweeperIcon from '../assets/icons/minesweeper.webp';
import winampIcon from '../assets/icons/winamp.webp';
import msnIcon from '../assets/icons/msn.webp';
import solitaireIcon from '../assets/icons/solitaire.webp';
import myDocumentsIcon from '../assets/icons/my-documents.webp';
import myPicturesIcon from '../assets/icons/my-pictures.webp';
import myMusicIcon from '../assets/icons/my-music.webp';
import myComputerIconLg from '../assets/icons/my-computer.webp';
import myNetworkIcon from '../assets/icons/my-network-places.webp';
import controlPanelIcon from '../assets/icons/control-panel.webp';
import searchIcon from '../assets/icons/search.webp';
import runIcon from '../assets/icons/run.webp';
import msnFigure from '../assets/icons/msn-online.webp';
import errorIcon from '../assets/icons/app.webp';
import paintIcon from '../assets/icons/paint.webp';
import ie6Icon from '../assets/icons/ie6.webp';

// ============================================================================
// COMPONENTES LEVES (Factory Functions)
// ============================================================================
// Estes componentes são definidos inline como factory functions.
// O JSX só é criado quando a janela realmente abre.
// O código ainda está no bundle principal, mas é leve.

import NotepadApp from '../components/apps/NotepadApp/NotepadApp';
import MinesweeperApp from '../components/apps/MinesweeperApp/MinesweeperApp';
import AboutMeApp from '../components/apps/AboutMeApp/AboutMeApp';
const LazyPaintApp = lazy(() => import('../components/apps/PaintApp/PaintApp'));
const LazyIEApp = lazy(() => import('../components/apps/IEApp/IEApp'));
const LazyKlondikeBoard = lazy(() => import('../components/apps/SolitaireApp/klondike/components/KlondikeBoard'));
const LazyWebampApp = lazy(() => import('../components/apps/WebampApp/WebampApp'));
const LazyMsnApp = lazy(() => import('../components/apps/MsnApp/MsnApp'));
const LazyMsnChatWindow = lazy(() => import('../components/apps/MsnApp/MsnChatWindow'));
import ErrorApp from '../components/apps/ErrorApp/ErrorApp';

// Preload functions. Call these early to warm up the chunk download.
export const preloadAll = () => {
  import('../components/apps/SolitaireApp/klondike/components/KlondikeBoard');
  import('../components/apps/WebampApp/WebampApp');
  import('../components/apps/MsnApp/MsnApp');
  import('../components/apps/MsnApp/MsnChatWindow');
  import('../components/apps/ExplorerApp/ExplorerApp');
};

const LazyExplorerApp = lazy(() => import('../components/apps/ExplorerApp/ExplorerApp'));

// ============================================================================
// DEFINIÇÃO DOS PROGRAMAS
// ============================================================================
// Cada programa agora tem seu component como:
// - Factory function: () => <Component /> (para componentes leves)
// - Lazy component: lazy(() => import(...)) (para componentes pesados)

export const PROGRAMS: ProgramDefinition[] = [
  {
    id: 'msn',
    name: 'MSN Messenger',
    iconUrl: msnIcon,
    component: LazyMsnApp,
    defaultSize: { width: 340, height: 500 },
    minSize: { width: 300, height: 400 },
    isResizable: true,
  },
  {
    id: 'msn-chat',
    name: 'Bate-papo do MSN',
    iconUrl: msnFigure,
    component: LazyMsnChatWindow,
    defaultSize: { width: 500, height: 450 },
    minSize: { width: 400, height: 350 },
    isResizable: true,
    hideFromStartMenu: true,
  },
  {
    id: 'explorer',
    name: 'Windows Explorer',
    iconUrl: explorerIcon,
    // React.lazy: código é baixado sob demanda (code-splitting)
    component: LazyExplorerApp,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'about-me',
    name: 'Sobre Mim',
    iconUrl: myComputerIcon,
    component: AboutMeApp,
    hideFromStartMenu: true,
    defaultSize: { width: 450, height: 576 },
    minSize: { width: 380, height: 576 },
    isResizable: true,
  },
  {
    id: 'ie',
    name: 'Internet Explorer',
    iconUrl: ie6Icon,
    component: LazyIEApp,
    defaultSize: { width: 1024, height: 700 },
    minSize: { width: 500, height: 400 },
    isResizable: true,
  },
  {
    id: 'paint',
    name: 'Paint',
    iconUrl: paintIcon,
    component: LazyPaintApp,
    defaultSize: { width: 820, height: 640 },
    minSize: { width: 500, height: 400 },
    isResizable: true,
  },
  {
    id: 'notepad',
    name: 'Bloco de Notas',
    iconUrl: notepadIcon,
    component: () => <NotepadApp />,
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 250, height: 150 },
    isResizable: true,
  },
  {
    id: 'minesweeper',
    name: 'Campo Minado',
    iconUrl: minesweeperIcon,
    component: () => <MinesweeperApp />,
    isResizable: false,
    defaultSize: { width: 300, height: 420 },
    minSize: { width: 280, height: 370 },
  },
  {
    id: 'solitaire',
    name: 'Paciência',
    iconUrl: solitaireIcon,
    component: LazyKlondikeBoard,
    isResizable: true,
    defaultSize: { width: 800, height: 660 },
    minSize: { width: 360, height: 500 },
  },
  {
    id: 'winamp',
    name: 'Winamp',
    iconUrl: winampIcon,
    component: LazyWebampApp,
    isResizable: false,
    chromeless: true,
  },
  {
    id: 'error',
    name: 'Erro Restrito',
    iconUrl: errorIcon,
    component: () => <ErrorApp />,
    isResizable: false,
    chromeless: true,
    hideFromStartMenu: true,
    defaultSize: { width: 1, height: 1 },
    minSize: { width: 1, height: 1 },
  }
];

// Map para lookup O(1) de programas por ID
export const PROGRAMS_MAP = new Map(PROGRAMS.map(p => [p.id, p]));

// Links do Sistema (coluna da direita do Start Menu)
export interface SystemLink {
  id: string;
  name: string;
  iconUrl: string;
  type: 'folder' | 'program';
  targetId: string;
}

export const SYSTEM_LINKS: SystemLink[] = [
  // Primeiros 4 são bold (via CSS :nth-child)
  { id: 'sl-my-documents', name: 'Meus Documentos', iconUrl: myDocumentsIcon, type: 'folder', targetId: 'my-documents' },
  { id: 'sl-my-pictures', name: 'Minhas Imagens', iconUrl: myPicturesIcon, type: 'folder', targetId: 'my-pictures' },
  { id: 'sl-my-music', name: 'Minha Música', iconUrl: myMusicIcon, type: 'folder', targetId: 'my-music' },
  { id: 'sl-my-computer', name: 'Meu Computador', iconUrl: myComputerIconLg, type: 'folder', targetId: 'root' },
  { id: 'sl-my-network', name: 'Meus Locais de Rede', iconUrl: myNetworkIcon, type: 'program', targetId: 'error' },
  { id: 'sl-control-panel', name: 'Painel de Controle', iconUrl: controlPanelIcon, type: 'program', targetId: 'error' },
  { id: 'sl-search', name: 'Pesquisar', iconUrl: searchIcon, type: 'program', targetId: 'error' },
  { id: 'sl-run', name: 'Executar...', iconUrl: runIcon, type: 'program', targetId: 'error' },
];
