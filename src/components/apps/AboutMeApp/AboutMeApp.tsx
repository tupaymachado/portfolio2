import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AboutMeApp.module.css';
import { useWindowStore, useWindowContext } from '../../../stores/useWindowStore';
import profilePhoto from '../../../assets/icons/main.png';

type Tab = 'geral' | 'habilidades' | 'experiencia' | 'contato';

// Níveis das habilidades — não precisam de tradução
const SKILL_LEVELS = {
  frontend: [{ name: 'React', level: 90 }, { name: 'TypeScript', level: 85 }, { name: 'CSS / SCSS', level: 80 }, { name: 'HTML', level: 95 }],
  backendTools: [{ name: 'Node.js', level: 70 }, { name: 'Firebase', level: 75 }, { name: 'Git', level: 85 }, { name: 'Figma', level: 65 }],
};

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
  const { instanceId } = useWindowContext();
  const closeWindow = useWindowStore(state => state.closeWindow);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'geral', label: t('aboutMe.tabs.general') },
    { id: 'experiencia', label: t('aboutMe.tabs.experience') },
    { id: 'habilidades', label: t('aboutMe.tabs.skills') },
    { id: 'contato', label: t('aboutMe.tabs.contact') },
  ];

  const SKILLS = [
    { category: t('aboutMe.skills.frontend'), items: SKILL_LEVELS.frontend },
    { category: t('aboutMe.skills.backendTools'), items: SKILL_LEVELS.backendTools },
  ];

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
              {SKILLS.map(category => (
                <div key={category.category} className={styles.skillCategory}>
                  <div className={styles.skillCategoryTitle}>{category.category}</div>
                  {category.items.map(skill => (
                    <div key={skill.name} className={styles.skillRow}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <div className={styles.skillBarBg}>
                        <div className={styles.skillBarFill} style={{ width: `${skill.level}%` }} />
                      </div>
                      <span className={styles.skillPercent}>{skill.level}%</span>
                    </div>
                  ))}
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

        <div className={styles.footer}>
          <button className={styles.footerBtn} onClick={() => closeWindow(instanceId)}>
            {t('aboutMe.ok')}
          </button>
        </div>
      </div>
    </div>
  );
}
