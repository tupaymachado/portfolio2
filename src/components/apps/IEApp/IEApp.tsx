import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './IEApp.module.css';
import AppMenuBar from '../../AppMenuBar/AppMenuBar';
import type { AppMenuBarItem } from '../../AppMenuBar/AppMenuBar';
import { getHomePage } from './homePage';

import backIcon from '../../../assets/icons/back.webp';
import forwardIcon from '../../../assets/icons/forward.webp';
import stopIcon from '../../../assets/icons/ie-stop.webp';
import refreshIcon from '../../../assets/icons/ie-refresh.webp';
import homeIcon from '../../../assets/icons/ie-home.webp';
import searchIcon from '../../../assets/icons/search.webp';
import favoritesIcon from '../../../assets/icons/favorites.webp';
import historyIcon from '../../../assets/icons/ie-history.webp';
import goIcon from '../../../assets/icons/go.webp';
import ie6Icon from '../../../assets/icons/ie6.webp';

const HOME_URL = 'about:home';

function normalizeUrl(input: string): string {
    const t = input.trim();
    if (!t || t === 'about:home' || t === 'about:blank') return HOME_URL;
    if (
        t.startsWith('http://') ||
        t.startsWith('https://') ||
        t.startsWith('about:') ||
        t.startsWith('ftp://')
    ) return t;
    return 'https://' + t;
}

function displayUrl(url: string) {
    return url === HOME_URL ? 'about:home' : url;
}

