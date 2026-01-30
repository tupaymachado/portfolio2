import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

/**
 * Tipos possíveis para o componente de um programa:
 * 
 * 1. Factory Function: () => ReactNode
 *    - Função que retorna JSX
 *    - Componente só é instanciado quando a janela abre
 *    - Código ainda está no bundle principal
 * 
 * 2. Lazy Component: React.lazy(() => import('./Component'))
 *    - Componente carregado sob demanda (code-splitting)
 *    - Código fica em chunk separado
 *    - Requer Suspense para funcionar
 */
export type ProgramComponent =
  | (() => ReactNode)                                    // Factory function
  | LazyExoticComponent<ComponentType<Record<string, never>>>;  // React.lazy

export interface ProgramDefinition {
  id: string; // "notepad", "my-projects", etc.
  name: string; // "Bloco de Notas", "Meus Projetos"
  iconUrl: string; // Caminho para o ícone

  // O componente que é o "código" do programa
  // Pode ser uma factory function ou um lazy component
  component: ProgramComponent;

  // Configurações padrão da janela quando este programa é aberto
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  isResizable: boolean; // Padrão 'true'
}