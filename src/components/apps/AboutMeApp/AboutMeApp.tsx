import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AboutMeApp.module.css';
import profilePhoto from '../../../assets/icons/main.png';

type Tab = 'geral' | 'habilidades' | 'experiencia' | 'contato';

interface SkillCard {
  title: string;
  category: string;
  description: string;
  skills: string[];
}

// URLs dos contatos — não precisam de tradução
const CONTACT_URLS = [
  { key: 'github', url: 'https://github.com/tupaymachado', emoji: '💻' },
  { key: 'linkedin', url: 'https://www.linkedin.com/in/tupaymachado', emoji: '💼' },
  { key: 'email', url: 'mailto:tupay.machado@gmail.com', emoji: '✉️' },
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
    { id: 'habilidades', label: t('aboutMe.tabs.skills') },
    { id: 'contato', label: t('aboutMe.tabs.contact') },
  ];

  const SKILL_CARDS = t('aboutMe.skills.items', { returnObjects: true }) as SkillCard[];

  const EXPERIENCE = t('aboutMe.experience.items', { returnObjects: true }) as ExperienceItem[];

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

          {activeTab === 'habilidades' && (
            <div className={styles.skillsGrid}>
              {SKILL_CARDS.map((card, i) => (
                <div key={i} className={styles.skillCard}>
                  <span className={styles.skillCardCategory}>{card.category}</span>
                  <div className={styles.skillCardTitle}>{card.title}</div>
                  <p className={styles.skillCardDescription}>{card.description}</p>
                  <div className={styles.skillCardTags}>
                    {card.skills.map(tag => (
                      <span key={tag} className={styles.skillTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
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
                    <span className={styles.contactEmoji}>{c.emoji}</span>
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
