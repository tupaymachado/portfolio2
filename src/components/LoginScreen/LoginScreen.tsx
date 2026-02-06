import { useState } from 'react';
import styles from './LoginScreen.module.css';
import windowStyles from '../Window/Window.module.css';
import { useUserStore, AVATAR_OPTIONS, type UserProfile } from '../../stores/useUserStore';
import winLogo from '../../assets/icons/win-logo.webp';
import shutdownIcon from '../../assets/icons/power.webp';
import logonSound from '../../assets/sounds/logon.m4a';
import closeIcon from '../../assets/icons/close.webp';

export default function LoginScreen() {
    const profiles = useUserStore(state => state.profiles);
    const login = useUserStore(state => state.login);
    const createProfile = useUserStore(state => state.createProfile);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

    // Estados para animação de welcome
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState<UserProfile | null>(null);

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

    const handleShutdown = () => {
        alert('Desligando...');
    };

    return (
        <div className={styles.loginScreen}>
            {/* Header */}
            <header className={styles.header}></header>

            <div className={styles.mainContent}>
                {/* Lado esquerdo */}
                <div className={styles.leftSection}>
                    {isLoading ? (
                        <p className={styles.welcomeText}>Bem-vindo</p>
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
                                Para iniciar, clique no seu nome de usuário
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
                            <button
                                key={profile.id}
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
                                        <span className={styles.loadingUserStatus}>Carregando suas configurações pessoais...</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {/* Botão de criar conta */}
                    {!isLoading && (
                        <button
                            className={styles.createAccountBtn}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <div className={styles.createAccountIcon}></div>
                            <span className={styles.createAccountText}>Criar nova conta</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Barra inferior */}
            <div className={styles.bottomBar}>
                <button className={styles.shutdownBtn} onClick={handleShutdown}>
                    <div className={styles.shutdownIcon}>
                        <img src={shutdownIcon} alt="Shutdown" />
                    </div>
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
                        <header className={`${windowStyles.titleBar} ${windowStyles.active}`}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span className={windowStyles.title} style={{ color: 'white' }}>Criar Nova Conta</span>
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
