import { useState } from 'react';
import styles from './LoginScreen.module.css';
import { useUserStore, AVATAR_OPTIONS, type UserProfile } from '../../stores/useUserStore';
import winLogo from '../../assets/icons/win-logo.webp';

export default function LoginScreen() {
    const profiles = useUserStore(state => state.profiles);
    const login = useUserStore(state => state.login);
    const createProfile = useUserStore(state => state.createProfile);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

    const handleLogin = (profile: UserProfile) => {
        login(profile.id);
    };

    const handleCreateAccount = () => {
        if (newName.trim()) {
            const profile = createProfile(newName.trim(), selectedAvatar);
            login(profile.id); // Loga automaticamente após criar
            setShowCreateModal(false);
            setNewName('');
            setSelectedAvatar(AVATAR_OPTIONS[0]);
        }
    };

    const handleShutdown = () => {
        alert('Desligando...');
    };

    return (
        <div className={styles.loginScreen}>
            {/* Conteúdo principal */}
            <header className={styles.header}></header>
            <div className={styles.mainContent}>
                {/* Logo Windows à esquerda */}
                <div className={styles.leftSection}>
                    <div className={styles.logoSection}>
                        <div className={styles.logoContainer}>
                            <span className={styles.logoText}>Microsoft<sup>®</sup></span>
                            <img
                                src={winLogo}
                                alt="Windows XP"
                                className={styles.windowsLogo}
                            />
                        </div>
                        <p className={styles.windowsText}>
                            Windows<sup className={styles.xp}>xp</sup>
                        </p>
                    </div>
                    <p className={styles.logoTextBottom}>
                        Para iniciar, clique no seu nome de usuário
                    </p>
                </div>
                {/* Lista de usuários à direita */}
                <div className={styles.usersSection}>
                    {profiles.map(profile => (
                        <button
                            key={profile.id}
                            className={styles.userCard}
                            onClick={() => handleLogin(profile)}
                        >
                            <img
                                src={profile.avatarUrl}
                                alt={profile.name}
                                className={styles.userAvatar}
                            />
                            <span className={styles.userName}>{profile.name}</span>
                        </button>
                    ))}

                    {/* Botão de criar conta */}
                    <button
                        className={styles.createAccountBtn}
                        onClick={() => setShowCreateModal(true)}
                    >
                        <div className={styles.createAccountIcon}>+</div>
                        <span className={styles.createAccountText}>Criar nova conta</span>
                    </button>
                </div>
            </div>

            {/* Barra inferior */}
            <div className={styles.bottomBar}>
                <button className={styles.shutdownBtn} onClick={handleShutdown}>
                    <div className={styles.shutdownIcon}>⏻</div>
                    <span>Desligar computador</span>
                </button>

                <p className={styles.helpText}>
                    Após o logon, você pode adicionar ou alterar contas.<br />
                    Acesse o Painel de Controle e clique em Contas de Usuário.
                </p>
            </div>

            {/* Modal de criar conta */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <span className={styles.modalTitle}>Criar Nova Conta</span>
                            <button
                                className={styles.modalCloseBtn}
                                onClick={() => setShowCreateModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nome de usuário:</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Digite seu nome..."
                                    autoFocus
                                    maxLength={20}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Escolha um avatar:</label>
                                <div className={styles.avatarGrid}>
                                    {AVATAR_OPTIONS.map(avatar => (
                                        <button
                                            key={avatar}
                                            type="button"
                                            className={`${styles.avatarOption} ${selectedAvatar === avatar ? styles.selected : ''
                                                }`}
                                            onClick={() => setSelectedAvatar(avatar)}
                                        >
                                            <img src={avatar} alt="Avatar" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                                onClick={handleCreateAccount}
                                disabled={!newName.trim()}
                            >
                                Criar Conta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
