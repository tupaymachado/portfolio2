import type { ProgramDefinition } from '../types/program';

// Importe seus componentes de conteúdo. Eles podem ser placeholders por enquanto.
const NotepadContent = () => <div style={{ padding: '10px' }}>Um editor de texto simples.</div>;
const AboutMeContent = () => <div style={{ padding: '10px' }}><h1>Sobre Mim</h1><p>Desenvolvedor apaixonado...</p></div>;
const MyProjectsContent = () => <div style={{ padding: '10px' }}><h1>Meus Projetos</h1><p>Cards dos projetos aqui...</p></div>;
const MinesweeperContent = () => <div style={{ padding: '10px' }}>Campo Minado em breve!</div>;
const ShutDownContent = () => <div style={{ padding: '10px' }}>Desligando...</div>;


// A nossa "base de dados" de programas instalados no sistema.
export const PROGRAMS: ProgramDefinition[] = [
  {
    id: 'about-me',
    name: 'Sobre Mim',
    iconUrl: 'src/assets/icons/my-computer.png', // Exemplo de caminho, coloque seus ícones na pasta /public
    component: <AboutMeContent />,
    defaultSize: { width: 550, height: 450 },
    minSize: { width: 400, height: 300 },
    isResizable: true,
  },
  {
    id: 'my-projects',
    name: 'Meus Projetos',
    iconUrl: 'src/assets/icons/my-computer.png',
    component: <MyProjectsContent />,
    defaultSize: { width: 700, height: 500 },
    minSize: { width: 500, height: 400 },
    isResizable: true,
  },
  {
    id: 'notepad',
    name: 'Bloco de Notas',
    iconUrl: 'src/assets/icons/notepad.png',
    component: <NotepadContent />,
    defaultSize: { width: 600, height: 400 },
    minSize: { width: 250, height: 150 },
    isResizable: true,
  },
  {
    id: 'minesweeper',
    name: 'Campo Minado',
    iconUrl: '/icons/minesweeper.png',
    component: <MinesweeperContent />,
    // O jogo Campo Minado clássico não era redimensionável
    isResizable: false, 
    // defaultSize não é necessário se não for redimensionável, mas podemos definir.
    defaultSize: { width: 300, height: 400 }, 
  },
  {
    id: 'shutdown',
    name: 'Desligar',
    iconUrl: '/icons/shutdown.png',
    component: <ShutDownContent />,
    // Janelas de diálogo como "Desligar" geralmente não são redimensionáveis nem maximizáveis.
    isResizable: false,
    defaultSize: { width: 350, height: 200 },
  }
];