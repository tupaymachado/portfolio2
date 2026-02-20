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

// ============================================================================
// COMPONENTES LEVES (Factory Functions)
// ============================================================================
// Estes componentes são definidos inline como factory functions.
// O JSX só é criado quando a janela realmente abre.
// O código ainda está no bundle principal, mas é leve.

import NotepadApp from '../components/apps/NotepadApp/NotepadApp';
const AboutMeContent = () => <div style={{ padding: '10px' }}><h1>Sobre Mim</h1><p>Desenvolvedor apaixonado...</p></div>;
const MyProjectsContent = () => <div style={{ padding: '10px' }}><h1>Meus Projetos</h1><p>Cards dos projetos aqui...</p></div>;
import MinesweeperApp from '../components/apps/MinesweeperApp/MinesweeperApp';
const WinampContent = () => <div style={{ padding: '10px' }}>Winamp em breve!</div>;
const MsnContent = () => <div style={{ padding: '10px' }}>MSN em breve!</div>;
const LazyKlondikeBoard = lazy(() => import('../components/apps/SolitaireApp/klondike/components/KlondikeBoard'));

// ============================================================================
// COMPONENTES PESADOS (React.lazy - Code Splitting)
// ============================================================================
// Estes componentes são carregados sob demanda usando React.lazy.
// O Vite cria chunks separados para eles no build.
// O código só é baixado quando a janela é aberta pela primeira vez.
//
// COMO FUNCIONA:
// 1. lazy() recebe uma função que retorna import()
// 2. import() é um "dynamic import" - retorna Promise do módulo
// 3. O Vite/Webpack vê import() e extrai o código para um chunk separado
// 4. Quando o componente precisa renderizar, React carrega o chunk
// 5. Enquanto carrega, Suspense mostra um fallback

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
    // Factory function: JSX só é criado quando a janela abre
    component: () => <MsnContent />,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'explorer',
    name: 'Windows Explorer',
    iconUrl: explorerIcon,
    // React.lazy: código é baixado sob demanda (code-splitting)
    // Este é o componente mais pesado do projeto
    component: LazyExplorerApp,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'about-me',
    name: 'Sobre Mim',
    iconUrl: myComputerIcon,
    component: () => <AboutMeContent />,
    defaultSize: { width: 550, height: 450 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'my-projects',
    name: 'Meus Projetos',
    iconUrl: myComputerIcon,
    component: () => <MyProjectsContent />,
    defaultSize: { width: 700, height: 500 },
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
    name: 'Solitaire',
    iconUrl: solitaireIcon,
    component: LazyKlondikeBoard,
    isResizable: true,
    defaultSize: { width: 800, height: 660 },
    minSize: { width: 700, height: 560 },
  },
  {
    id: 'winamp',
    name: 'Winamp',
    iconUrl: winampIcon,
    component: () => <WinampContent />,
    isResizable: false,
    defaultSize: { width: 300, height: 400 },
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
  // Separador visual (via CSS)
  { id: 'sl-my-network', name: 'Meus Locais de Rede', iconUrl: myNetworkIcon, type: 'folder', targetId: 'root' },
  { id: 'sl-control-panel', name: 'Painel de Controle', iconUrl: controlPanelIcon, type: 'program', targetId: 'control-panel' },
  // Separador visual (via CSS)
  { id: 'sl-search', name: 'Pesquisar', iconUrl: searchIcon, type: 'program', targetId: 'search' },
  { id: 'sl-run', name: 'Executar...', iconUrl: runIcon, type: 'program', targetId: 'run' },
];
