import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './ContextMenu.module.css';
import { useWindowStore } from '../../stores/useWindowStore';
import type { MenuItem } from '../../stores/useWindowStore';

export default function ContextMenu() {
  const { contextMenu, closeContextMenu } = useWindowStore();
  const { isOpen, position, items } = contextMenu;

  const menuRef = useRef<HTMLDivElement>(null);
  
  // Estado local para a posição ajustada.
  // Inicialmente usamos a posição do clique, mas ela pode mudar antes da "pintura".
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // 1. useLayoutEffect: Calcula a posição FINAL antes de mostrar na tela
  useLayoutEffect(() => {
    if (isOpen && menuRef.current) {
      const { offsetWidth: width, offsetHeight: height } = menuRef.current;
      const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;

      let x = position.x;
      let y = position.y;

      // --- Lógica de Colisão Horizontal ---
      // Se a posição X + largura do menu passar da largura da tela...
      if (x + width > viewportWidth) {
        // ...jogue o menu para a esquerda do mouse (x - width)
        x -= width;
      }

      // --- Lógica de Colisão Vertical ---
      // Se a posição Y + altura do menu passar da altura da tela...
      if (y + height > viewportHeight) {
        // ...jogue o menu para cima do mouse (y - height)
        y -= height;
      }

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]); // Recalcula sempre que abrir ou a posição mudar

  // 2. useEffect: Lógica de clicar fora para fechar (padrão)
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    // Listener para resize da janela também é bom, para fechar o menu se a tela mudar
    window.addEventListener('resize', closeContextMenu); 

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', closeContextMenu);
    };
  }, [isOpen, closeContextMenu]);


  if (!isOpen) {
    return null;
  }
  
  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    item.onClick();
    closeContextMenu();
  };

  return (
    <div 
      className={styles.contextMenu}
      // Usamos adjustedPosition aqui, não a position bruta do store
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      ref={menuRef}
    >
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <button
              className={styles.menuItem}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}