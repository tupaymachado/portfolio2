import { useState } from 'react';
import styles from './AboutMeApp.module.css';
import { useWindowStore, useWindowContext } from '../../../stores/useWindowStore';
import profilePhoto from '../../../assets/icons/main.png';

type Tab = 'geral' | 'habilidades' | 'experiencia' | 'contato';

const TABS: { id: Tab; label: string }[] = [
  { id: 'geral', label: 'Geral' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'experiencia', label: 'Experiência' },
  { id: 'contato', label: 'Contato' },
];

const SKILLS = [
  {
    category: 'Front-end',
    items: [
      { name: 'React', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'CSS / SCSS', level: 80 },
      { name: 'HTML', level: 95 },
    ],
  },
  {
    category: 'Back-end & Tools',
    items: [
      { name: 'Node.js', level: 70 },
      { name: 'Firebase', level: 75 },
      { name: 'Git', level: 85 },
      { name: 'Figma', level: 65 },
    ],
  },
];

const EXPERIENCE = [
  {
    date: '2024 – Atual',
    title: 'Desenvolvedor Front-end',
    subtitle: 'Nome da Empresa',
    description: 'Descrição das responsabilidades e tecnologias utilizadas.',
  },
  {
    date: '2022 – 2024',
    title: 'Desenvolvedor Júnior',
    subtitle: 'Nome da Empresa',
    description: 'Descrição das responsabilidades e tecnologias utilizadas.',
  },
  {
    date: '2020 – 2023',
    title: 'Bacharelado em Ciência da Computação',
    subtitle: 'Nome da Universidade',
    description: '',
  },
];

const CONTACTS = [
  { label: 'GitHub', url: 'https://github.com/tupaymachado', emoji: '💻' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/seu-perfil', emoji: '💼' },
  { label: 'E-mail', url: 'mailto:seuemail@example.com', emoji: '✉️' },
];

export default function AboutMeApp() {
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  const { instanceId } = useWindowContext();
  const closeWindow = useWindowStore(state => state.closeWindow);

  return (
    <div className={styles.container}>
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
                <span className={styles.geralName}>Seu Nome Aqui</span>
                <span className={styles.geralTitle}>Desenvolvedor Full-Stack</span>
                <span className={styles.geralLocation}>📍 São Paulo, Brasil</span>
              </div>
            </div>
            <div className={styles.divider} />
            <p className={styles.geralBio}>
              Olá! Sou um desenvolvedor apaixonado por criar experiências digitais únicas e
              funcionais. Tenho experiência com React, TypeScript, Node.js e outras
              tecnologias modernas de desenvolvimento web.
            </p>
            <p className={styles.geralBio}>
              Este portfólio foi construído com React + TypeScript simulando o ambiente
              clássico do Windows XP — porque nostalgia e tecnologia combinam muito bem.
            </p>
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
                      <div
                        className={styles.skillBarFill}
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <span className={styles.skillPercent}>{skill.level}%</span>
                  </div>
                ))}
              </div>
            ))}
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

        {activeTab === 'contato' && (
          <div className={styles.contactTab}>
            <p className={styles.contactInfo}>
              Fique à vontade para entrar em contato!
            </p>
            <div className={styles.contactList}>
              {CONTACTS.map(c => (
                <a
                  key={c.label}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactBtn}
                >
                  <span className={styles.contactEmoji}>{c.emoji}</span>
                  {c.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.footerBtn} onClick={() => closeWindow(instanceId)}>
          OK
        </button>
      </div>
    </div>
  );
}
