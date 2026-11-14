(function () {
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo;

  var PHOTO = 'data:image/jpeg;base64,__PHOTO__';
  var CV_B64 = '__CVPDF__';
  var EMAIL = 'alasalem0@gmail.com', PHONE = '+216 23485998';
  var GITHUB = 'https://github.com/alasalem1';
  var REPO_AUTODIAG = 'https://github.com/alasalem1/auto-diag-linux';
  var REPO_PLATFORM = 'https://github.com/alasalem1/techleef-embedded-linux';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function seenIntro() { try { return sessionStorage.getItem('as-intro') === '1'; } catch (e) { return false; } }
  function markIntro() { try { sessionStorage.setItem('as-intro', '1'); } catch (e) {} }
  function toggleTheme() {
    var root = document.documentElement, cur = root.getAttribute('data-theme');
    var dark = cur === 'dark' || (!cur && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('as-theme', next); } catch (e) {}
  }
  // go through a real anchor click so the section transition handles it
  function gotoSection(id) {
    var a = document.createElement('a'); a.href = '#' + id; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function Ico(p) {
    return (<svg className={'ico ' + (p.cls || '')} aria-hidden="true" dangerouslySetInnerHTML={{ __html: '<use href="#i-' + p.n + '"/>' }}></svg>);
  }
  function Logo() {
    return (<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M15 4h18a11 11 0 0 1 11 11v18a11 11 0 0 1-11 11H15A11 11 0 0 1 4 33V15A11 11 0 0 1 15 4z" fill="var(--accent)"/><g fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 34l6.5-18 6.5 18M13.8 28h8.4"/><path d="M38.5 19.5c-1-2.2-3-3.5-5.4-3.5-3 0-5 1.6-5 4 0 5.5 10.6 3 10.6 8.6 0 2.4-2.2 4-5.2 4-2.4 0-4.4-1.2-5.4-3.4"/></g></svg>);
  }

  /* ---------- header ---------- */
  var NAV = [['home', 'Home'], ['projects', 'Projects'], ['skills', 'Skills'], ['about', 'About'], ['resume', 'Resume'], ['contact', 'Contact']];
  // which section is currently under the header
  function useActive() {
    var a = useState('home'), active = a[0], setActive = a[1];
    useEffect(function () {
      function onScroll() {
        // the section whose top is lowest while still above the reading line (nav order and page order differ)
        var line = 140, cur = 'home', best = -Infinity;
        NAV.forEach(function (n) { var el = document.getElementById(n[0]); if (!el) return; var t = el.getBoundingClientRect().top; if (t <= line && t > best) { best = t; cur = n[0]; } });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = NAV[NAV.length - 1][0];
        setActive(cur);
      }
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
      return function () { window.removeEventListener('scroll', onScroll); };
    }, []);
    return active;
  }
  function Header() {
    var active = useActive();
    var s = useState(false), scrolled = s[0], setScrolled = s[1];
    var navRef = useRef(null);
    var pp = useState({ x: 0, w: 0 }), pill = pp[0], setPill = pp[1];
    useEffect(function () {
      function onScroll() { setScrolled(window.scrollY > 8); }
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
      return function () { window.removeEventListener('scroll', onScroll); };
    }, []);
    useEffect(function () {
      // slide the blue pill under the active link
      function place() { var nav = navRef.current, el = nav && nav.querySelector('a.on'); if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth }); }
      place();
      window.addEventListener('resize', place);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
      return function () { window.removeEventListener('resize', place); };
    }, [active]);
    useEffect(function () {
      try { var t = localStorage.getItem('as-theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
    }, []);
    var toggle = toggleTheme;
    return (<div className={'topbar' + (scrolled ? ' scrolled' : '')}>
      <header className="wrap top">
        <a className="brand" href="#home" aria-label="Ala Salem, home"><Logo/><span><b>Ala Salem</b><small>Embedded Linux Engineering</small></span></a>
        <nav className="nav" aria-label="Sections" ref={navRef}>
          <i className="pill" aria-hidden="true" style={{ transform: 'translateX(' + pill.x + 'px)', width: pill.w }}></i>
          {NAV.map(function (n) { return (<a key={n[0]} className={active === n[0] ? 'on' : ''} href={'#' + n[0]}>{n[1]}</a>); })}
        </nav>
        <div className="social">
          <a className="icon-btn" href={GITHUB} target="_blank" rel="noopener" aria-label="GitHub"><Ico n="branch"/></a>
          <a className="icon-btn" href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><Ico n="in"/></a>
          <button className="search-btn" type="button" aria-label="Open command menu" onClick={function () { window.dispatchEvent(new Event('as-palette')); }}><Ico n="search"/><span>Search</span><kbd>Ctrl K</kbd></button>
          <button className="icon-btn" id="themeBtn" type="button" aria-label="Toggle dark mode" onClick={toggle}><Ico n="moon" cls="moon"/><Ico n="sun" cls="sun"/></button>
        </div>
      </header>
    </div>);
  }

  /* ---------- hero ---------- */
  function chipSVG() {
    var cx0 = 214, cy0 = 174, s = 232, n = 9, base = '', flow = '', dots = '';
    function add(d, dot, i) {
      base += '<path class="tr-base" d="' + d + '"/>';
      flow += '<path class="tr-flow" style="animation-delay:-' + ((i * 0.37) % 2.2).toFixed(2) + 's" d="' + d + '"/>';
      dots += '<circle cx="' + dot[0] + '" cy="' + dot[1] + '" r="3.2" fill="#bcd6ff"/>';
    }
    for (var i = 0; i < n; i++) {
      var o = 22 + i * 24, j = (i % 3) * 14, len = 60 + ((i * 37) % 70), k = i < 4 ? -1 : 1;
      add('M' + (cx0 + o) + ' ' + cy0 + 'v-' + (24 + j) + 'l' + k * (30 + j) + ' -' + (30 + j) + 'v-' + len, [cx0 + o + k * (30 + j), cy0 - 24 - j - 30 - j - len], i);
      add('M' + (cx0 + o) + ' ' + (cy0 + s) + 'v' + (22 + j) + 'l' + (-k) * (26 + j) + ' ' + (26 + j) + 'v' + len, [cx0 + o + (-k) * (26 + j), cy0 + s + 22 + j + 26 + j + len], i + 2);
      add('M' + cx0 + ' ' + (cy0 + o) + 'h-' + (24 + j) + 'l-' + (28 + j) + ' ' + k * (28 + j) + 'h-' + len, [cx0 - 24 - j - 28 - j - len, cy0 + o + k * (28 + j)], i + 4);
      add('M' + (cx0 + s) + ' ' + (cy0 + o) + 'h' + (24 + j) + 'l' + (28 + j) + ' ' + (-k) * (28 + j) + 'h' + len, [cx0 + s + 24 + j + 28 + j + len, cy0 + o + (-k) * (28 + j)], i + 6);
    }
    return '<svg viewBox="0 0 640 560" preserveAspectRatio="xMidYMid meet" overflow="visible" aria-hidden="true">' +
      '<defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="chipFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2c5c"/><stop offset=".55" stop-color="#0a1330"/><stop offset="1" stop-color="#050a1c"/></linearGradient>' +
      '<linearGradient id="chipEdge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb0ff"/><stop offset="1" stop-color="#1f5ff0"/></linearGradient>' +
      '<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2f7bff" stop-opacity=".55"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></radialGradient></defs>' +
      '<circle class="halo" cx="330" cy="290" r="250" fill="url(#halo)"/>' +
      '<g class="chip-bob">' +
      '<g filter="url(#glow)" fill="none" stroke="#3d8bff" stroke-width="2" stroke-linecap="round">' + base + '</g>' +
      '<g filter="url(#glow)" fill="none" stroke="#9cc8ff" stroke-width="2.6" stroke-linecap="round">' + flow + '</g>' +
      '<g filter="url(#glow)">' + dots + '</g>' +
      '<rect x="230" y="190" width="200" height="200" rx="22" fill="#0a1736" stroke="#2f7bff" stroke-opacity=".5" stroke-width="2"/>' +
      '<rect x="214" y="174" width="232" height="232" rx="28" fill="url(#chipFill)" stroke="url(#chipEdge)" stroke-width="2.5" filter="url(#glow)"/>' +
      '<rect x="232" y="192" width="196" height="196" rx="16" fill="none" stroke="#2f6fe8" stroke-opacity=".55"/>' +
      '<circle cx="246" cy="206" r="4" fill="#6aa2ff"/>' +
      '<text x="330" y="294" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="34" fill="#e8f0ff" letter-spacing="1">Linux</text>' +
      '<text x="330" y="324" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="11" fill="#8fb2f5" letter-spacing="3">YOCTO · KAS · BITBAKE</text>' +
      '</g></svg>';
  }

  function Term() {
    var cmds = ['bitbake core-image-minimal', 'kas build kas.yml', 'candump vcan0', 'systemctl status ecu'];
    var st = useState(cmds[0]), txt = st[0], setTxt = st[1];
    useEffect(function () {
      if (reduce) return;
      var i = 0, j = 0, del = false, t;
      function tick() {
        var c = cmds[i];
        if (!del) {
          j++; setTxt(c.slice(0, j));
          if (j === c.length) { del = true; t = setTimeout(tick, 1800); return; }
          t = setTimeout(tick, 50 + Math.random() * 55);
        } else {
          j--; setTxt(c.slice(0, j));
          if (j === 0) { del = false; i = (i + 1) % cmds.length; t = setTimeout(tick, 350); return; }
          t = setTimeout(tick, 20);
        }
      }
      t = setTimeout(tick, 2200);
      return function () { clearTimeout(t); };
    }, []);
    return (<div className="term" role="img" aria-label="Terminal showing build commands"><span className="pr">$</span><span>{txt}</span><i className="caret"></i></div>);
  }

  function Hero() {
    var ref = useRef(null);
    var chip = useMemo(chipSVG, []);
    useEffect(function () {
      var el = ref.current; if (!el || reduce) return;
      function mv(e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        el.style.setProperty('--px', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--py', (e.clientY - r.top).toFixed(0) + 'px');
      }
      el.addEventListener('pointermove', mv);
      return function () { el.removeEventListener('pointermove', mv); };
    }, []);
    return (<section className="hero" id="home" ref={ref}>
      <div className="hero-art" aria-hidden="true"><div dangerouslySetInnerHTML={{ __html: chip }}></div></div>
      <div className="wrap hero-in">
        <div>
          <span className="badge in" style={{ '--d': 0 }}><i></i>Open to new opportunities</span>
          <h1 className="in" style={{ '--d': 1 }}>Building the Next Generation of <em>Embedded Systems.<svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C60 2 130 2 198 5"/></svg></em></h1>
          <div className="in" style={{ '--d': 2 }}><Term/></div>
          <p className="lead in" style={{ '--d': 3 }}>I'm <b>Ala Salem</b>, a junior Embedded Linux / Yocto developer and embedded systems graduate from ISIMG Gabès. I build custom Linux images, work close to the kernel and care about secure, reliable updates.</p>
          <div className="cta in" style={{ '--d': 4 }}>
            <a className="btn primary" href="#projects"><Ico n="code"/>Explore My Projects<Ico n="arrow"/></a>
            <button className="btn ghost" type="button" onClick={downloadCV}><Ico n="download"/>Download CV</button>
          </div>
          <div className="stats in" style={{ '--d': 5 }}>
            <div className="stat"><Ico n="briefcase"/><div><b>2</b><span>GitHub Projects</span></div></div>
            <div className="stat"><Ico n="code"/><div><b>Yocto</b><span>& Linux</span></div></div>
            <div className="stat"><Ico n="bolt"/><div><b>2</b><span>Internships</span></div></div>
          </div>
        </div>
        <div aria-hidden="true"></div>
      </div>
    </section>);
  }

  /* ---------- CV download ---------- */
  async function downloadCV() {
    var bytes = Uint8Array.from(atob(CV_B64), function (c) { return c.charCodeAt(0); });
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var dl = null;
    try { dl = window.claude ? await window.claude.use('downloads') : null; } catch (e) {}
    if (dl) { try { await dl.save({ filename: 'Ala-Salem-CV.pdf', data: blob }); } catch (e) {} return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Ala-Salem-CV.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- skills ---------- */
  var SKILLS = [['layers', 'Yocto Project'], ['terminal', 'Linux'], ['hammer', 'BitBake'], ['box', 'KAS'], ['whale', 'Docker'], ['branch', 'Git'],
    ['m:C', 'C & C++'], ['m:Py', 'Python'], ['sync', 'RAUC OTA'], ['tree', 'Device Tree'], ['bus', 'CAN · UDS'], ['board', 'Raspberry Pi']];
  function Skills() {
    return (<section className="panel skills rv" id="skills">
      <div>
        <span className="eyebrow">My Technical Skills</span>
        <h2>Technologies & Tools</h2>
        <p>The toolkit I use to build, secure and update embedded Linux systems.</p>
        <a className="btn ghost small" href={GITHUB} target="_blank" rel="noopener">See my GitHub<Ico n="arrow"/></a>
      </div>
      <div className="tiles">
        {SKILLS.map(function (s, i) {
          var mono = s[0].indexOf('m:') === 0;
          return (<div key={s[1]} className="tile rv" style={{ animationRange: 'entry ' + (i % 6) * 4 + '% entry ' + (40 + (i % 6) * 4) + '%' }}>
            {mono ? (<span className="mono">{s[0].slice(2)}</span>) : (<Ico n={s[0]}/>)}{s[1]}</div>);
        })}
      </div>
    </section>);
  }

  /* ---------- projects ---------- */
  var carArt = '<svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid meet"><g fill="none" stroke="#7fb8ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path class="car" d="M110 112c0-8 6-12 16-14l24-20c8-6 18-8 30-8h46c14 0 24 4 34 14l24 12c10 3 14 8 14 16v6H110z" fill="#1a56d6" fill-opacity=".25"/><path class="car" d="M160 78l-12 20h60V70M214 70v28h72l-20-16c-8-6-16-12-26-12z" opacity=".7"/><circle cx="158" cy="118" r="12" fill="#0a1a48"/><circle cx="272" cy="118" r="12" fill="#0a1a48"/></g><path d="M20 150h360" stroke="#2f7bff" stroke-opacity=".55" stroke-dasharray="3 6"/><g fill="#bcd6ff"><rect class="pkt" x="30" y="146" width="14" height="8" rx="2"/><rect class="pkt" style="animation-delay:-1.1s" x="30" y="146" width="14" height="8" rx="2"/><rect class="pkt" style="animation-delay:-2.2s" x="30" y="146" width="14" height="8" rx="2"/></g><text x="24" y="30" fill="#8fb2f5" font-family="JetBrains Mono, monospace" font-size="11">CAN · ISO-TP · UDS</text></svg>';
  var layerArt = '<svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMid meet"><g fill="#1a56d6" fill-opacity=".32" stroke="#8fc0ff" stroke-width="2" stroke-linejoin="round"><g class="lay"><path d="M200 112l70-30-70-30-70 30z" fill-opacity=".18"/></g><g class="lay"><path d="M200 96l70-30-70-30-70 30z" fill-opacity=".3"/></g><g class="lay"><path d="M200 80l70-30-70-30-70 30z" fill-opacity=".5"/></g></g><g fill="#bcd6ff" font-family="JetBrains Mono, monospace" font-size="11"><text x="24" y="30">meta-bsp</text><text x="24" y="148">meta-distro</text><text x="300" y="30">kas · docker</text></g></svg>';

  function Tilt(p) {
    var ref = useRef(null);
    function mv(e) {
      if (reduce || e.pointerType === 'touch') return;
      var el = ref.current, r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
    }
    function lv() { var el = ref.current; el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); }
    return (<article className="panel card rv" ref={ref} onPointerMove={mv} onPointerLeave={lv}>{p.children}</article>);
  }


  var ARCH = {
    autodiag: [
      ['i-layers', 'Qt 6 tester', 'Quick actions, automatic TesterPresent every 2 s'],
      ['i-bus', 'SocketCAN and ISO-TP', 'Virtual CAN carries the diagnostic frames'],
      ['i-code', 'UDS server in C', 'Ten services: sessions, SecurityAccess, DTCs'],
      ['i-chip', 'Simulated ECU in QEMU', 'The whole image boots from a Yocto build']
    ],
    platform: [
      ['i-sync', 'KAS configuration', 'One file describes layers and build settings'],
      ['i-whale', 'Docker environment', 'Same toolchain on every machine'],
      ['i-hammer', 'BitBake', 'BSP, distro and platform layers on Scarthgap'],
      ['i-box', 'Reproducible image', 'Any machine produces the same output']
    ]
  };
  function Arch(p) {
    var o = useState(false), open = o[0], setOpen = o[1];
    var id = 'arch-' + p.k, steps = ARCH[p.k];
    return (<div className={'arch' + (open ? ' open' : '')}>
      <button type="button" className="arch-btn" aria-expanded={open} aria-controls={id} onClick={function () { setOpen(!open); }}>
        <Ico n="layers"/>{open ? 'Hide architecture' : 'How it works'}<i className="chev" aria-hidden="true"></i>
      </button>
      <div className="arch-wrap" id={id} role="region" aria-label={p.name + ' architecture'}>
        <ol className="flow">
          {steps.map(function (s, i) {
            return (<li key={i} style={{ '--i': i }}>
              <span className="nd"><svg className="ico" aria-hidden="true"><use href={'#' + s[0]}/></svg></span>
              <span className="tx"><b>{s[1]}</b><small>{s[2]}</small></span>
            </li>);
          })}
        </ol>
      </div>
    </div>);
  }

  function Projects() {
    return (<section id="projects">
      <div className="head rv">
        <span className="eyebrow both">My Featured Projects</span>
        <h2>Turning Ideas into Real-World Solutions</h2>
        <a className="more" href={GITHUB} target="_blank" rel="noopener">View All Projects<Ico n="arrow"/></a>
      </div>
      <div className="projects">
        <Tilt>
          <div className="thumb" dangerouslySetInnerHTML={{ __html: carArt + '<span class="lbl">auto-diag-linux</span>' }}></div>
          <div className="card-body">
            <h3>auto-diag-linux</h3>
            <p>A Yocto-built Linux distribution that simulates an automotive ECU in QEMU and ships a graphical diagnostic tester talking over virtual CAN.</p>
            <ul className="feats">
              <li><i><Ico n="check"/></i>Modular UDS server in C with ten services, including session control, SecurityAccess and DTC handling</li>
              <li><i><Ico n="check"/></i>Qt 6 tester with quick actions and automatic TesterPresent every 2 seconds</li>
              <li><i><Ico n="check"/></i>SocketCAN with ISO-TP, systemd services and automated host and QEMU tests</li>
            </ul>
            <Arch k="autodiag" name="auto-diag-linux"/>
            <div className="tags"><span>C</span><span>C++ / Qt 6</span><span>Yocto</span><span>SocketCAN</span><span>UDS</span></div>
            <div className="card-foot">
              <a className="btn primary small" href={REPO_AUTODIAG} target="_blank" rel="noopener"><Ico n="branch"/>View on GitHub<Ico n="ext"/></a>
              <span className="repo">alasalem1/auto-diag-linux</span>
            </div>
          </div>
        </Tilt>
        <Tilt>
          <div className="thumb" dangerouslySetInnerHTML={{ __html: layerArt + '<span class="lbl">scarthgap</span>' }}></div>
          <div className="card-body">
            <h3>Embedded Linux Platform</h3>
            <p>A custom Linux platform built with the Yocto Project, organised into BSP and distro layers and built reproducibly with KAS in Docker.</p>
            <ul className="feats">
              <li><i><Ico n="check"/></i>Separate BSP, distro and platform layers on the Scarthgap release</li>
              <li><i><Ico n="check"/></i>KAS configuration for repeatable builds</li>
              <li><i><Ico n="check"/></i>Docker build environment so any machine produces the same image</li>
            </ul>
            <Arch k="platform" name="Embedded Linux Platform"/>
            <div className="tags"><span>Yocto</span><span>KAS</span><span>Docker</span><span>BitBake</span></div>
            <div className="card-foot">
              <a className="btn primary small" href={REPO_PLATFORM} target="_blank" rel="noopener"><Ico n="branch"/>View on GitHub<Ico n="ext"/></a>
              <span className="repo">alasalem1/techleef-embedded-linux</span>
            </div>
          </div>
        </Tilt>
      </div>
    </section>);
  }

  /* ---------- about + resume ---------- */
  function About() {
    return (<div className="duo">
      <section className="about rv" id="about">
        <div>
          <span className="eyebrow" style={{ fontSize: 20, color: 'var(--fg)' }}>About Me</span>
          <h2 style={{ marginTop: 6, color: 'var(--accent)' }}>I'm Ala Salem</h2>
          <p>Embedded systems graduate from the Higher Institute of Computer Science and Multimedia of Gabès (ISIMG), passionate about Linux embedded systems, the Yocto Project and the Internet of Things. I build custom Linux images with BitBake and KAS and work with Git and Docker. Rigorous, motivated and curious.</p>
          <ul className="checks">
            <li><i><Ico n="check"/></i>Embedded Linux Development</li>
            <li><i><Ico n="check"/></i>Yocto Project & BSP Engineering</li>
            <li><i><Ico n="check"/></i>RAUC OTA & Secure Updates</li>
            <li><i><Ico n="check"/></i>C / Python & Low-Level Development</li>
          </ul>
          <a className="btn primary small" href="#contact">Let's Work Together<Ico n="arrow"/></a>
        </div>
        <div className="portrait"><img src={PHOTO} alt="Portrait of Ala Salem" width="560" height="672"/></div>
      </section>
      <div className="facts rv">
        <div><Ico n="pin"/><span>Gabès, Tunisia<small>Based in southern Tunisia</small></span></div>
        <div><Ico n="cap"/><span>ISIMG Gabès<small>Embedded Systems and IoT, 2022 to 2026</small></span></div>
        <div><Ico n="layers"/><span>Yocto Project<small>Custom images, layers and CVE checks</small></span></div>
      </div>
    </div>);
  }

  function Resume() {
    return (<section className="panel resume rv" id="resume">
      <div className="resume-head">
        <div><span className="eyebrow">Resume</span><h2 style={{ marginTop: 8 }}>Education & Experience</h2></div>
        <button className="btn primary small" type="button" onClick={downloadCV}><Ico n="download"/>Download CV (PDF)</button>
      </div>
      <div className="cols">
        <div className="col">
          <h3><Ico n="cap"/>Education</h3>
          <div className="tline">
            <div className="ti"><time>09/2022 – 06/2026</time><b>Embedded Systems and Internet of Things</b><em>Higher Institute of Computer Science and Multimedia of Gabès</em><p>Gabès · Mention: Good</p></div>
            <div className="ti"><time>Baccalaureate</time><b>Mathematics</b><p>Gabès · Mention: Good</p></div>
          </div>
        </div>
        <div className="col">
          <h3><Ico n="briefcase"/>Experience</h3>
          <div className="tline">
            <div className="ti"><time>06/2026 – 07/2026 · 1 month</time><b>Electronic Security Systems Intern</b><em>STE Media Plus Security, Gabès</em>
              <ul><li>Installation and configuration of surveillance cameras</li><li>Wiring and setup of security equipment</li><li>Testing and maintenance of installations</li></ul></div>
            <div className="ti"><time>07/2025 – 08/2025 · 1 month</time><b>Embedded Systems Intern</b><em>Groupe Chimique Tunisien (GCT), Gabès</em>
              <ul><li>Discovery of industrial equipment and instrumentation systems</li><li>Observation of control and automation systems</li><li>Technical monitoring of equipment and safety procedures</li></ul></div>
          </div>
        </div>
        <div className="col">
          <h3><Ico n="bolt"/>Areas of Interest</h3>
          <ul className="interest">
            <li><b>Embedded technologies and Linux</b>Discovery of new technologies and embedded systems.</li>
            <li><b>IoT and connected systems</b>Connected objects and intelligent applications.</li>
            <li><b>Computer science and open source</b>Linux, free software and development tools.</li>
            <li><b>Technology watch</b>Continuous learning about technological innovations.</li>
          </ul>
          <div className="langs"><span>Arabic</span><span>French</span><span>English</span></div>
        </div>
      </div>
    </section>);
  }

  /* ---------- contact + backend ---------- */
  async function submitMessage(data) {
    var db = null;
    try { db = window.claude ? await window.claude.use('db') : null; } catch (e) {}
    var uid = null;
    try { var user = window.claude ? await window.claude.use('user') : null; uid = user ? await user.id() : null; } catch (e) {}
    if (db && uid) {
      try {
        // one document per visitor under messages/<their id>, holding their last 20 messages
        var ref = db.doc('messages/' + uid), snap = await ref.get();
        var items = (snap.exists && snap.data().items) || [];
        items = items.concat([{ name: data.name, email: data.email, message: data.message, createdAt: Date.now() }]).slice(-20);
        await ref.set({ items: items });
        return;
      } catch (e) { /* fall through to the Node API */ }
    }
    var r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error('http ' + r.status);
  }

  function Inbox() {
    var s = useState(null), msgs = s[0], setMsgs = s[1];
    var v = useState(false), show = v[0], setShow = v[1];
    useEffect(function () {
      var unsub = null, dead = false;
      (async function () {
        try {
          var user = window.claude ? await window.claude.use('user') : null;
          var db = window.claude ? await window.claude.use('db') : null;
          if (!user || !db || !(await user.canEdit())) return;
          if (dead) return;
          setShow(true);
          unsub = db.collection('messages').onSnapshot(
            function (snap) {
              var all = [];
              snap.docs.forEach(function (d) { ((d.data() || {}).items || []).forEach(function (m, i) { all.push(Object.assign({ id: d.id + '-' + i }, m)); }); });
              all.sort(function (x, y) { return y.createdAt - x.createdAt; });
              setMsgs(all.slice(0, 50));
            },
            function () { setMsgs([]); });
        } catch (e) {}
      })();
      return function () { dead = true; if (unsub) unsub(); };
    }, []);
    if (!show) return null;
    return (<div className="inbox">
      <h3>Messages (only you can see this)</h3>
      {msgs === null ? (<p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading messages…</p>) : null}
      {msgs && msgs.length === 0 ? (<p style={{ color: 'var(--muted)', fontSize: 13 }}>No messages yet.</p>) : null}
      {(msgs || []).map(function (m) {
        return (<div className="msg" key={m.id}><b>{m.name} <small>{m.email} · {new Date(m.createdAt).toLocaleString()}</small></b><span>{m.message}</span></div>);
      })}
    </div>);
  }

  function Contact() {
    var st = useState({ name: '', email: '', message: '', website: '' }), f = st[0], setF = st[1];
    var ss = useState('idle'), status = ss[0], setStatus = ss[1];
    var cp = useState(''), copied = cp[0], setCopied = cp[1];
    function on(k) { return function (e) { var n = Object.assign({}, f); n[k] = e.target.value; setF(n); }; }
    async function onSubmit(e) {
      e.preventDefault();
      if (f.website) return;
      setStatus('sending');
      try { await submitMessage({ name: f.name.trim(), email: f.email.trim(), message: f.message.trim() }); setStatus('ok'); setF({ name: '', email: '', message: '', website: '' }); }
      catch (err) { setStatus('err'); }
    }
    async function copy(txt, key) {
      try { await navigator.clipboard.writeText(txt); } catch (e) {}
      setCopied(key); setTimeout(function () { setCopied(''); }, 1800);
    }
    return (<section className="panel contact rv" id="contact">
      <div>
        <span className="eyebrow">Contact</span>
        <h2>Let's build something together</h2>
        <p>Looking for an embedded Linux or Yocto role, an internship or a project to work on? Send me a message.</p>
        <div className="reach">
          <div><Ico n="mail"/><span>{EMAIL}</span><button type="button" className="copy" onClick={function () { copy(EMAIL, 'e'); }}>{copied === 'e' ? 'Copied' : 'Copy'}</button></div>
          <div><Ico n="phone"/><span>{PHONE}</span><button type="button" className="copy" onClick={function () { copy(PHONE, 'p'); }}>{copied === 'p' ? 'Copied' : 'Copy'}</button></div>
          <div><Ico n="pin"/><span>Bouchamma, Gabès 6031, Tunisia</span></div>
        </div>
      </div>
      <form onSubmit={onSubmit} aria-label="Contact form">
        <div className="row2">
          <label htmlFor="cf-name">Name<input id="cf-name" required maxLength="80" value={f.name} onChange={on('name')} autoComplete="name" placeholder="Your name"/></label>
          <label htmlFor="cf-email">Email<input id="cf-email" type="email" required maxLength="120" value={f.email} onChange={on('email')} autoComplete="email" placeholder="you@company.com"/></label>
        </div>
        <label htmlFor="cf-msg">Message<textarea id="cf-msg" required minLength="5" maxLength="2000" value={f.message} onChange={on('message')} placeholder="Tell me about the role or project"></textarea></label>
        <div className="hp" aria-hidden="true"><label htmlFor="cf-web">Website<input id="cf-web" tabIndex="-1" autoComplete="off" value={f.website} onChange={on('website')}/></label></div>
        <div><button className="btn primary" type="submit" disabled={status === 'sending'}><Ico n="send"/>{status === 'sending' ? 'Sending…' : 'Send message'}</button></div>
        <div aria-live="polite">
          {status === 'ok' ? (<div className="note ok">Message sent. I will reply to the email you gave.</div>) : null}
          {status === 'err' ? (<div className="note err">The message could not be saved from here. Please email {EMAIL} directly.</div>) : null}
        </div>
      </form>
      <Inbox/>
    </section>);
  }

  function Footer() {
    return (<footer className="foot">
      <div className="wrap">
        <div className="foot-row">
          <a className="brand" href="#home"><Logo/><span><b>Ala Salem</b><small>Embedded Linux Engineering</small></span></a>
          <p className="tag">Build. Optimize. Innovate.</p>
          <div className="social">
            <a className="icon-btn" href={GITHUB} target="_blank" rel="noopener" aria-label="GitHub"><Ico n="branch"/></a>
            <a className="icon-btn" href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><Ico n="in"/></a>
            <a className="icon-btn" href="#contact" aria-label="Contact"><Ico n="mail"/></a>
          </div>
        </div>
        <div className="legal"><span>© 2026 Ala Salem. All rights reserved.</span><span>Built with React and Node.js</span></div>
      </div>
    </footer>);
  }

  /* ---------- opening: a Linux boot sequence, then the screen splits open ---------- */
  var BOOT = [
    ['ok', 'Reached target Basic System'],
    ['ok', 'Mounted root filesystem (slot A)'],
    ['ok', 'Started Yocto layers: meta-bsp, meta-distro'],
    ['ok', 'Started SocketCAN and ISO-TP services'],
    ['go', 'Starting portfolio.service']
  ];
  function Loader(props) {
    var p = useState('boot'), phase = p[0], setPhase = p[1];
    var c = useState(1), count = c[0], setCount = c[1];
    var left = useRef(false);
    function leave() {
      if (left.current) return;
      left.current = true;
      setPhase('leave');
      setTimeout(props.onDone, 800);
    }
    useEffect(function () {
      var timers = [];
      for (var i = 2; i <= BOOT.length; i++) (function (n) { timers.push(setTimeout(function () { setCount(n); }, n * 210)); })(i);
      timers.push(setTimeout(leave, 1500));
      function key(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') leave(); }
      window.addEventListener('keydown', key);
      return function () { timers.forEach(clearTimeout); window.removeEventListener('keydown', key); };
    }, []);
    return (<div className={'loader ' + phase} role="status" aria-label="Loading portfolio" onClick={leave}>
      <div className="ld-half top"></div>
      <div className="ld-half bot"></div>
      <div className="ld-core">
        <svg className="ld-logo" viewBox="0 0 48 48" aria-hidden="true"><path d="M15 4h18a11 11 0 0 1 11 11v18a11 11 0 0 1-11 11H15A11 11 0 0 1 4 33V15A11 11 0 0 1 15 4z" fill="#2f7bff"/><path fill="none" strokeLinecap="round" strokeLinejoin="round" d="M11.5 34l6.5-18 6.5 18M13.8 28h8.4"/><path fill="none" strokeLinecap="round" strokeLinejoin="round" d="M38.5 19.5c-1-2.2-3-3.5-5.4-3.5-3 0-5 1.6-5 4 0 5.5 10.6 3 10.6 8.6 0 2.4-2.2 4-5.2 4-2.4 0-4.4-1.2-5.4-3.4"/></svg>
        <div className="ld-name">Ala Salem</div>
        <div className="ld-role">Embedded Linux Engineering</div>
        <div className="ld-log" aria-hidden="true">
          {BOOT.slice(0, count).map(function (l, i) {
            var st = l[0] === 'go' && phase === 'leave' ? 'ok' : l[0];
            return (<div key={i} className={'ll ' + st}><b>{st === 'ok' ? '[  OK  ]' : '[ .... ]'}</b> {l[1]}</div>);
          })}
        </div>
        <div className="ld-bar" aria-hidden="true"><i></i></div>
        <button type="button" className="ld-skip" onClick={function (e) { e.stopPropagation(); leave(); }}>Skip intro</button>
      </div>
    </div>);
  }

  /* ---------- moving between sections: three bands sweep across, the page jumps behind them ---------- */
  var LABELS = { home: 'Home', projects: 'Projects', skills: 'Skills', about: 'About', resume: 'Resume', contact: 'Contact' };
  function Wipe() {
    var s = useState({ phase: 'idle', label: '' }), st = s[0], setSt = s[1];
    useEffect(function () {
      var busy = false, timers = [];
      function jump(el) {
        var root = document.documentElement, prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        el.scrollIntoView({ block: 'start' });
        root.style.scrollBehavior = prev;
        el.setAttribute('tabindex', '-1');
        try { el.focus({ preventScroll: true }); } catch (e) {}
      }
      function onClick(e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || a.classList.contains('skip')) return;
        var id = a.getAttribute('href').slice(1), el = id && document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        if (busy) return;
        if (reduce) { jump(el); return; }
        busy = true;
        var label = LABELS[id] || id;
        setSt({ phase: 'cover', label: label });
        timers.push(setTimeout(function () { jump(el); setSt({ phase: 'reveal', label: label }); }, 600));
        timers.push(setTimeout(function () { setSt({ phase: 'idle', label: '' }); busy = false; }, 1300));
      }
      document.addEventListener('click', onClick);
      return function () { document.removeEventListener('click', onClick); timers.forEach(clearTimeout); };
    }, []);
    return (<div className={'wipe ' + st.phase} aria-hidden="true">
      <i style={{ '--k': 0 }}></i><i style={{ '--k': 1 }}></i><i style={{ '--k': 2 }}></i>
      <span className="wl"><small>// goto</small>{st.label}</span>
    </div>);
  }

  /* ---------- a band of the stack, sliding past ---------- */
  var STACK = ['Yocto Project', 'BitBake', 'KAS', 'Linux Kernel', 'Device Tree', 'RAUC OTA', 'SocketCAN', 'ISO-TP', 'UDS', 'systemd', 'Docker', 'Qt 6', 'C / C++', 'Python'];
  function Marquee() {
    return (<div className="mq-wrap" aria-hidden="true"><div className="marquee">
      <div className="mq-track">
        {[0, 1].map(function (k) {
          return (<div className="mq-set" key={k}>{STACK.map(function (s, i) { return (<span key={i}>{s}<i></i></span>); })}</div>);
        })}
      </div>
    </div></div>);
  }

  /* ---------- an interactive terminal: visitors type commands to explore ---------- */
  var SHELL_HELP = [
    ['help', 'list the commands'], ['whoami', 'who I am'], ['about', 'a short bio'], ['skills', 'my toolkit'],
    ['projects', 'what I have built'], ['uds', 'a sample UDS request and response'], ['neofetch', 'system info, portfolio edition'],
    ['resume', 'download my CV'], ['contact', 'how to reach me'], ['theme dark|light', 'switch the theme'], ['clear', 'clear the screen']
  ];
  var SHELL_CMDS = ['help', 'whoami', 'about', 'skills', 'projects', 'uds', 'neofetch', 'resume', 'contact', 'theme', 'clear', 'ls'];
  function runCommand(raw, api) {
    var parts = raw.trim().split(/\s+/), cmd = (parts[0] || '').toLowerCase(), arg = (parts[1] || '').toLowerCase();
    function L(arr) { return arr.map(function (s) { return { t: s }; }); }
    switch (cmd) {
      case '': return [];
      case 'help': return L(SHELL_HELP.map(function (h) { return '  ' + h[0].padEnd(18) + h[1]; }));
      case 'whoami': return L(['Ala Salem, junior Embedded Linux / Yocto developer']);
      case 'about': return L(['Embedded systems graduate from ISIMG Gabès (2026).', 'I build custom Linux images with BitBake and KAS, and I like working close to the kernel.', 'Interests: Linux, IoT, open source, secure OTA updates.']);
      case 'skills': return L(['Build      Yocto Project, BitBake, KAS, Docker, Git', 'Languages  C, C++ (Qt 6), Python', 'Linux      kernel, device tree, systemd, RAUC OTA', 'Buses      SocketCAN, ISO-TP, UDS', 'Boards     Raspberry Pi, QEMU']);
      case 'projects': return [{ t: '1. auto-diag-linux  ->  ' + REPO_AUTODIAG.replace('https://', ''), href: REPO_AUTODIAG }, { t: '2. Embedded Linux Platform  ->  ' + REPO_PLATFORM.replace('https://', ''), href: REPO_PLATFORM }];
      case 'uds': return L(['# example: DiagnosticSessionControl (service 0x10)', 'tester  ->  7E0#02 10 01', 'ecu     <-  7E8#06 50 01 00 32 01 F4', '# 0x50 = positive response, 0x01 = default session']);
      case 'neofetch': return L(['ala@portfolio', '-------------', 'OS         Portfolio OS (React 18 + Node.js)', 'Kernel     curious, always compiling', 'Shell      this one', 'Focus      Yocto, Linux kernel, IoT', 'Based in   Gabès, Tunisia', 'Status     open to opportunities']);
      case 'resume': case 'cv': api.cv(); return L(['Preparing Ala-Salem-CV.pdf ...']);
      case 'contact': return [{ t: 'email  ' + EMAIL }, { t: 'phone  ' + PHONE }, { t: '-> open the contact form', href: '#contact' }];
      case 'theme': if (arg === 'dark' || arg === 'light') { api.theme(arg); return L(['theme set to ' + arg]); } return L(['usage: theme dark|light']);
      case 'ls': return L(['about  skills  projects  uds  resume  contact']);
      case 'echo': return L([parts.slice(1).join(' ')]);
      case 'sudo': return L(['ala is not in the sudoers file. This incident will not be reported.']);
      case 'exit': return L(['There is no escape. Try: projects']);
      default: return L(['command not found: ' + cmd + '. Type help.']);
    }
  }
  function Shell() {
    var seed = [{ c: 'whoami' }].concat(runCommand('whoami', {}), [{ c: 'skills' }], runCommand('skills', {}));
    var ls = useState(seed), lines = ls[0], setLines = ls[1];
    var vs = useState(''), val = vs[0], setVal = vs[1];
    var bodyRef = useRef(null), inRef = useRef(null), hist = useRef([]), pos = useRef(0);
    var api = {
      cv: function () { downloadCV(); },
      theme: function (t) { document.documentElement.setAttribute('data-theme', t); try { localStorage.setItem('as-theme', t); } catch (e) {} }
    };
    useEffect(function () { var b = bodyRef.current; if (b) b.scrollTop = b.scrollHeight; }, [lines]);
    function run(cmd) {
      cmd = cmd.trim();
      if (cmd) { hist.current.push(cmd); pos.current = hist.current.length; }
      if (cmd.toLowerCase() === 'clear') { setLines([]); setVal(''); return; }
      var out = runCommand(cmd, api);
      setLines(function (l) { return l.concat([{ c: cmd }], out).slice(-200); });
      setVal('');
    }
    function onKey(e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); if (pos.current > 0) { pos.current--; setVal(hist.current[pos.current] || ''); } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (pos.current < hist.current.length) { pos.current++; setVal(hist.current[pos.current] || ''); } }
      else if (e.key === 'Tab') { e.preventDefault(); var m = SHELL_CMDS.filter(function (c) { return val && c.indexOf(val.toLowerCase()) === 0; }); if (m.length === 1) setVal(m[0]); }
    }
    return (<section className="shell-sec" id="terminal">
      <div className="head rv">
        <span className="eyebrow both">Try it</span>
        <h2>Ask my terminal</h2>
      </div>
      <div className="shell rv" onClick={function () { if (inRef.current) inRef.current.focus({ preventScroll: true }); }}>
        <div className="sh-bar"><i></i><i></i><i></i><span>ala@portfolio: ~</span></div>
        <div className="sh-body" ref={bodyRef} role="log" aria-live="polite">
          {lines.map(function (l, i) {
            if (l.c !== undefined) return (<div className="ln cmd" key={i}><span className="pr">$</span>{l.c}</div>);
            if (l.href) {
              var ext = l.href.indexOf('#') !== 0;
              return (<a className="ln" key={i} href={l.href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener' : undefined}>{l.t}</a>);
            }
            return (<div className="ln" key={i}>{l.t}</div>);
          })}
        </div>
        <form className="sh-in" onSubmit={function (e) { e.preventDefault(); run(val); }}>
          <label htmlFor="sh-input">ala@portfolio:~$</label>
          <input id="sh-input" ref={inRef} value={val} onChange={function (e) { setVal(e.target.value); }} onKeyDown={onKey} autoComplete="off" autoCapitalize="off" spellCheck="false" placeholder="type help"/>
        </form>
        <div className="sh-chips">
          {['help', 'projects', 'uds', 'neofetch', 'resume', 'contact'].map(function (c) {
            return (<button key={c} type="button" onClick={function () { run(c); }}>{c}</button>);
          })}
        </div>
      </div>
    </section>);
  }


  /* ---------- command menu (Ctrl or Cmd + K) ---------- */
  function Palette() {
    var o = useState(false), open = o[0], setOpen = o[1];
    var q = useState(''), query = q[0], setQuery = q[1];
    var a = useState(0), idx = a[0], setIdx = a[1];
    var inp = useRef(null), back = useRef(null);
    var ACTIONS = [
      ['Go to Home', 'Section', 'arrow', function () { gotoSection('home'); }],
      ['Go to Projects', 'Section', 'arrow', function () { gotoSection('projects'); }],
      ['Go to Skills', 'Section', 'arrow', function () { gotoSection('skills'); }],
      ['Go to About', 'Section', 'arrow', function () { gotoSection('about'); }],
      ['Go to Resume', 'Section', 'arrow', function () { gotoSection('resume'); }],
      ['Go to Contact', 'Section', 'arrow', function () { gotoSection('contact'); }],
      ['Download CV (PDF)', 'Action', 'download', function () { downloadCV(); }],
      ['Open auto-diag-linux on GitHub', 'Project', 'ext', function () { window.open(REPO_AUTODIAG, '_blank', 'noopener'); }],
      ['Open Embedded Linux Platform on GitHub', 'Project', 'ext', function () { window.open(REPO_PLATFORM, '_blank', 'noopener'); }],
      ['Copy email address', 'Action', 'mail', function () { try { navigator.clipboard.writeText(EMAIL).catch(function () {}); } catch (e) {} }],
      ['Toggle light and dark theme', 'Action', 'moon', toggleTheme]
    ];
    var list = ACTIONS.filter(function (x) { return !query || x[0].toLowerCase().indexOf(query.toLowerCase().trim()) >= 0 || x[1].toLowerCase().indexOf(query.toLowerCase().trim()) >= 0; });
    function close() { setOpen(false); setQuery(''); setIdx(0); if (back.current && back.current.focus) { try { back.current.focus({ preventScroll: true }); } catch (e) {} } }
    function run(x) { if (!x) return; close(); setTimeout(x[3], 60); }
    useEffect(function () {
      function key(e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          setOpen(function (v) { if (!v) back.current = document.activeElement; return !v; });
        }
      }
      function ext() { back.current = document.activeElement; setOpen(true); }
      window.addEventListener('keydown', key); window.addEventListener('as-palette', ext);
      return function () { window.removeEventListener('keydown', key); window.removeEventListener('as-palette', ext); };
    }, []);
    useEffect(function () { if (open && inp.current) inp.current.focus(); }, [open]);
    if (!open) return null;
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(Math.min(idx + 1, list.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(Math.max(idx - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); run(list[idx]); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    }
    return (<div className="pal-back" onMouseDown={function (e) { if (e.target === e.currentTarget) close(); }}>
      <div className="pal" role="dialog" aria-modal="true" aria-label="Command menu" onKeyDown={onKey}>
        <div className="pal-in"><Ico n="search"/>
          <input ref={inp} value={query} placeholder="Type a command or search" aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant={list[idx] ? 'pal-' + idx : undefined}
            onChange={function (e) { setQuery(e.target.value); setIdx(0); }}/>
          <kbd>Esc</kbd>
        </div>
        <ul id="pal-list" role="listbox" className="pal-list">
          {list.length === 0 ? <li className="pal-empty">No matching command</li> : list.map(function (x, i) {
            return (<li key={x[0]} id={'pal-' + i} role="option" aria-selected={i === idx} className={i === idx ? 'on' : ''}
              onMouseMove={function () { if (idx !== i) setIdx(i); }} onClick={function () { run(x); }}>
              <Ico n={x[2]}/><span>{x[0]}</span><small>{x[1]}</small></li>);
          })}
        </ul>
      </div>
    </div>);
  }

  function SideDots() {
    var active = useActive();
    return (<nav className="dots" aria-label="Page sections">
      {NAV.map(function (n) {
        return (<a key={n[0]} href={'#' + n[0]} className={active === n[0] ? 'on' : ''} aria-label={n[1]}><span>{n[1]}</span><i></i></a>);
      })}
    </nav>);
  }

  function App() {
    var r = useState(!!reduce || seenIntro()), booted = r[0], setBooted = r[1];
    useEffect(function () { if (booted) document.documentElement.classList.add('ready'); }, [booted]);
    useEffect(function () {
      // soft light that follows the pointer inside tiles and cards
      if (reduce) return;
      function mv(e) {
        var t = e.target.closest && e.target.closest('.tile, .card, .facts div');
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty('--sx', (e.clientX - r.left).toFixed(0) + 'px');
        t.style.setProperty('--sy', (e.clientY - r.top).toFixed(0) + 'px');
      }
      document.addEventListener('pointermove', mv, { passive: true });
      return function () { document.removeEventListener('pointermove', mv); };
    }, []);
    return (<React.Fragment>
      <a className="skip" href="#main">Skip to content</a>
      {booted ? null : <Loader onDone={function () { markIntro(); setBooted(true); }}/>}
      <Palette/>
      <Wipe/>
      <SideDots/>
      <Header/>
      <Hero/>
      <Marquee/>
      <main id="main" tabIndex="-1" className="wrap stack">
        <Skills/>
        <Projects/>
        <About/>
        <Shell/>
        <Resume/>
        <Contact/>
      </main>
      <Footer/>
    </React.Fragment>);
  }

  ReactDOM.createRoot(document.getElementById('root')).render((<App/>));
})();
