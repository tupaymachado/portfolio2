import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { msnUserService } from '../../../services/msnUserService';
import styles from './MsnAddContactModal.module.css';
import userIcon from '../../../assets/icons/msn.webp';

interface MsnAddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    uid: string;
}

export default function MsnAddContactModal({ isOpen, onClose, uid }: MsnAddContactModalProps) {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleAddContact = async () => {
        if (!email.trim()) return;

        setIsAdding(true);
        setError('');
        setSuccess(false);

        try {
            await msnUserService.addContact(uid, email.trim());
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setEmail('');
                setSuccess(false);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('msn.addContact.error'));
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <span>{t('msn.addContact.title')}</span>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.content}>
                        <img src={userIcon} alt="User" className={styles.userIcon} />
                        <div className={styles.textContainer}>
                            <p>{t('msn.addContact.description')}</p>

                            <div className={styles.inputGroup}>
                                <label>{t('msn.addContact.emailLabel')}</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('msn.addContact.emailPlaceholder')}
                                    disabled={isAdding || success}
                                />
                            </div>

                            {error && <p className={styles.error}>{error}</p>}
                            {success && <p className={styles.success}>{t('msn.addContact.success')}</p>}
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.button}
                        onClick={handleAddContact}
                        disabled={isAdding || success || !email.trim()}
                    >
                        {isAdding ? t('msn.addContact.adding') : t('msn.addContact.next')}
                    </button>
                    <button className={styles.button} onClick={onClose} disabled={isAdding}>
                        {t('msn.addContact.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
