import styles from './AppMenuBar.module.css';

export interface AppMenuBarItem {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    highlight?: boolean; // e.g. auto-complete ready glow
}

interface AppMenuBarProps {
    items: AppMenuBarItem[];
    /** Optional element to render on the right (e.g. Windows logo) */
    rightSlot?: React.ReactNode;
}

export default function AppMenuBar({ items, rightSlot }: AppMenuBarProps) {
    return (
        <div className={styles.menuBar}>
            <div className={styles.items}>
                {items.map((item, i) => (
                    <button
                        key={i}
                        className={`${styles.item} ${item.disabled ? styles.disabled : ''} ${item.highlight ? styles.highlight : ''}`}
                        onClick={item.disabled ? undefined : item.onClick}
                        disabled={item.disabled}
                        type="button"
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
        </div>
    );
}
