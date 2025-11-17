import styles from './SystemTray.module.css';
import { useState, useEffect } from 'react'

export function SystemTray() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className={styles.systemTray}>
            <span>{formattedTime}</span>
        </div>
    );
};

export default SystemTray