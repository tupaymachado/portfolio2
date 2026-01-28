import type { ProgramDefinition } from '../types/program';
import ExplorerApp from '../components/apps/ExplorerApp/ExplorerApp';

// Imports de ícones
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

// Importe seus componentes de conteúdo. Eles podem ser placeholders por enquanto.
const NotepadContent = () => <div style={{ padding: '10px' }}>Um editor de texto simples.</div>;
const AboutMeContent = () => <div style={{ padding: '10px' }}><h1>Sobre Mim</h1><p>Desenvolvedor apaixonado...</p></div>;
const MyProjectsContent = () => <div style={{ padding: '10px' }}><h1>Meus Projetos</h1><p>Cards dos projetos aqui...</p></div>;
const MinesweeperContent = () => <div style={{ padding: '10px' }}>Campo Minado em breve!</div>;
const WinampContent = () => <div style={{ padding: '10px' }}>Winamp em breve!</div>;
const MsnContent = () => <div style={{ padding: '10px' }}>MSN em breve!</div>;
const SolitaireContent = () => <div style={{ padding: '10px' }}>Solitaire em breve!</div>;

// A nossa "base de dados" de programas instalados no sistema.
export const PROGRAMS: ProgramDefinition[] = [
  {
    id: 'msn',
    name: 'MSN Messenger',
    iconUrl: msnIcon,
    component: <MsnContent />,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'explorer',
    name: 'Windows Explorer',
    iconUrl: explorerIcon,
    component: <ExplorerApp />,
    defaultSize: { width: 800, height: 600 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'about-me',
    name: 'Sobre Mim',
    iconUrl: myComputerIcon,
    component: <AboutMeContent />,
    defaultSize: { width: 550, height: 450 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'my-projects',
    name: 'Meus Projetos',
    iconUrl: myComputerIcon,
    component: <MyProjectsContent />,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 400 },
    isResizable: true,
  },
  {
    id: 'notepad',
    name: 'Bloco de Notas',
    iconUrl: notepadIcon,
    component: <NotepadContent />,
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 250, height: 150 },
    isResizable: true,
  },
  {
    id: 'minesweeper',
    name: 'Campo Minado',
    iconUrl: minesweeperIcon,
    component: <MinesweeperContent />,
    isResizable: false,
    defaultSize: { width: 300, height: 400 },
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    iconUrl: solitaireIcon,
    component: <SolitaireContent />,
    isResizable: false,
    defaultSize: { width: 300, height: 400 },
  },
  {
    id: 'winamp',
    name: 'Winamp',
    iconUrl: winampIcon,
    component: <WinampContent />,
    isResizable: false,
    defaultSize: { width: 300, height: 400 },
  }
];

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
