export type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export interface WindowInstance {
  // --- IDENTIFICAÇÃO ---
  id: number;           // ID único DESTA INSTÂNCIA (gerado com Date.now())
  programId: string;    // Qual programa esta janela está executando? (ex: "notepad")

  // --- METADADOS DINÂMICOS (override do programa) ---
  title?: string;       // Título customizado (senão usa program.name)
  iconUrl?: string;     // Ícone customizado (senão usa program.iconUrl)

  // --- DADOS INICIAIS PARA O PROGRAMA ---
  initialFolderId?: string; // Para o Explorer: qual pasta abrir inicialmente?

  // --- ESTADO DE VISIBILIDADE ---
  isMinimized: boolean; // A janela está escondida (na taskbar)?
  isMaximized: boolean; // A janela ocupa a tela toda?

  // --- ESTADO DE POSIÇÃO/TAMANHO ---
  position: { x: number; y: number }; // Onde a janela está na tela?
  size: { width: number; height: number }; // Qual o tamanho atual da janela?
  minSize: { width: number; height: number };
  zIndex: number;        // Em qual camada de empilhamento a janela está?
  isResizable: boolean;
}