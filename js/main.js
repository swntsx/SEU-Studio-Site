document.documentElement.classList.add('js');
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---------- Lenis Smooth Scroll + Navegação por Âncoras ---------- */
let lenis = null;
try {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(raf);
    });
  }
} catch (_) {}

$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: -80 });
    else target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------- Menu lateral (drawer) ---------- */
const menuBtn = $('#menuBtn'), drawer = $('#mobileMenu'), overlay = $('#drawerOverlay');
const icoOpen = $('#icoOpen'), icoClose = $('#icoClose');

function setDrawer(open) {
  if (!drawer) return;
  drawer.classList.toggle('open', open);
  overlay?.classList.toggle('open', open);
  icoOpen?.classList.toggle('hidden', open);
  icoClose?.classList.toggle('hidden', !open);
  menuBtn?.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

menuBtn?.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
overlay?.addEventListener('click', () => setDrawer(false));
$$('#mobileMenu a, #drawerClose').forEach(a => a.addEventListener('click', () => setDrawer(false)));

/* ---------- Cabeçalho + ScrollSpy ---------- */
const header = $('#siteHeader');
let sTick = false, sOn = null;

const onScroll = () => {
  sTick = false;
  if (!header) return;
  const on = window.scrollY > 24;
  if (on !== sOn) header.classList.toggle('is-scrolled', sOn = on);
};

onScroll();
window.addEventListener('scroll', () => {
  if (!sTick) {
    sTick = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });

const links = $$('.nav-link');
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const href = '#' + entry.target.id;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === href));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

$$('section[id]').forEach(s => spy.observe(s));

/* ---------- Revelação ao rolar (Reveal) ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

$$('.reveal').forEach(el => io.observe(el));

/* ---------- Luz do Mouse Otimizada ---------- */
const glow = $('#cursorGlow');
if (glow && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let mx = 0, my = 0, gx = 0, gy = 0, hot = null, hotRect = null, queued = false;

  const request = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };

  function frame() {
    queued = false;
    gx += (mx - gx) * 0.22;
    gy += (my - gy) * 0.22;
    glow.style.transform = `translate3d(${gx}px,${gy}px,0)`;

    if (hot && hotRect) {
      hot.style.setProperty('--mx', (mx - hotRect.left) + 'px');
      hot.style.setProperty('--my', (my - hotRect.top) + 'px');
    }
    if (Math.abs(mx - gx) + Math.abs(my - gy) > 0.5) request();
  }

  window.addEventListener('pointermove', e => {
    mx = e.clientX;
    my = e.clientY;
    glow.classList.add('on');
    const card = e.target.closest?.('.glass-card');
    if (card !== hot) {
      hot = card;
      hotRect = hot ? hot.getBoundingClientRect() : null;
    }
    request();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (hot) hotRect = hot.getBoundingClientRect();
  }, { passive: true });

  document.addEventListener('pointerleave', () => {
    glow.classList.remove('on');
    hot = null;
    hotRect = null;
  });
}

/* ---------- Modo leve automático ---------- */
setTimeout(() => {
  let n = 0, slow = 0, last = performance.now();
  const probe = t => {
    if (t - last > 32) slow++;
    last = t;
    if (++n < 80) requestAnimationFrame(probe);
    else if (slow > 18) document.documentElement.classList.add('lite');
  };
  requestAnimationFrame(probe);
}, 2500);

/* ---------- Filtro do portfólio ---------- */
const chips = $$('.chip'), works = $$('.work');
chips.forEach(chip => chip.addEventListener('click', () => {
  const f = chip.dataset.filter;
  chips.forEach(c => {
    const on = c === chip;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', on);
  });
  works.forEach(w => {
    const show = f === 'all' || w.dataset.cat === f;
    if (show) {
      w.classList.remove('is-gone', 'leaving', 'entering');
      void w.offsetWidth;
      w.classList.add('entering');
    } else {
      w.classList.add('leaving');
      setTimeout(() => w.classList.contains('leaving') && w.classList.add('is-gone'), 250);
    }
  });
}));

