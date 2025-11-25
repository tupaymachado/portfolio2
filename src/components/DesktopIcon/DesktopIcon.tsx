import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  label: string;
  iconUrl: string;
  onDoubleClick: () => void;
  variant?: 'desktop' | 'explorer'; // <-- NOVA PROP
}

const DesktopIcon = ({ label, iconUrl, onDoubleClick, variant = 'desktop' }: DesktopIconProps) => {
  return (
    <button 
      className={`${styles.iconButton} ${styles[variant]}`}
      onDoubleClick={onDoubleClick}
    >
      <img src={iconUrl} alt={`${label} icon`} className={styles.iconImage} />
      <span className={styles.iconLabel}>{label}</span>
    </button>
  );
};

export default DesktopIcon;