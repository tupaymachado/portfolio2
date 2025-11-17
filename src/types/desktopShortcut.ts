export interface DesktopShortcut {
  id: string;          // ID único do atalho em si (ex: "shortcut-1").
  programId: string;   // ID do programa que este atalho abre (aponta para uma ProgramDefinition).
  gridPosition: {      // Posição do ícone na grade do desktop.
    row: number;
    col: number;
  };
}