/* ---------- Lightbox Modal do Portfólio ---------- */
(() => {
  const modal = $('#portfolioModal');
  if (!modal) return;

  const backdrop = $('#modalBackdrop');
  const closeBtn = $('#modalClose');
  const modalMedia = $('#modalMedia');
  const modalImg = $('#modalImg');
  const modalMonogram = $('#modalMonogram');
  const modalCat = $('#modalCat');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalCta = $('#modalCta');

  const DESCRIPTIONS = {
    'Ambev': 'Desenvolvimento de peças editoriais e materiais de comunicação visual seguindo rigorosamente o guia de identidade da marca.',
    'Soft News': 'Direção, captação e finalização de vídeo institucional e cobertura de evento com foco em narrativa corporativa.',
    'Maxline': 'Projeto completo de fachada e sinalização interna para fortalecer a presença física e o reconhecimento da empresa.',
    'Up Impressão': 'Criação contínua de peças gráficas e conteúdos visuais estratégicos para redes sociais e campanhas comerciais.',
    'Bite Films': 'Edição dinâmica, captação audiovisual e materiais de apresentação comercial voltados à prospecção de clientes.',
    'Pudim Passion': 'Design de rótulos personalizados e direção criativa de campanhas promocionais para redes sociais.'
  };

  let lastTrigger = null;

  function openModal(card) {
    lastTrigger = card;
    const thumb = $('.thumb', card);
    const img = thumb ? $('img', thumb) : null;
    const mono = thumb ? $('span:not(.thumb-zoom-badge)', thumb) : null;
    const cat = $('p', card)?.textContent.trim() || '';
    const title = $('h3', card)?.textContent.trim() || '';
    const brandKey = title.split('—')[0].trim();

    if (modalCat) modalCat.textContent = cat;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) {
      modalDesc.textContent = card.dataset.desc || DESCRIPTIONS[brandKey] || 'Projeto desenvolvido sob medida pelo SEU Studio com foco em estética, clareza visual e resultado.';
    }

    if (modalCta) {
      const msg = encodeURIComponent(`Olá! Vi o projeto "${title}" no portfólio do SEU Studio e gostaria de um orçamento parecido.`);
      modalCta.href = `https://wa.me/556294847384?text=${msg}`;
    }

    if (modalImg && modalMonogram && modalMedia) {
      if (img && img.complete && img.naturalWidth > 0) {
        modalImg.src = img.currentSrc || img.src;
        modalImg.alt = img.alt || title;
        modalImg.classList.remove('is-hidden');
        modalMonogram.classList.add('is-hidden');
        modalMedia.style.background = '#090912';
      } else {
        const colorA = thumb?.style.getPropertyValue('--a') || '#a855f7';
        const colorB = thumb?.style.getPropertyValue('--b') || '#ec4899';
        modalImg.classList.add('is-hidden');
        modalMonogram.classList.remove('is-hidden');
        modalMonogram.textContent = mono?.textContent || 'SS';
        modalMedia.style.background = `linear-gradient(135deg, ${colorA}, ${colorB})`;
      }
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();

    requestAnimationFrame(() => modal.classList.add('is-visible'));
    closeBtn?.focus();
  }

  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-visible');
    document.body.style.overflow = '';
    if (lenis) lenis.start();

    setTimeout(() => {
      modal.classList.remove('is-open');
      lastTrigger?.focus();
    }, 280);
  }

  $$('.work').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    const thumb = $('.thumb', card);
    if (thumb && !$('.thumb-zoom-badge', thumb)) {
      const badge = document.createElement('span');
      badge.className = 'thumb-zoom-badge';
      badge.textContent = 'Ampliar ↗';
      thumb.appendChild(badge);
    }

    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeModal();
      else setDrawer(false);
    }
  });
})();

