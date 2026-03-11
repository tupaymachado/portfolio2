import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import styles from './MsnProfileModal.module.css';

interface MsnProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    uid: string;
    currentName: string;
    currentPhoto: string;
    currentMessage: string;
    onSave: (name: string, photo: string, message: string) => Promise<void>;
}

export default function MsnProfileModal({
    isOpen, onClose, uid, currentName, currentPhoto, currentMessage, onSave
}: MsnProfileModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(currentName);
    const [photo, setPhoto] = useState(currentPhoto);
    const [message, setMessage] = useState(currentMessage);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const fileRef = storageRef(storage, `users/${uid}/avatar_${Date.now()}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            setPhoto(url);
        } catch (err) {
            console.error('Error uploading avatar:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await onSave(name, photo, message);
            onClose();
        } catch (err) {
            console.error('Error saving profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <span>{t('msn.profile.title')}</span>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.section}>
                        <h3>{t('msn.profile.myProfile')}</h3>

                        <div className={styles.avatarRow}>
                            <div className={styles.avatarPreview}>
                                <img src={photo || 'https://github.com/tupaymachado.png'} alt="Avatar Preview" />
                                {isUploading && <div className={styles.uploadingOverlay}>{t('msn.profile.uploading')}</div>}
                            </div>
                            <button
                                className={styles.button}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isSaving}
                            >
                                {t('msn.profile.changeImage')}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>{t('msn.profile.displayNameLabel')}</label>
                            <input
                                className={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>{t('msn.profile.personalMessageLabel')}</label>
                            <input
                                className={styles.input}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={100}
                                placeholder={t('msn.profile.personalMessagePlaceholder')}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.buttonPrimary} onClick={handleSave} disabled={isSaving || isUploading}>
                        {isSaving ? t('msn.profile.saving') : t('msn.profile.ok')}
                    </button>
                    <button className={styles.button} onClick={onClose} disabled={isSaving}>
                        {t('msn.profile.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
