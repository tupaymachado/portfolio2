import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoginScreen.module.css';
import windowStyles from '../Window/Window.module.css';
import { useUserStore, AVATAR_OPTIONS, type UserProfile } from '../../stores/useUserStore';
import winLogo from '../../assets/icons/win-logo.webp';
import shutdownIcon from '../../assets/icons/power.webp';
import logonSound from '../../assets/sounds/logon.m4a';
import closeIcon from '../../assets/icons/close.webp';
import trashBinIcon from '../../assets/icons/trash-bin.webp';

export default function LoginScreen() {
    const { t } = useTranslation();
    const profiles = useUserStore(state => state.profiles);
    const login = useUserStore(state => state.login);
    const createProfile = useUserStore(state => state.createProfile);
    const deleteProfile = useUserStore(state => state.deleteProfile);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

    // Estados para animação de welcome
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState<UserProfile | null>(null);

    // Em dev, pula a tela de login automaticamente
    useEffect(() => {
        if (!import.meta.env.DEV) return;

        let profile = profiles[0];
        if (!profile) {
            profile = createProfile('Dev', AVATAR_OPTIONS[0]);
        }
        login(profile.id);
    }, []);

    const handleLogin = (profile: UserProfile) => {
        // Inicia a animação de welcome
        setLoadingProfile(profile);
        setIsLoading(true);

        // Cria o áudio no contexto da interação do usuário
        const audio = new Audio(logonSound);

        // Após 3 segundos, toca o som e faz login
        setTimeout(() => {
            audio.play().catch(() => {
                // Ignora erro se autoplay for bloqueado
            });

            // Faz o login efetivo
            login(profile.id);
        }, 3000);
    };

    const handleCreateAccount = () => {
        if (newName.trim()) {
            const profile = createProfile(newName.trim(), selectedAvatar);
            handleLogin(profile); // Usa o mesmo fluxo de animação
            setShowCreateModal(false);
            setNewName('');
            setSelectedAvatar(AVATAR_OPTIONS[0]);
        }
    };

    const shutdown = useUserStore(state => state.shutdown);
    const isShuttingDown = useUserStore(state => state.isShuttingDown);
    const clearShutdown = useUserStore(state => state.clearShutdown);

    // Quando está desligando, espera 3s e volta para a tela de login
    useEffect(() => {
        if (!isShuttingDown) return;
        const timer = setTimeout(() => {
            clearShutdown();
        }, 3000);
        return () => clearTimeout(timer);
    }, [isShuttingDown, clearShutdown]);

    // Tela de desligamento: mostra apenas logo + mensagem
    if (isShuttingDown) {
        return (
            <div className={styles.loginScreen}>
                <header className={styles.header}></header>
                <div className={styles.mainContent} style={{ justifyContent: 'center' }}>
                    <div className={styles.leftSection} style={{ alignItems: 'center' }}>
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
                        <p className={styles.shutdownMessage}>{t('login.shuttingDown')}</p>
                    </div>
                </div>
                <div className={styles.bottomBar}></div>
            </div>
        );
    }

    return (
        <div className={styles.loginScreen}>
            {/* Header */}
            <header className={styles.header}></header>

            <div className={styles.mainContent}>
                {/* Lado esquerdo */}
                <div className={styles.leftSection}>
                    {isLoading ? (
                        <p className={styles.welcomeText}>{t('login.welcome')}</p>
                    ) : (
                        <>
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
                                {t('login.instruction')}
                            </p>
                        </>
                    )}
                </div>

                {/* Lista de usuários à direita */}
                <div className={`${styles.usersSection} ${isLoading ? styles.usersSectionLoading : ''}`}>
                    {profiles.map(profile => {
                        const isSelected = loadingProfile?.id === profile.id;
                        const isHidden = isLoading && !isSelected;

                        return (
                            <div key={profile.id} className={styles.userCardWrapper}>
                                <button
                                    className={`${styles.userCard} ${isSelected && isLoading ? styles.userCardLoading : ''} ${isHidden ? styles.userCardHidden : ''}`}
                                    onClick={() => handleLogin(profile)}
                                    disabled={isLoading}
                                >
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.name}
                                        className={styles.userAvatar}
                                    />
                                    <div className={styles.userInfo}>
                                        <span className={styles.userName}>{profile.name}</span>
                                        {isSelected && isLoading && (
                                            <span className={styles.loadingUserStatus}>{t('login.loading')}</span>
                                        )}
                                    </div>
                                </button>
                                {!isLoading && (
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => deleteProfile(profile.id)}
                                        title={t('login.deleteProfile')}
                                    >
                                        <img src={trashBinIcon} alt="Delete" />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {/* Botão de criar conta */}
                    {!isLoading && (
                        <button
                            className={styles.createAccountBtn}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <div className={styles.createAccountIcon}></div>
                            <span className={styles.createAccountText}>{t('login.createAccountBtn')}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Barra inferior */}
            <div className={styles.bottomBar}>
                <button className={`${styles.shutdownBtn} ${isLoading ? styles.userCardHidden : ''}`} onClick={shutdown}>
                    <div className={styles.shutdownIcon}>
                        <img src={shutdownIcon} alt="Shutdown" />
                    </div>
                    <span>{t('login.shutdownBtn')}</span>
                </button>

                <p className={`${styles.helpText} ${isLoading ? styles.userCardHidden : ''}`} dangerouslySetInnerHTML={{ __html: t('login.helpText') }}>
                </p>
            </div>

            {/* Modal de criar conta */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={`${windowStyles.window} ${windowStyles.active} ${styles.modal}`} onClick={e => e.stopPropagation()}>
                        <header className={`${windowStyles.titleBar} ${windowStyles.active}`}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img className={windowStyles.icon} src={winLogo} alt="Windows icon" />
                                <span className={windowStyles.title} style={{ color: 'white' }}>{t('login.createAccountTitle')}</span>
                            </div>
                            <div className={windowStyles.windowControls}>
                                <button
                                    className={`${windowStyles.windowButton} ${windowStyles.closeButton}`}
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <img src={closeIcon} alt="Close" />
                                </button>
                            </div>
                        </header>

                        <div className={`${windowStyles.windowBody} ${windowStyles.active} ${styles.modalBody}`}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>{t('login.usernameLabel')}</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder={t('login.usernamePlaceholder')}
                                    autoFocus
                                    maxLength={20}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>{t('login.avatarLabel')}</label>
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
                                {t('login.cancelBtn')}
                            </button>
                            <button
                                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                                onClick={handleCreateAccount}
                                disabled={false}
                            >
                                {t('login.createBtn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
