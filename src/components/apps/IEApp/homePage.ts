interface HomeContent {
    pageTitle: string;
    headerSub: string;
    nav: { home: string; about: string; projects: string; skills: string; contact: string };
    links: string;
    info: { name: string; country: string; area: string; status: string; online: string };
    visits: string; since: string;
    construction: string;
    welcome: { title: string; body1: string; body2: string; tip: string };
    skillsTitle: string; frontend: string; backendTools: string;
    xpTitle: string;
    contactTitle: string;
    footer: string;
    xp: {
        items: { date: string; title: string; company: string; desc?: string }[];
    };
}

const PT: HomeContent = {
    pageTitle: 'Tupay - Desenvolvedor Front-end',
    headerSub: 'Desenvolvedor Front-end &bull; React &bull; TypeScript &bull; Brasil &#127463;&#127479;',
    nav: { home: 'Inicio', about: 'Sobre', projects: 'Projetos', skills: 'Skills', contact: 'Contato' },
    links: 'Links',
    info: { name: 'Nome:', country: 'Pais:', area: 'Area:', status: 'Status:', online: '&#9679; Online' },
    visits: 'Visitas', since: 'desde 2024',
    construction: '&#128679; Em construcao! &#128679;',
    welcome: {
        title: '&#127968; Bem-vindo!',
        body1: 'Ola! Sou <b>Tupay</b>, desenvolvedor front-end focado em criar interfaces modernas, interativas e com atencao aos detalhes. Apaixonado por boas experiencias de usuario e codigo limpo.',
        body2: 'Este portfolio foi construido como um <b>desktop Windows XP interativo</b> &mdash; navegue pelos programas para conhecer meu trabalho!',
        tip: '&raquo; Otimizado para Internet Explorer 6.0 &bull; Resolucao 800x600',
    },
    skillsTitle: '&#128187; Habilidades Tecnicas',
    frontend: 'Front-end',
    backendTools: 'Back-end &amp; Ferramentas',
    xpTitle: '&#128196; Experiencia',
    contactTitle: '&#9993; Contato',
    footer: '&copy; 2024 Tupay &bull; Desenvolvedor Front-end &bull; Melhor visualizado no Internet Explorer 6.0 &bull; 800x600',
    xp: {
        items: [
            { date: '2024 &ndash; Atual',  title: 'Desenvolvedor Front-end', company: 'Nome da Empresa', desc: 'Responsabilidades e tecnologias utilizadas.' },
            { date: '2022 &ndash; 2024',   title: 'Desenvolvedor Junior',    company: 'Nome da Empresa', desc: 'Responsabilidades e tecnologias utilizadas.' },
            { date: '2020 &ndash; 2023',   title: 'Bacharelado em Ciencia da Computacao', company: 'Nome da Universidade' },
        ],
    },
};

const EN: HomeContent = {
    pageTitle: 'Tupay - Front-end Developer',
    headerSub: 'Front-end Developer &bull; React &bull; TypeScript &bull; Brazil &#127463;&#127479;',
    nav: { home: 'Home', about: 'About', projects: 'Projects', skills: 'Skills', contact: 'Contact' },
    links: 'Links',
    info: { name: 'Name:', country: 'Country:', area: 'Field:', status: 'Status:', online: '&#9679; Online' },
    visits: 'Visitors', since: 'since 2024',
    construction: '&#128679; Under construction! &#128679;',
    welcome: {
        title: '&#127968; Welcome!',
        body1: 'Hi! I\'m <b>Tupay</b>, a front-end developer focused on building modern, interactive interfaces with attention to detail. Passionate about great user experiences and clean code.',
        body2: 'This portfolio was built as an <b>interactive Windows XP desktop</b> &mdash; browse the programs to see my work!',
        tip: '&raquo; Best viewed in Internet Explorer 6.0 &bull; 800x600 resolution',
    },
    skillsTitle: '&#128187; Technical Skills',
    frontend: 'Front-end',
    backendTools: 'Back-end &amp; Tools',
    xpTitle: '&#128196; Experience',
    contactTitle: '&#9993; Contact',
    footer: '&copy; 2024 Tupay &bull; Front-end Developer &bull; Best viewed in Internet Explorer 6.0 &bull; 800x600',
    xp: {
        items: [
            { date: '2024 &ndash; Present', title: 'Front-end Developer',        company: 'Company Name',    desc: 'Description of responsibilities and technologies used.' },
            { date: '2022 &ndash; 2024',    title: 'Junior Developer',           company: 'Company Name',    desc: 'Description of responsibilities and technologies used.' },
            { date: '2020 &ndash; 2023',    title: "Bachelor's in Computer Science", company: 'University Name' },
        ],
    },
};

