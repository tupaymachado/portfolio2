import { useState } from 'react'
import styles from './ShortcutCard.module.css'

export interface cardContent {
    icon: string;
    description: string;
}

interface ShortcutCardProps {
    title: string;
    content: cardContent[]
}

export default function ShortcutCard({ title, content }: ShortcutCardProps) {
    const [show, setShow] = useState(true);

    function onToggle() {
        setShow(!show);
    }

    return (
        <div className={styles.container}>
            <div className={styles.titleBar}>
                <div className={styles.title}>{title}</div>
                <div className={`${styles.toggle} ${show ? '' : styles.rotated}`} onClick={onToggle}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"></path>
                    </svg>
                </div>

            </div>
            <div className={`${styles.contentContainer} ${show ? styles.show : styles.hidden}`}>
                {content.map((item: cardContent) => (
                    <div className={styles.contentLine}>
                        <img src={item.icon} alt={item.description} />
                        <div className={styles.description}>{item.description}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}