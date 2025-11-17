export type WindowDisplayState = 'normal' | 'minimized' | 'maximized';

export interface WindowInstance {
  // --- IDENTIFICAÇÃO ---
  id: number;           // ID único DESTA INSTÂNCIA (gerado com Date.now())
  programId: string;    // Qual programa esta janela está executando? (ex: "notepad")

  // --- ESTADO DINÂMICO ---
  displayState: WindowDisplayState; // A janela está normal, minimizada ou maximizada?
  position: { x: number; y: number }; // Onde a janela está na tela?
  size: { width: number; height: number }; // Qual o tamanho atual da janela?
  minSize: { width: number; height: number };
  zIndex: number;        // Em qual camada de empilhamento a janela está?
  isResizable: boolean;
}