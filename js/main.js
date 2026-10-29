document.documentElement.classList.add('js');
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- Menu lateral (drawer) ---------- */
const menuBtn = $('#menuBtn'), drawer = $('#mobileMenu'), overlay = $('#drawerOverlay');
const icoOpen = $('#icoOpen'), icoClose = $('#icoClose');
function setDrawer(open) {
  if (!drawer) return;
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  icoOpen.classList.toggle('hidden', open);
  icoClose.classList.toggle('hidden', !open);
  menuBtn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
overlay?.addEventListener('click', () => setDrawer(false));
$$('#mobileMenu a, #drawerClose').forEach(a => a.addEventListener('click', () => setDrawer(false)));
document.addEventListener('keydown', e => e.key === 'Escape' && setDrawer(false));

/* ---------- Cabeçalho + link ativo ---------- */
const header = $('#siteHeader');
let sTick = false, sOn = null;
const onScroll = () => { sTick = false; const on = scrollY > 24; if (on !== sOn) header.classList.toggle('is-scrolled', sOn = on); };
onScroll(); addEventListener('scroll', () => { if (!sTick) { sTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
const links = $$('.nav-link');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));

/* ---------- Revelação ao rolar ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .08 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Reação suave ao mouse (1 único loop rAF) ---------- */
const glow = $('#cursorGlow');
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let mx = 0, my = 0, gx = 0, gy = 0, hot = null, queued = false;
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
// sourcery skip: avoid-function-declarations-in-blocks
  function frame() {
    queued = false;
    gx += (mx - gx) * .2; gy += (my - gy) * .2;
    glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;
    if (hot) {
      const r = hot.getBoundingClientRect();
      hot.style.setProperty('--mx', (mx - r.left) + 'px');
      hot.style.setProperty('--my', (my - r.top) + 'px');
    }
    if (Math.abs(mx - gx) + Math.abs(my - gy) > .5) request();
  }
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY; glow.classList.add('on');
    hot = e.target.closest?.('.glass-card, .glass-panel');
    request();
  }, { passive: true });
  document.addEventListener('pointerleave', () => glow.classList.remove('on'));
  $$('.btn-gradient').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * .12}px ${(e.clientY - r.top - r.height / 2) * .2}px`;
    }, { passive: true });
    b.addEventListener('pointerleave', () => b.style.translate = '');
  });
}

/* ---------- Modo leve automático: se a página engasgar, desliga os efeitos mais caros ---------- */
setTimeout(() => {
  let n = 0, slow = 0, last = performance.now();
  const probe = t => {
    if (t - last > 28) slow++;
    last = t;
    if (++n < 100) requestAnimationFrame(probe);
    else if (slow > 15) document.documentElement.classList.add('lite');
  };
  requestAnimationFrame(probe);
}, 2000);

/* ---------- Filtro do portfólio ---------- */
const chips = $$('.chip'), works = $$('.work');
chips.forEach(chip => chip.addEventListener('click', () => {
  const f = chip.dataset.filter;
  chips.forEach(c => { const on = c === chip; c.classList.toggle('active', on); c.setAttribute('aria-pressed', on); });
  works.forEach(w => {
    const show = f === 'all' || w.dataset.cat === f;
    if (show) { w.classList.remove('is-gone', 'leaving'); w.classList.remove('entering'); void w.offsetWidth; w.classList.add('entering'); }
    else { w.classList.add('leaving'); setTimeout(() => w.classList.contains('leaving') && w.classList.add('is-gone'), 300); }
  });
}));

/* ---------- Seção Processo: etapas interativas ---------- */
(() => {
  const root = document.getElementById('processo');
  if (!root) return;
  const COLORS = ["#a855f7", "#6366f1", "#ec4899", "#34d399"];
  const ICONS = {"file-text": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/></svg>", "palette": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z\"/></svg>", "shield-check": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/></svg>", "package-check": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m16 16 2 2 4-4\"/><path d=\"M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14\"/><path d=\"M7.5 4.27l9 5.15\"/><polyline points=\"3.29 7 12 12 20.71 7\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"12\"/></svg>", "check": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg>", "arrow": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/></svg>", "clock": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>", "refresh": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/></svg>", "sliders": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\"/><line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\"/><line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\"/><line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\"/><line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\"/><line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\"/><line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\"/><line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\"/><line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\"/></svg>", "sparkles": "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z\"/></svg>"};
  const STEPS = [
  {
    "badge": "FASE 01 DE 04",
    "title": "Entrada do Pedido & Alinhamento Inicial",
    "desc": "Recebemos as especificações do seu projeto e alinhamos todos os requisitos essenciais (prazos, materiais, quantidades e objetivos da peça). Garantimos total entendimento do seu briefing antes de dar qualquer passo.",
    "status": "Status: Briefing & Coleta de Requisitos",
    "subtext": "Informações consolidadas para a equipe de criação.",
    "icon": "file-text",
    "checkpoints": [
      "Análise de viabilidade técnica",
      "Definição de materiais e formatos",
      "Aprovação do orçamento base",
      "Cronograma de entregas estabelecido"
    ]
  },
  {
    "badge": "FASE 02 DE 04",
    "title": "Desenvolvimento da Arte & Design Técnico",
    "desc": "Nossa equipe de designers transforma suas ideias em conceitos visuais de alto impacto. Trabalhamos a tipografia, cores e fechamento de arquivo adequado aos gabaritos e matrizes da produção física.",
    "status": "Status: Criação & Ajuste de Vetores",
    "subtext": "Design focado na identidade e precisão da sua marca.",
    "icon": "palette",
    "checkpoints": [
      "Criação de mockups 3D virtuais",
      "Ajuste de perfis de cor (CMYK/Pantone)",
      "Vetorização e fechamento técnico",
      "Adequação ao material final"
    ]
  },
  {
    "badge": "FASE 03 DE 04",
    "title": "Aprovação Final & Validação do Cliente",
    "desc": "Zero surpresas indesejadas. Enviamos a prova digital ou amostra física para sua validação. Você analisa as cores, textos e detalhes. Apenas após a sua autorização formal a demanda vai para a fábrica.",
    "status": "Status: Aguardando seu 'OK' Definitivo",
    "subtext": "100% de controle nas mãos do cliente.",
    "icon": "shield-check",
    "checkpoints": [
      "Envio da prova virtual em alta resolução",
      "Conferência minuciosa de textos e dados",
      "Ajustes ilimitados pré-produção",
      "Assinatura do aceite digital"
    ]
  },
  {
    "badge": "FASE 04 DE 04",
    "title": "Produção, Controle de Qualidade & Entrega",
    "desc": "Entramos em linha de produção com máxima tecnologia. Executamos o acabamento, fazemos o controle rigoroso de qualidade peça por peça e embalamos com cuidado para entrega no prazo combinado.",
    "status": "Status: Fabricação & Expedição",
    "subtext": "Produto finalizado com excelência visual.",
    "icon": "package-check",
    "checkpoints": [
      "Impressão/Fabricação de alta precisão",
      "Acabamento e cortes especiais",
      "Inspeção manual de qualidade",
      "Envio rastreado e seguro"
    ]
  }
];
  const $ = id => document.getElementById(id);
  const nodes = [...root.querySelectorAll('.proc-node')], cards = [...root.querySelectorAll('.proc-card')];
  let current = -1;

// sourcery skip: avoid-function-declarations-in-blocks
  function select(i) {
    if (i === current) return;
    const first = current === -1; current = i;
    const d = STEPS[i];
    $('procFill').style.transform = `scaleX(${i / 3 || .02})`;
    nodes.forEach((n, k) => { n.classList.toggle('is-active', k === i); n.classList.toggle('is-done', k < i); n.setAttribute('aria-selected', k === i); });
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    $('procDetail').style.setProperty('--c', COLORS[i]);
    $('procBadge').textContent = d.badge;
    $('procTitle').textContent = d.title;
    $('procDesc').textContent = d.desc;
    $('procStatus').textContent = d.status;
    $('procSub').textContent = d.subtext;
    $('procIcon').innerHTML = ICONS[d.icon];
    $('procList').innerHTML = d.checkpoints.map(t => `<div>${ICONS.check}<span>${t}</span></div>`).join('');
    if (!first) {
      [$('procText'), root.querySelector('.proc-visual')].forEach(el => { el.classList.remove('proc-swap'); void el.offsetWidth; el.classList.add('proc-swap'); });
    }
  }

  root.addEventListener('click', e => { const t = e.target.closest('[data-step]'); if (t) select(+t.dataset.step); });
  root.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.proc-card')) { e.preventDefault(); select(+e.target.dataset.step); }
  });
  select(0);
})();