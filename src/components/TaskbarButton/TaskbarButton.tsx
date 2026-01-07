// src/components/TaskbarButton/TaskbarButton.tsx
import styles from './TaskbarButton.module.css';

interface TaskbarButtonProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  iconUrl: string;
}

const TaskbarButton = ({ title, isActive, onClick, iconUrl }: TaskbarButtonProps) => {
  return (
    <button
      className={`${styles.taskbarButton} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <img className={styles.icon} src={iconUrl} />
      <span className={styles.title}>{title}</span>
    </button>
  );
};

export default TaskbarButton;