import styles from './DesktopIcon.module.css';

interface DesktopIconProps {
  label: string;
  iconUrl: string;
  onDoubleClick: () => void; // Uma função que não recebe nada e não retorna nada
}

const DesktopIcon = ({ label, iconUrl, onDoubleClick }: DesktopIconProps) => {
  return (
    <button className={styles.iconButton} onDoubleClick={onDoubleClick}>
      <img src={iconUrl} alt={`${label} icon`} className={styles.iconImage} />
      <span className={styles.iconLabel}>{label}</span>
    </button>
  );
};

export default DesktopIcon;