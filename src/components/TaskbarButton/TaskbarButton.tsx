// src/components/TaskbarButton/TaskbarButton.tsx
import styles from './TaskbarButton.module.css';

interface TaskbarButtonProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  iconUrl: string;
}

const TaskbarButton = ({ title, isActive, onClick, onContextMenu, iconUrl }: TaskbarButtonProps) => {
  return (
    <button
      className={`${styles.taskbarButton} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <img className={styles.icon} src={iconUrl} />
      <span className={styles.title}>{title}</span>
    </button>
  );
};

export default TaskbarButton;