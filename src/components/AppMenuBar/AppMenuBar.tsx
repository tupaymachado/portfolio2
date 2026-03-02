import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AppMenuBar.module.css';

export interface AppMenuBarDropdownItem {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
    checked?: boolean;
    shortcut?: string;
    separator?: boolean;
}

export interface AppMenuBarItem {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    highlight?: boolean;
    items?: AppMenuBarDropdownItem[];
}

interface AppMenuBarProps {
    items: AppMenuBarItem[];
    /** Optional element to render on the right (e.g. Windows logo) */
    rightSlot?: React.ReactNode;
}

export default function AppMenuBar({ items, rightSlot }: AppMenuBarProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const barRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpenIndex(null), []);

    useEffect(() => {
        if (openIndex === null) return;
        const handleMouseDown = (e: MouseEvent) => {
            if (barRef.current && !barRef.current.contains(e.target as Node)) {
                close();
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [openIndex, close]);

    return (
        <div className={styles.menuBar} ref={barRef}>
            <div className={styles.items}>
                {items.map((item, i) => {
                    const isOpen = openIndex === i;
                    const hasDropdown = !!(item.items && item.items.length > 0);
                    return (
                        <div key={i} className={styles.itemWrapper}>
                            <button
                                type="button"
                                className={`${styles.item} ${item.disabled ? styles.disabled : ''} ${item.highlight ? styles.highlight : ''} ${isOpen ? styles.itemOpen : ''}`}
                                onClick={item.disabled ? undefined : () => {
                                    if (hasDropdown) {
                                        setOpenIndex(isOpen ? null : i);
                                    } else {
                                        item.onClick?.();
                                    }
                                }}
                                onMouseEnter={() => {
                                    if (openIndex !== null) {
                                        setOpenIndex(hasDropdown ? i : null);
                                    }
                                }}
                                disabled={item.disabled}
                            >
                                {item.label}
                            </button>
                            {isOpen && hasDropdown && (
                                <div className={styles.dropdown}>
                                    {item.items!.map((sub, j) =>
                                        sub.separator ? (
                                            <div key={j} className={styles.dropdownSeparator} />
                                        ) : (
                                            <button
                                                key={j}
                                                type="button"
                                                className={styles.dropdownItem}
                                                disabled={sub.disabled}
                                                onClick={sub.disabled ? undefined : () => {
                                                    sub.onClick?.();
                                                    close();
                                                }}
                                            >
                                                <span className={styles.dropdownCheck}>
                                                    {sub.checked ? '✓' : '\u00A0'}
                                                </span>
                                                <span className={styles.dropdownLabel}>{sub.label}</span>
                                                {sub.shortcut && (
                                                    <span className={styles.dropdownShortcut}>{sub.shortcut}</span>
                                                )}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
        </div>
    );
}
