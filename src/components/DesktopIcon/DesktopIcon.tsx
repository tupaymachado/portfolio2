import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  label: string;
  iconUrl: string;
  onDoubleClick: () => void;
  variant?: 'desktop' | 'explorer'; // <-- NOVA PROP
}

const DesktopIcon = ({ label, iconUrl, onDoubleClick, variant = 'desktop' }: DesktopIconProps) => {
  return (
    <div
      className={`${styles.iconButton} ${styles[variant]}`}
      onDoubleClick={onDoubleClick}
      tabIndex={0}
      role="button"
    >
      <img src={iconUrl} alt={`${label} icon`} className={styles.iconImage} draggable={false} />
      <span className={styles.iconLabel}>{label}</span>
    </div>
  );
};

export default DesktopIcon;