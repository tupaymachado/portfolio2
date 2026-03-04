export const HOME_PAGE = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Tupay - Desenvolvedor Front-end</title>
  <style type="text/css">
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 0;
      background: #c8d8ec;
      font-family: Verdana, Arial, sans-serif;
      font-size: 11px;
      color: #000033;
    }
    a { color: #003399; text-decoration: underline; }
    a:hover { color: #cc0000; }

    /* ── HEADER ── */
    #header {
      background: #003399;
      color: #fff;
      border-bottom: 3px solid #ffcc00;
    }
    #header-inner {
      padding: 10px 14px 6px;
    }
    #header-name {
      font-size: 22px;
      font-weight: bold;
      font-family: 'Comic Sans MS', Verdana, sans-serif;
      letter-spacing: 1px;
    }
    #header-sub {
      font-size: 10px;
      color: #99bbff;
      margin-top: 2px;
    }

    /* ── NAVBAR ── */
    #navbar {
      background: #0044bb;
      padding: 0;
      border-bottom: 1px solid #ffcc00;
      display: flex;
    }
    #navbar a {
      color: #fff;
      text-decoration: none;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: bold;
      border-right: 1px solid #336acc;
      display: block;
    }
    #navbar a:hover { background: #0066ff; color: #ffff00; }

    /* ── LAYOUT ── */
    #layout { display: flex; align-items: flex-start; min-height: 400px; }

    /* ── SIDEBAR ── */
    #sidebar {
      width: 148px;
      flex-shrink: 0;
      background: #bed0e8;
      border-right: 1px solid #8aaccc;
      padding: 8px 6px;
      min-height: 100%;
    }
    .sb-box { background: #fff; border: 1px solid #7799cc; margin-bottom: 8px; }
    .sb-title {
      background: #003399; color: #fff;
      font-weight: bold; font-size: 10px;
      padding: 2px 5px; text-transform: uppercase;
    }
    .sb-body { padding: 5px 6px; }
    .sb-body a { display: block; padding: 2px 0; font-size: 11px; }
    .info-row { margin-bottom: 3px; }
    .counter {
      font-family: 'Courier New', monospace;
      background: #000; color: #00ff00;
      padding: 1px 6px; font-size: 12px;
      display: inline-block; letter-spacing: 2px;
    }
    .construction {
      background: #ffffaa; border: 1px dashed #ccaa00;
      text-align: center; padding: 4px 2px;
      font-size: 10px; margin-top: 4px;
    }

    /* ── CONTENT ── */
    #content { flex: 1; padding: 8px 10px; background: #f0f5ff; }
    .box { background: #fff; border: 1px solid #99aacc; margin-bottom: 10px; }
    .box-title {
      background: #003399; color: #fff;
      font-size: 11px; font-weight: bold;
      padding: 4px 8px; border-bottom: 2px solid #ffcc00;
    }
    .box-body { padding: 8px 10px; }
    p { margin: 0 0 7px; line-height: 1.55; }
    h4 { margin: 0 0 5px; font-size: 11px; color: #003399; }

    /* ── SKILLS ── */
    .skill { display: flex; align-items: center; margin-bottom: 4px; gap: 6px; }
    .skill-name { width: 110px; font-size: 10px; flex-shrink: 0; }
    .skill-track {
      flex: 1; height: 9px;
      background: #dde; border: 1px inset #aaa;
      max-width: 160px;
    }
    .skill-fill {
      height: 100%;
      background: linear-gradient(to bottom, #5599ff, #0044cc);
    }
    .skill-pct { font-size: 10px; width: 28px; text-align: right; color: #333; }

    /* ── EXPERIENCE ── */
    .xp-row { display: flex; gap: 8px; margin-bottom: 6px; }
    .xp-date { width: 80px; flex-shrink: 0; color: #003399; font-weight: bold; font-size: 10px; padding-top: 1px; }
    .xp-body { flex: 1; }
    .xp-title { font-weight: bold; font-size: 11px; }
    .xp-company { color: #555; font-size: 10px; }
    .xp-desc { color: #333; font-size: 10px; margin-top: 1px; }
    .divider { border: none; border-top: 1px dotted #aabbd0; margin: 5px 0; }

    /* ── CONTACT ── */
    .contact-row { margin-bottom: 5px; }

    /* ── FOOTER ── */
    #footer {
      background: #003399; color: #aaccff;
      text-align: center; padding: 5px;
      font-size: 10px; border-top: 2px solid #ffcc00;
    }
  </style>
</head>
<body>

<div id="header">
  <div id="header-inner">
    <div id="header-name">&#10022; Tupay &#10022;</div>
    <div id="header-sub">Desenvolvedor Front-end &bull; React &bull; TypeScript &bull; Brasil &#127463;&#127479;</div>
  </div>
</div>

<div id="navbar">
  <a href="#">Inicio</a>
  <a href="#">Sobre</a>
  <a href="#">Projetos</a>
  <a href="#">Skills</a>
  <a href="#">Contato</a>
</div>

<div id="layout">

  <!-- SIDEBAR -->
  <div id="sidebar">

    <div class="sb-box">
      <div class="sb-title">&#9889; Links</div>
      <div class="sb-body">
        <a href="https://github.com/tupaymachado" target="_blank">&#128187; GitHub</a>
        <a href="https://linkedin.com/in/seu-perfil" target="_blank">&#128188; LinkedIn</a>
        <a href="mailto:seuemail@example.com">&#9993; E-mail</a>
      </div>
    </div>

    <div class="sb-box">
      <div class="sb-title">&#128203; Info</div>
      <div class="sb-body">
        <div class="info-row"><b>Nome:</b> Tupay</div>
        <div class="info-row"><b>Pais:</b> Brasil</div>
        <div class="info-row"><b>Area:</b> Front-end</div>
        <div class="info-row"><b>Status:</b> <span style="color:#00aa00">&#9679; Online</span></div>
      </div>
    </div>

    <div class="sb-box">
      <div class="sb-title">&#128101; Visitas</div>
      <div class="sb-body" style="text-align:center">
        <div class="counter">001337</div>
        <br><small>desde 2024</small>
      </div>
    </div>

    <div class="construction">
      &#128679; Em construcao! &#128679;
    </div>

  </div>

  <!-- CONTENT -->
  <div id="content">

    <div class="box">
      <div class="box-title">&#127968; Bem-vindo!</div>
      <div class="box-body">
        <p>
          Ola! Sou <b>Tupay</b>, desenvolvedor front-end focado em criar
          interfaces modernas, interativas e com atencao aos detalhes.
          Apaixonado por boas experiencias de usuario e codigo limpo.
        </p>
        <p>
          Este portfolio foi construido como um <b>desktop Windows XP interativo</b>
          &mdash; navegue pelos programas para conhecer meu trabalho!
        </p>
        <p style="color:#666; font-size:10px; margin:0">
          &raquo; Otimizado para Internet Explorer 6.0 &bull; Resolucao 800x600
        </p>
      </div>
    </div>

    <div class="box">
      <div class="box-title">&#128187; Habilidades Tecnicas</div>
      <div class="box-body">
        <h4>Front-end</h4>
        <div class="skill"><span class="skill-name">React</span><div class="skill-track"><div class="skill-fill" style="width:90%"></div></div><span class="skill-pct">90%</span></div>
        <div class="skill"><span class="skill-name">TypeScript</span><div class="skill-track"><div class="skill-fill" style="width:85%"></div></div><span class="skill-pct">85%</span></div>
        <div class="skill"><span class="skill-name">HTML / CSS</span><div class="skill-track"><div class="skill-fill" style="width:95%"></div></div><span class="skill-pct">95%</span></div>

        <h4 style="margin-top:8px">Back-end &amp; Ferramentas</h4>
        <div class="skill"><span class="skill-name">Node.js</span><div class="skill-track"><div class="skill-fill" style="width:70%"></div></div><span class="skill-pct">70%</span></div>
        <div class="skill"><span class="skill-name">Firebase</span><div class="skill-track"><div class="skill-fill" style="width:75%"></div></div><span class="skill-pct">75%</span></div>
        <div class="skill"><span class="skill-name">Git</span><div class="skill-track"><div class="skill-fill" style="width:85%"></div></div><span class="skill-pct">85%</span></div>
        <div class="skill"><span class="skill-name">Figma</span><div class="skill-track"><div class="skill-fill" style="width:65%"></div></div><span class="skill-pct">65%</span></div>
      </div>
    </div>

    <div class="box">
      <div class="box-title">&#128196; Experiencia</div>
      <div class="box-body">
        <div class="xp-row">
          <div class="xp-date">2024 &ndash; Atual</div>
          <div class="xp-body">
            <div class="xp-title">Desenvolvedor Front-end</div>
            <div class="xp-company">Nome da Empresa</div>
            <div class="xp-desc">Responsabilidades e tecnologias utilizadas.</div>
          </div>
        </div>
        <hr class="divider">
        <div class="xp-row">
          <div class="xp-date">2022 &ndash; 2024</div>
          <div class="xp-body">
            <div class="xp-title">Desenvolvedor Junior</div>
            <div class="xp-company">Nome da Empresa</div>
            <div class="xp-desc">Responsabilidades e tecnologias utilizadas.</div>
          </div>
        </div>
        <hr class="divider">
        <div class="xp-row">
          <div class="xp-date">2020 &ndash; 2023</div>
          <div class="xp-body">
            <div class="xp-title">Bacharelado em Ciencia da Computacao</div>
            <div class="xp-company">Nome da Universidade</div>
          </div>
        </div>
      </div>
    </div>

    <div class="box">
      <div class="box-title">&#9993; Contato</div>
      <div class="box-body">
        <div class="contact-row">&#128187; <a href="https://github.com/tupaymachado" target="_blank">github.com/tupaymachado</a></div>
        <div class="contact-row">&#128188; <a href="https://linkedin.com/in/seu-perfil" target="_blank">linkedin.com/in/seu-perfil</a></div>
        <div class="contact-row">&#9993; <a href="mailto:seuemail@example.com">seuemail@example.com</a></div>
      </div>
    </div>

  </div>
</div>

<div id="footer">
  &copy; 2024 Tupay &bull; Desenvolvedor Front-end &bull;
  Melhor visualizado no Internet Explorer 6.0 &bull; 800x600
</div>

</body>
</html>`;