function buildHomePage(c: HomeContent): string {
    const xpRows = c.xp.items.map((item, i) => `
        <div class="xp-row">
            <div class="xp-date">${item.date}</div>
            <div class="xp-body">
                <div class="xp-title">${item.title}</div>
                <div class="xp-company">${item.company}</div>
                ${item.desc ? `<div class="xp-desc">${item.desc}</div>` : ''}
            </div>
        </div>
        ${i < c.xp.items.length - 1 ? '<hr class="divider">' : ''}
    `).join('');

    return `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>${c.pageTitle}</title>
  <style type="text/css">
    * { box-sizing: border-box; }
    body { margin:0; padding:0; background:#c8d8ec; font-family:Verdana,Arial,sans-serif; font-size:11px; color:#000033; }
    a { color:#003399; text-decoration:underline; } a:hover { color:#cc0000; }
    #header { background:#003399; color:#fff; border-bottom:3px solid #ffcc00; }
    #header-inner { padding:10px 14px 6px; }
    #header-name { font-size:22px; font-weight:bold; font-family:'Comic Sans MS',Verdana,sans-serif; letter-spacing:1px; }
    #header-sub { font-size:10px; color:#99bbff; margin-top:2px; }
    #navbar { background:#0044bb; padding:0; border-bottom:1px solid #ffcc00; display:flex; }
    #navbar a { color:#fff; text-decoration:none; padding:4px 12px; font-size:11px; font-weight:bold; border-right:1px solid #336acc; display:block; }
    #navbar a:hover { background:#0066ff; color:#ffff00; }
    #layout { display:flex; align-items:flex-start; min-height:400px; }
    #sidebar { width:148px; flex-shrink:0; background:#bed0e8; border-right:1px solid #8aaccc; padding:8px 6px; }
    .sb-box { background:#fff; border:1px solid #7799cc; margin-bottom:8px; }
    .sb-title { background:#003399; color:#fff; font-weight:bold; font-size:10px; padding:2px 5px; text-transform:uppercase; }
    .sb-body { padding:5px 6px; }
    .sb-body a { display:block; padding:2px 0; font-size:11px; }
    .info-row { margin-bottom:3px; }
    .counter { font-family:'Courier New',monospace; background:#000; color:#00ff00; padding:1px 6px; font-size:12px; display:inline-block; letter-spacing:2px; }
    .construction { background:#ffffaa; border:1px dashed #ccaa00; text-align:center; padding:4px 2px; font-size:10px; margin-top:4px; }
    #content { flex:1; padding:8px 10px; background:#f0f5ff; }
    .box { background:#fff; border:1px solid #99aacc; margin-bottom:10px; }
    .box-title { background:#003399; color:#fff; font-size:11px; font-weight:bold; padding:4px 8px; border-bottom:2px solid #ffcc00; }
    .box-body { padding:8px 10px; }
    p { margin:0 0 7px; line-height:1.55; }
    h4 { margin:0 0 5px; font-size:11px; color:#003399; }
    .skill { display:flex; align-items:center; margin-bottom:4px; gap:6px; }
    .skill-name { width:110px; font-size:10px; flex-shrink:0; }
    .skill-track { flex:1; height:9px; background:#dde; border:1px inset #aaa; max-width:160px; }
    .skill-fill { height:100%; background:linear-gradient(to bottom,#5599ff,#0044cc); }
    .skill-pct { font-size:10px; width:28px; text-align:right; color:#333; }
    .xp-row { display:flex; gap:8px; margin-bottom:6px; }
    .xp-date { width:90px; flex-shrink:0; color:#003399; font-weight:bold; font-size:10px; padding-top:1px; }
    .xp-body { flex:1; }
    .xp-title { font-weight:bold; font-size:11px; }
    .xp-company { color:#555; font-size:10px; }
    .xp-desc { color:#333; font-size:10px; margin-top:1px; }
    .divider { border:none; border-top:1px dotted #aabbd0; margin:5px 0; }
    .contact-row { margin-bottom:5px; }
    #footer { background:#003399; color:#aaccff; text-align:center; padding:5px; font-size:10px; border-top:2px solid #ffcc00; }
  </style>
</head>
<body>
<div id="header">
  <div id="header-inner">
    <div id="header-name">&#10022; Tupay &#10022;</div>
    <div id="header-sub">${c.headerSub}</div>
  </div>
</div>
<div id="navbar">
  <a href="#">${c.nav.home}</a><a href="#">${c.nav.about}</a>
  <a href="#">${c.nav.projects}</a><a href="#">${c.nav.skills}</a>
  <a href="#">${c.nav.contact}</a>
</div>
<div id="layout">
  <div id="sidebar">
    <div class="sb-box">
      <div class="sb-title">&#9889; ${c.links}</div>
      <div class="sb-body">
        <a href="https://github.com/tupaymachado" target="_blank">&#128187; GitHub</a>
        <a href="https://linkedin.com/in/seu-perfil" target="_blank">&#128188; LinkedIn</a>
        <a href="mailto:seuemail@example.com">&#9993; Email</a>
      </div>
    </div>
    <div class="sb-box">
      <div class="sb-title">&#128203; Info</div>
      <div class="sb-body">
        <div class="info-row"><b>${c.info.name}</b> Tupay</div>
        <div class="info-row"><b>${c.info.country}</b> Brasil</div>
        <div class="info-row"><b>${c.info.area}</b> Front-end</div>
        <div class="info-row"><b>${c.info.status}</b> <span style="color:#00aa00">${c.info.online}</span></div>
      </div>
    </div>
    <div class="sb-box">
      <div class="sb-title">&#128101; ${c.visits}</div>
      <div class="sb-body" style="text-align:center">
        <div class="counter">001337</div><br><small>${c.since}</small>
      </div>
    </div>
    <div class="construction">${c.construction}</div>
  </div>
  <div id="content">
    <div class="box">
      <div class="box-title">${c.welcome.title}</div>
      <div class="box-body">
        <p>${c.welcome.body1}</p>
        <p>${c.welcome.body2}</p>
        <p style="color:#666;font-size:10px;margin:0">${c.welcome.tip}</p>
      </div>
    </div>
    <div class="box">
      <div class="box-title">${c.skillsTitle}</div>
      <div class="box-body">
        <h4>${c.frontend}</h4>
        <div class="skill"><span class="skill-name">React</span><div class="skill-track"><div class="skill-fill" style="width:90%"></div></div><span class="skill-pct">90%</span></div>
        <div class="skill"><span class="skill-name">TypeScript</span><div class="skill-track"><div class="skill-fill" style="width:85%"></div></div><span class="skill-pct">85%</span></div>
        <div class="skill"><span class="skill-name">HTML / CSS</span><div class="skill-track"><div class="skill-fill" style="width:95%"></div></div><span class="skill-pct">95%</span></div>
        <h4 style="margin-top:8px">${c.backendTools}</h4>
        <div class="skill"><span class="skill-name">Node.js</span><div class="skill-track"><div class="skill-fill" style="width:70%"></div></div><span class="skill-pct">70%</span></div>
        <div class="skill"><span class="skill-name">Firebase</span><div class="skill-track"><div class="skill-fill" style="width:75%"></div></div><span class="skill-pct">75%</span></div>
        <div class="skill"><span class="skill-name">Git</span><div class="skill-track"><div class="skill-fill" style="width:85%"></div></div><span class="skill-pct">85%</span></div>
      </div>
    </div>
    <div class="box">
      <div class="box-title">${c.xpTitle}</div>
      <div class="box-body">${xpRows}</div>
    </div>
    <div class="box">
      <div class="box-title">${c.contactTitle}</div>
      <div class="box-body">
        <div class="contact-row">&#128187; <a href="https://github.com/tupaymachado" target="_blank">github.com/tupaymachado</a></div>
        <div class="contact-row">&#128188; <a href="https://linkedin.com/in/seu-perfil" target="_blank">linkedin.com/in/seu-perfil</a></div>
        <div class="contact-row">&#9993; <a href="mailto:seuemail@example.com">seuemail@example.com</a></div>
      </div>
    </div>
  </div>
</div>
<div id="footer">${c.footer}</div>
</body>
</html>`;
}

export function getHomePage(lang: string): string {
    return buildHomePage(lang.startsWith('pt') ? PT : EN);
}
