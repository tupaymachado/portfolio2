import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AboutMeApp.module.css';
import profilePhoto from '../../../assets/icons/main.png';
import githubIcon from '../../../assets/icons/github.png';
import linkedinIcon from '../../../assets/icons/linkedin.png';
import emailIcon from '../../../assets/icons/email.webp';

type Tab = 'geral' | 'casos de uso' | 'experiencia' | 'creditos' | 'contato';

interface SkillCard {
  title: string;
  category: string;
  description: string;
  skills: string[];
}

interface CreditItem {
  name: string;
  description: string;
  url?: string;
}

// URLs dos contatos — não precisam de tradução
const CONTACT_URLS = [
  { key: 'github', url: 'https://github.com/tupaymachado', icon: githubIcon },
  { key: 'linkedin', url: 'https://www.linkedin.com/in/tupaymachado', icon: linkedinIcon },
  { key: 'email', url: 'mailto:tupay.machado@gmail.com', icon: emailIcon },
];

interface ExperienceItem {
  date: string;
  title: string;
  subtitle: string;
  description: string;
}

export default function AboutMeApp() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('geral');

  const TABS: { id: Tab; label: string }[] = [
    { id: 'geral', label: t('aboutMe.tabs.general') },
    { id: 'experiencia', label: t('aboutMe.tabs.experience') },
    { id: 'casos de uso', label: t('aboutMe.tabs.skills') },
    { id: 'contato', label: t('aboutMe.tabs.contact') },
    { id: 'creditos', label: t('aboutMe.tabs.credits') },
  ];

  const SKILL_CARDS = t('aboutMe.skills.items', { returnObjects: true }) as SkillCard[];

  const EXPERIENCE = t('aboutMe.experience.items', { returnObjects: true }) as ExperienceItem[];

  const CREDITS = t('aboutMe.credits.items', { returnObjects: true }) as CreditItem[];

  return (
    <div className={styles.container}>
      <div className={styles.tabsContainer}>
        <div className={styles.tabBar}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'geral' && (
            <div className={styles.geralTab}>
              <div className={styles.geralHeader}>
                <img src={profilePhoto} alt="Foto de perfil" className={styles.avatar} />
                <div className={styles.geralInfo}>
                  <span className={styles.geralName}>Tupay Machado</span>
                  <span className={styles.geralTitle}>{t('aboutMe.general.title')}</span>
                  <span className={styles.geralLocation}>{t('aboutMe.general.location')}</span>
                </div>
              </div>
              <div className={styles.divider} />
              <p className={styles.geralBio}>{t('aboutMe.general.bio1')}</p>
              <p className={styles.geralBio}>{t('aboutMe.general.bio2')}</p>
              <p className={styles.geralBio}>{t('aboutMe.general.bio3')}</p>
            </div>
          )}

          {activeTab === 'experiencia' && (
            <div className={styles.timeline}>
              {EXPERIENCE.map((item, i) => (
                <div key={i} className={styles.timelineItem}>
                  <span className={styles.timelineDate}>{item.date}</span>
                  <span className={styles.timelineTitle}>{item.title}</span>
                  <span className={styles.timelineSubtitle}>{item.subtitle}</span>
                  {item.description && (
                    <span className={styles.timelineDescription}>{item.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'casos de uso' && (
            <div className={styles.timeline}>
              {SKILL_CARDS.map((card, i) => (
                <div key={i} className={styles.timelineItem}>
                  <span className={styles.timelineDate}>{card.category}</span>
                  <span className={styles.timelineTitle}>{card.title}</span>
                  {card.description && (
                    <span className={styles.timelineDescription}>{card.description}</span>
                  )}
                  <span className={styles.timelineSubtitle} style={{ marginTop: '4px' }}>{card.skills.join(' • ')}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'creditos' && (
            <div className={styles.creditsTab}>
              <p className={styles.creditsIntro}>{t('aboutMe.credits.intro')}</p>
              <div className={styles.creditsList}>
                {CREDITS.map((item, i) => (
                  <div key={i} className={styles.creditItem}>
                    <div className={styles.creditItemHeader}>
                      <span className={styles.creditName}>{item.name}</span>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.creditLink}>
                          Link ↗
                        </a>
                      )}
                    </div>
                    <p className={styles.creditDesc}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contato' && (
            <div className={styles.contactTab}>
              <p className={styles.contactInfo}>{t('aboutMe.contact.intro')}</p>
              <div className={styles.contactList}>
                {CONTACT_URLS.map(c => (
                  <a
                    key={c.key}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.contactBtn}
                  >
                    <img src={c.icon} alt="" className={styles.contactIcon} />
                    {t(`aboutMe.contact.${c.key}`)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
