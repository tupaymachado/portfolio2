import { useState } from 'react';
import { msnUserService } from '../../../services/msnUserService';
import styles from './MsnAddContactModal.module.css';
import userIcon from '../../../assets/icons/msn.webp';

interface MsnAddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    uid: string;
}

export default function MsnAddContactModal({ isOpen, onClose, uid }: MsnAddContactModalProps) {
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
            setError(err instanceof Error ? err.message : 'Erro ao adicionar contato');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <span>Adicionar um Contato</span>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div className={styles.body}>
                    <div className={styles.content}>
                        <img src={userIcon} alt="User" className={styles.userIcon} />
                        <div className={styles.textContainer}>
                            <p>Por favor, introduza o endereço de e-mail do contato que você deseja adicionar.</p>

                            <div className={styles.inputGroup}>
                                <label>Endereço de e-mail:</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="exemplo@hotmail.com"
                                    disabled={isAdding || success}
                                />
                            </div>

                            {error && <p className={styles.error}>{error}</p>}
                            {success && <p className={styles.success}>Contato adicionado com sucesso!</p>}
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.button}
                        onClick={handleAddContact}
                        disabled={isAdding || success || !email.trim()}
                    >
                        {isAdding ? 'Adicionando...' : 'Avançar >'}
                    </button>
                    <button className={styles.button} onClick={onClose} disabled={isAdding}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
