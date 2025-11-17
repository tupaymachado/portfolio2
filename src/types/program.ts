export interface ProgramDefinition {
  id: string; // "notepad", "my-projects", etc.
  name: string; // "Bloco de Notas", "Meus Projetos"
  iconUrl: string; // Caminho para o ícone
  
  // O componente que é o "código" do programa
  component: React.ReactNode; 
  
  // Configurações padrão da janela quando este programa é aberto
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  isResizable: boolean; // Padrão 'true'
}