export default function IEApp() {
    const { t, i18n } = useTranslation();
    const [navHistory, setNavHistory] = useState<string[]>([HOME_URL]);
    const [navIndex, setNavIndex] = useState(0);
    const [addressInput, setAddressInput] = useState('about:home');
    const [status, setStatus] = useState(() => t('ie.status.done'));
    const [isLoading, setIsLoading] = useState(false);
    const [navKey, setNavKey] = useState(0);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const currentUrl = navHistory[navIndex];
    const canGoBack = navIndex > 0;
    const canGoFwd = navIndex < navHistory.length - 1;
    const isHome = currentUrl === HOME_URL;

    // Clear loading state after timeout (X-Frame-Options blocks never fire onLoad)
    useEffect(() => {
        if (!isLoading) return;
        const timer = setTimeout(() => {
            setIsLoading(false);
            setStatus(t('ie.status.done'));
        }, 6000);
        return () => clearTimeout(timer);
    }, [isLoading, navKey]);

    const navigate = (rawUrl: string) => {
        const url = normalizeUrl(rawUrl);
        const newHistory = [...navHistory.slice(0, navIndex + 1), url];
        setNavHistory(newHistory);
        setNavIndex(newHistory.length - 1);
        setAddressInput(displayUrl(url));
        setStatus(t('ie.status.connecting'));
        setIsLoading(true);
        setNavKey(k => k + 1);
    };

    const goBack = () => {
        if (!canGoBack) return;
        const idx = navIndex - 1;
        const url = navHistory[idx];
        setNavIndex(idx);
        setAddressInput(displayUrl(url));
        setStatus(t('ie.status.loading'));
        setIsLoading(true);
        setNavKey(k => k + 1);
    };

    const goForward = () => {
        if (!canGoFwd) return;
        const idx = navIndex + 1;
        const url = navHistory[idx];
        setNavIndex(idx);
        setAddressInput(displayUrl(url));
        setStatus(t('ie.status.loading'));
        setIsLoading(true);
        setNavKey(k => k + 1);
    };

    const goHome = () => navigate(HOME_URL);
    const handleRefresh = () => {
        setStatus(t('ie.status.loading'));
        setIsLoading(true);
        setNavKey(k => k + 1);
    };
    const handleStop = () => {
        setIsLoading(false);
        setStatus(t('ie.status.stopped'));
    };

    const handleLoad = () => {
        setIsLoading(false);
        setStatus(t('ie.status.done'));
    };

    const handleAddressKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') navigate(addressInput);
    };

    const menuItems: AppMenuBarItem[] = [
        {
            label: t('ie.menu.file'),
            items: [
                { label: t('ie.menu.newWindow'), shortcut: 'Ctrl+N' },
                { separator: true },
                { label: t('ie.menu.open'), shortcut: 'Ctrl+O', onClick: () => { const url = prompt(t('ie.menu.open')); if (url) navigate(url); } },
                { separator: true },
                { label: t('ie.menu.saveAs') },
                { separator: true },
                { label: t('ie.menu.print'), shortcut: 'Ctrl+P', onClick: () => iframeRef.current?.contentWindow?.print() },
                { separator: true },
                { label: t('ie.menu.close') },
            ],
        },
        {
            label: t('ie.menu.edit'),
            items: [
                { label: t('ie.menu.cut'), shortcut: 'Ctrl+X' },
                { label: t('ie.menu.copy'), shortcut: 'Ctrl+C' },
                { label: t('ie.menu.paste'), shortcut: 'Ctrl+V' },
                { separator: true },
                { label: t('ie.menu.selectAll'), shortcut: 'Ctrl+A' },
                { separator: true },
                { label: t('ie.menu.find'), shortcut: 'Ctrl+F' },
            ],
        },
        {
            label: t('ie.menu.view'),
            items: [
                { label: t('ie.menu.statusBar'), checked: true },
                { label: t('ie.menu.addressBar'), checked: true },
                { separator: true },
                { label: t('ie.menu.textSize') },
                { separator: true },
                { label: t('ie.menu.pageSource') },
                { separator: true },
                { label: t('ie.menu.refresh'), shortcut: 'F5', onClick: handleRefresh },
                { label: t('ie.menu.stop'), shortcut: 'Esc', onClick: handleStop },
            ],
        },
        {
            label: t('ie.menu.favorites'),
            items: [
                { label: t('ie.menu.addFavorite') },
                { label: t('ie.menu.organizeFavorites') },
                { separator: true },
                { label: `🏠 ${t('ie.links.myPortfolio')}`, onClick: goHome },
                { label: '💻 GitHub', onClick: () => navigate('https://github.com/tupaymachado') },
                { label: '💼 LinkedIn', onClick: () => navigate('https://linkedin.com/in/seu-perfil') },
                { label: '📖 Wikipedia', onClick: () => navigate('https://pt.wikipedia.org') },
            ],
        },
        {
            label: t('ie.menu.tools'),
            items: [
                { label: t('ie.menu.internetOptions') },
            ],
        },
        {
            label: t('ie.menu.help'),
            items: [
                { label: t('ie.menu.helpContents') },
                { separator: true },
                { label: t('ie.menu.aboutIE') },
            ],
        },
    ];

    return (
        <div className={styles.container}>
            {/* Menu bar */}
            <AppMenuBar
                items={menuItems}
                rightSlot={
                    <div className={styles.ieLogo}>
                        <img src={ie6Icon} alt="IE" className={isLoading ? styles.ieLogoSpin : ''} />
                    </div>
                }
            />

            {/* Standard Buttons toolbar */}
            <div className={styles.toolbar}>
                <button className={styles.toolBtn} onClick={goBack} disabled={!canGoBack} title={t('ie.toolbar.back')}>
                    <img src={backIcon} alt="" />
                    <span>{t('ie.toolbar.back')}</span>
                    <svg viewBox="0 0 320 512" width="8" height="8" fill="currentColor">
                        <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8L32 192c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z"></path>
                    </svg>
                </button>
                <button className={styles.toolBtn} onClick={goForward} disabled={!canGoFwd} title="Avançar (Alt+Seta direita)">
                    <img src={forwardIcon} alt="" />
                </button>
                <div className={styles.toolSep} />
                <button className={styles.toolBtn} onClick={handleStop} disabled={!isLoading} title="Parar (Esc)">
                    <img src={stopIcon} alt="" />
                </button>
                <button className={styles.toolBtn} onClick={handleRefresh} title="Atualizar (F5)">
                    <img src={refreshIcon} alt="" />
                </button>
                <button className={styles.toolBtn} onClick={goHome} title="Página Inicial">
                    <img src={homeIcon} alt="" />
                </button>
                <div className={styles.toolSep} />
                <button className={styles.toolBtn} title={t('ie.toolbar.search')}>
                    <img src={searchIcon} alt="" />
                    <span>{t('ie.toolbar.search')}</span>
                </button>
                <button className={styles.toolBtn} title={t('ie.toolbar.favorites')}>
                    <img src={favoritesIcon} alt="" />
                    <span>{t('ie.toolbar.favorites')}</span>
                </button>
                <button className={styles.toolBtn} title="Histórico">
                    <img src={historyIcon} alt="" />
                </button>
            </div>

            {/* Address bar */}
            <div className={styles.addressRow}>
                <span className={styles.addressLabel}>{t('ie.address.label')}</span>
                <div className={styles.addressWrap}>
                    <input
                        className={styles.addressInput}
                        value={addressInput}
                        onChange={e => setAddressInput(e.target.value)}
                        onKeyDown={handleAddressKey}
                        onFocus={e => e.target.select()}
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>
                <button className={styles.goBtn} onClick={() => navigate(addressInput)} title="Ir">
                    <img src={goIcon} alt="" />
                </button>
            </div>

            {/* Links bar */}
            <div className={styles.linksBar}>
                <span className={styles.linksLabel}>{t('ie.links.label')}</span>
                <button className={styles.linkBtn} onClick={goHome}>🏠 {t('ie.links.myPortfolio')}</button>
                <button className={styles.linkBtn} onClick={() => navigate('https://github.com/tupaymachado')}>💻 GitHub</button>
                <button className={styles.linkBtn} onClick={() => navigate('https://pt.wikipedia.org')}>📖 Wikipedia</button>
            </div>

            {/* Content area */}
            <div className={styles.content}>
                {isHome ? (
                    <iframe
                        key={`home-${navKey}`}
                        ref={iframeRef}
                        className={styles.iframe}
                        srcDoc={getHomePage(i18n.language)}
                        title="Página Inicial"
                        onLoad={handleLoad}
                    />
                ) : (
                    <iframe
                        key={`ext-${navKey}`}
                        ref={iframeRef}
                        className={styles.iframe}
                        src={currentUrl}
                        title={currentUrl}
                        onLoad={handleLoad}
                    />
                )}
            </div>

            {/* Status bar */}
            <div className={styles.statusBar}>
                <span className={styles.statusText}>
                    {isLoading ? `⏳ ${t('ie.status.loading')}` : status}
                </span>
                <div className={styles.statusZone}>
                    <span>{isHome ? `🖥️ ${t('ie.status.localZone')}` : `🌐 ${t('ie.status.internetZone')}`}</span>
                </div>
            </div>
        </div>
    );
}