/* ---------- Seção Processo: etapas interativas ---------- */
(() => {
  const root = document.getElementById('processo');
  if (!root) return;

  const COLORS = ["#a855f7", "#6366f1", "#ec4899", "#34d399"];
  const ICONS = {
    "file-text": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    "palette": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
    "shield-check": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    "package-check": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="M7.5 4.27l9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
    "check": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  const STEPS = [
    {
      badge: "FASE 01 DE 04",
      title: "Entrada do Pedido & Alinhamento Inicial",
      desc: "Recebemos as especificações do seu projeto e alinhamos todos os requisitos essenciais.",
      status: "Status: Briefing & Coleta de Requisitos",
      subtext: "Informações consolidadas para a equipe de criação.",
      icon: "file-text",
      checkpoints: ["Análise de viabilidade técnica", "Definição de materiais e formatos", "Aprovação do orçamento base", "Cronograma de entregas estabelecido"]
    },
    {
      badge: "FASE 02 DE 04",
      title: "Desenvolvimento da Arte & Design Técnico",
      desc: "Nossa equipe de designers transforma suas ideias em conceitos visuais de alto impacto.",
      status: "Status: Criação & Ajuste de Vetores",
      subtext: "Design focado na identidade e precisão da sua marca.",
      icon: "palette",
      checkpoints: ["Criação de mockups virtuais", "Ajuste de perfis de cor (CMYK/RGB)", "Vetorização e fechamento técnico", "Adequação ao material final"]
    },
    {
      badge: "FASE 03 DE 04",
      title: "Aprovação Final & Validação do Cliente",
      desc: "Zero surpresas indesejadas. Enviamos a prova digital ou amostra física para sua validação.",
      status: "Status: Aguardando seu 'OK' Definitivo",
      subtext: "100% de controle nas mãos do cliente.",
      icon: "shield-check",
      checkpoints: ["Envio da prova virtual em alta resolução", "Conferência minuciosa de textos e dados", "Ajustes ilimitados pré-produção", "Assinatura do aceite digital"]
    },
    {
      badge: "FASE 04 DE 04",
      title: "Produção, Controle de Qualidade & Entrega",
      desc: "Entramos em linha de produção com máxima tecnologia e executamos o acabamento.",
      status: "Status: Fabricação & Expedição",
      subtext: "Produto finalizado com excelência visual.",
      icon: "package-check",
      checkpoints: ["Impressão/Fabricação de alta precisão", "Acabamento e cortes especiais", "Inspeção manual de qualidade", "Envio rastreado e seguro"]
    }
  ];

  const nodes = [...root.querySelectorAll('.proc-node')];
  const cards = [...root.querySelectorAll('.proc-card')];
  let current = -1;

  function select(i) {
    if (i === current) return;
    const first = current === -1;
    current = i;
    const d = STEPS[i];

    const fill = $('#procFill');
    if (fill) fill.style.transform = `scaleX(${i / 3 || 0.02})`;

    nodes.forEach((n, k) => {
      n.classList.toggle('is-active', k === i);
      n.classList.toggle('is-done', k < i);
      n.setAttribute('aria-selected', k === i);
    });
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));

    const detail = $('#procDetail');
    if (detail) detail.style.setProperty('--c', COLORS[i]);

    if ($('#procBadge')) $('#procBadge').textContent = d.badge;
    if ($('#procTitle')) $('#procTitle').textContent = d.title;
    if ($('#procDesc')) $('#procDesc').textContent = d.desc;
    if ($('#procStatus')) $('#procStatus').textContent = d.status;
    if ($('#procSub')) $('#procSub').textContent = d.subtext;
    if ($('#procIcon')) $('#procIcon').innerHTML = ICONS[d.icon] || '';
    if ($('#procList')) $('#procList').innerHTML = d.checkpoints.map(t => `<div>${ICONS.check}<span>${t}</span></div>`).join('');

    if (!first) {
      const txt = $('#procText');
      const vis = root.querySelector('.proc-visual');
      [txt, vis].forEach(el => {
        if (el) {
          el.classList.remove('proc-swap');
          void el.offsetWidth;
          el.classList.add('proc-swap');
        }
      });
    }
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('[data-step]');
    if (t) select(+t.dataset.step);
  });

  root.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.proc-card')) {
      e.preventDefault();
      select(+e.target.dataset.step);
    }
  });

  select(0);
})();
