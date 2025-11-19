export type FileType = 'folder' | 'file';

export interface FileSystemItem {
  id: string;           // Um ID único (ex: uuid)
  parentId: string;     // O ID da pasta onde este item está (para saber quem é o pai)
  name: string;         // O nome do arquivo/pasta (ex: "Meus Projetos")
  type: FileType;       // É arquivo ou pasta?
  gridPosition?: { row: number; col: number }; 
  
  // --- Propriedades específicas ---
  
  // Se for um arquivo, ele pode estar associado a um programa (ex: 'notepad')
  programId?: string;   
  
  // Conteúdo do arquivo (para arquivos de texto simples, por exemplo)
  content?: string;     
  
  // Ícone customizado (opcional, senão usa o padrão do tipo)
  iconUrl?: string;

  // --- Metadados ---
  createdAt: number;
}

// Uma estrutura auxiliar para facilitar a busca (Mapa de ID -> Item)
export interface FileSystemState {
  items: Record<string, FileSystemItem>; // Um objeto gigante com todos os itens
  rootId: string; // O ID da pasta raiz (C:)
}