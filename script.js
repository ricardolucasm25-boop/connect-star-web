const WHATSAPP_NUMBER = "51967967540";

/* ---------- Promo estacional (franja superior) ----------
   Para cambiar la franja edita SOLO el texto entre comillas de PROMO_ESTACIONAL.
   Ejemplos: "Navidad Connect Star: instalación gratis hasta el 31 de diciembre"
             "Fiestas Patrias: primer mes a mitad de precio"
   Si la dejas vacía ("") la franja desaparece de la página.
   El botón de la franja abre WhatsApp citando ese mismo texto.
   Para cambiar la promo fija de 1000 Mbps o los planes, edita las tarjetas de index.html. */
const PROMO_ESTACIONAL = "Navidad Connect Star: instalación gratis hasta el 31 de diciembre";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
/* Se consulta en vivo (no una sola vez): el sistema puede cambiar la preferencia con la página abierta. */
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const onMotionChange = (handler) => motionQuery.addEventListener?.("change", handler);

if (window.lucide) {
  window.lucide.createIcons();
}

const openWhatsApp = (text) => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
};

/* ---------- Franja de promo estacional ---------- */

const promoStrip = qs("#promoEstacional");
if (promoStrip) {
  const promoText = PROMO_ESTACIONAL.trim();
  if (promoText) {
    qs(".promo-text", promoStrip).textContent = promoText;
    qs("#promoEstacionalBtn").addEventListener("click", () =>
      openWhatsApp(`Hola Connect Star, vi la promoción "${promoText}" y quiero aprovecharla. ¿Validamos cobertura?`)
    );
    promoStrip.hidden = false;
  } else {
    promoStrip.remove();
  }
}

/* ---------- Menú móvil ---------- */

const header = qs(".site-header");
const navToggle = qs(".nav-toggle");
const mainNav = qs(".main-nav");

/* La cabecera es pegajosa y su altura depende de la franja (0, 1 o 2 líneas):
   el scroll-padding de las anclas sigue la altura real para que las secciones no queden tapadas. */
if (header) {
  const syncScrollPadding = () => {
    document.documentElement.style.scrollPaddingTop = `${header.offsetHeight + 16}px`;
  };
  syncScrollPadding();
  new ResizeObserver(syncScrollPadding).observe(header);
}

const setMenu = (isOpen) => {
  header.classList.toggle("is-open", isOpen);
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  navToggle?.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");

  /* scrollHeight es la altura natural del contenido aunque max-height lo esté recortando.
     offsetHeight se leía al inicio de la transición (max-height: 0) y dejaba el menú en 35 px. */
  if (isOpen && mainNav) {
    header.style.setProperty("--mobile-nav-height", `${mainNav.scrollHeight + 2}px`);
  }
};

navToggle?.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));

header?.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header.classList.contains("is-open")) {
    setMenu(false);
    navToggle?.focus();
  }
});

qsa(".main-nav a, .header-cta").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

/* ---------- Filtro de planes ---------- */

const planCards = qsa(".plan-card");
const filterButtons = qsa(".filter-btn");
const planStatus = qs("#planStatus");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });

    let shown = 0;
    planCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.type === filter;
      card.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) shown += 1;
    });
    if (planStatus) planStatus.textContent = `Mostrando ${shown} ${shown === 1 ? "plan" : "planes"}`;
  });
});

const selectPlan = (planName) => {
  planCards.forEach((card) => {
    const isMatch = card.dataset.plan === planName;
    card.classList.toggle("is-selected", isMatch);

    if (isMatch) {
      card.scrollIntoView({ behavior: motionQuery.matches ? "auto" : "smooth", block: "center" });
    }
  });

  window.setTimeout(() => {
    planCards.forEach((card) => card.classList.remove("is-selected"));
  }, 1800);
};

qsa("[data-plan-jump]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const planName = link.dataset.planJump;
    qs("#planes")?.scrollIntoView({ behavior: motionQuery.matches ? "auto" : "smooth" });
    window.setTimeout(() => selectPlan(planName), motionQuery.matches ? 0 : 500);
  });
});

/* ---------- WhatsApp por plan ---------- */

qsa("[data-whatsapp-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    const plan = button.dataset.whatsappPlan;
    openWhatsApp(`Hola Connect Star, quiero información sobre ${plan}. Quisiera validar cobertura e instalación.`);
  });
});

/* ---------- CTAs con mensaje de WhatsApp contextual ---------- */

qsa("[data-wa-context]").forEach((button) => {
  button.addEventListener("click", () => openWhatsApp(button.dataset.waContext));
});

/* ---------- Comparador de velocidad ---------- */

const speedRange = qs("#speedRange");

if (speedRange) {
  const PLAN_MBPS = 500;
  const GAME_MB = 480000; // juego de 60 GB en megabits

  const fmtTime = (seconds) => {
    const min = Math.round(seconds / 60);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)} h ${min % 60} min`;
  };

  const pop = (el) => {
    const target = el.closest("strong") || el;
    target.classList.remove("pop");
    void target.offsetWidth;
    target.classList.add("pop");
  };

  const updateCompare = () => {
    const current = Number(speedRange.value);

    qs("#curSpeed").textContent = current;
    // hasta un decimal: redondear a entero llegaba a exagerar 2,5x como 3x
    const times = Math.max(1, Math.round((PLAN_MBPS / current) * 10) / 10);
    qs("#cmpX").textContent = String(times).replace(".", ",");
    qs("#cmpGame").textContent = fmtTime(GAME_MB / PLAN_MBPS);
    qs("#cmpGameNow").textContent = fmtTime(GAME_MB / current);
    qs("#cmpStreams").textContent = Math.floor(PLAN_MBPS / 25);
    qs("#cmpStreamsNow").textContent = Math.floor(current / 25);
    qs("#barNow").style.width = `${Math.max(2, (current / PLAN_MBPS) * 100)}%`;

    [qs("#cmpX"), qs("#cmpGame"), qs("#cmpStreams")].forEach(pop);
  };

  speedRange.addEventListener("input", updateCompare);
  updateCompare();

  qs("#compareCta")?.addEventListener("click", () => {
    openWhatsApp(
      `Hola Connect Star, hoy tengo ${speedRange.value} Mbps y quiero mejorar mi internet con el plan de 500 Mbps (promo 1000 Mbps x 3 meses). ¿Validamos cobertura?`
    );
  });
}

/* ---------- Simulador de lag ---------- */

const lagArena = qs("#lagArena");

if (lagArena) {
  const dotGood = qs("#dotGood");
  const dotBad = qs("#dotBad");
  const lagRange = qs("#lagRange");
  const lagVal = qs("#lagVal");
  const fields = qsa(".pane-field", lagArena);

  let lagMs = Number(lagRange?.value || 180);
  const history = []; // posiciones relativas {t, x, y} con x/y en 0..1
  let lastPos = { x: 0.5, y: 0.5 };

  const lagStatic = qs("#lagStatic");
  const lagStaticMs = qs("#lagStaticMs");
  const lagHint = qs(".lag-hint");

  // La cifra responde siempre; con movimiento reducido se sustituye la animación por una explicación estática.
  lagRange?.addEventListener("input", () => {
    lagMs = Number(lagRange.value);
    if (lagVal) lagVal.textContent = lagMs;
    if (lagStaticMs) lagStaticMs.textContent = lagMs;
  });

  const record = (event) => {
    const field = event.currentTarget;
    const rect = field.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    lastPos = { x, y };
    history.push({ t: performance.now(), x, y });
    if (history.length > 240) history.splice(0, history.length - 240);
  };

  fields.forEach((field) => {
    field.addEventListener("pointermove", record);
    field.addEventListener("pointerdown", record);
  });

  const positionAt = (time) => {
    for (let i = history.length - 1; i >= 0; i -= 1) {
      if (history[i].t <= time) return history[i];
    }
    return history[0] || lastPos;
  };

  // Medidas del campo cacheadas: leerlas en cada frame fuerza reflow.
  let fieldW = 0;
  let fieldH = 0;
  const measure = () => {
    const field = fields[0];
    if (!field) return;
    fieldW = field.clientWidth;
    fieldH = field.clientHeight;
  };
  measure();
  window.addEventListener("resize", measure, { passive: true });

  const place = (dot, pos) => {
    dot.style.transform = `translate(${pos.x * fieldW}px, ${pos.y * fieldH}px)`;
  };

  let running = false;
  let inView = false;
  let rafId = 0;
  const tick = () => {
    if (!running) return;
    const now = performance.now();
    // bufferbloat: el retraso ondula, no es constante
    const wobble = 1 + 0.35 * Math.sin(now / 300);
    place(dotGood, lastPos);
    place(dotBad, positionAt(now - lagMs * wobble));
    rafId = requestAnimationFrame(tick);
  };
  const start = () => {
    if (running || motionQuery.matches) return;
    running = true;
    measure();
    rafId = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  const applyLagMotion = () => {
    const reduced = motionQuery.matches;
    lagArena.hidden = reduced;
    if (lagHint) lagHint.hidden = reduced;
    if (lagStatic) lagStatic.hidden = !reduced;
    if (reduced) stop();
    else if (inView && !document.hidden) start();
  };

  // Solo anima cuando el simulador está en pantalla.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          inView = e.isIntersecting;
          if (inView) start();
          else stop();
        }),
      { threshold: 0.1 }
    ).observe(lagArena);
  } else {
    inView = true;
    start();
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (lagArena.getBoundingClientRect().top < window.innerHeight) start();
  });
  onMotionChange(applyLagMotion);
  applyLagMotion();
}

/* ---------- Animación de velocidad en el hero (haces de fibra) ---------- */

const heroFx = qs(".hero-fx");
const heroPhoto = qs(".hero-photo");

if (heroFx && heroPhoto) {
  const ctx = heroFx.getContext("2d");
  let W = 0;
  let H = 0;
  let DPR = 1;

  const NODE = { x: 0.6, y: 0.4 };
  const C = {
    blue: [48, 160, 255],
    cyan: [96, 255, 255],
    lime: [192, 255, 16],
    magenta: [224, 80, 255],
  };

  const inbound = [
    { c: C.blue, p: [[-0.05, 0.6], [0.25, 0.72], [0.45, 0.3], [NODE.x, NODE.y]] },
    { c: C.cyan, p: [[-0.05, 0.73], [0.3, 0.88], [0.48, 0.38], [NODE.x, NODE.y]] },
    { c: C.lime, p: [[-0.05, 0.86], [0.34, 1.0], [0.5, 0.48], [NODE.x, NODE.y]] },
    { c: C.magenta, p: [[-0.05, 0.99], [0.38, 1.1], [0.52, 0.58], [NODE.x, NODE.y]] },
  ];
  const outbound = [
    { c: C.cyan, p: [[NODE.x, NODE.y], [0.74, 0.22], [0.9, 0.3], [1.06, 0.16]] },
    { c: C.magenta, p: [[NODE.x, NODE.y], [0.76, 0.3], [0.9, 0.14], [1.06, 0.3]] },
  ];
  const streams = [...inbound, ...outbound];
  const SAMPLES = 80;

  const bezier = (p, t) => {
    const u = 1 - t;
    return [
      u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
      u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
    ];
  };

  streams.forEach((s, si) => {
    s.pts = [];
    for (let i = 0; i <= SAMPLES; i += 1) s.pts.push(bezier(s.p, i / SAMPLES));
    s.packets = Array.from({ length: 4 }, (_, i) => ({ t: (i / 4 + si * 0.05) % 1 }));
  });

  const rnd = (a, b) => a + Math.random() * (b - a);
  const palette = [C.cyan, C.magenta, C.blue, C.lime];
  const bokeh = Array.from({ length: 10 }, () => ({
    x: Math.random(), y: Math.random(), r: rnd(0.03, 0.07),
    c: palette[Math.floor(Math.random() * 3)],
    vx: rnd(-0.00004, 0.00004), vy: rnd(-0.00003, 0.00003), a: rnd(0.05, 0.14),
  }));
  const sparks = Array.from({ length: 42 }, () => ({
    x: Math.random(), y: Math.random(), ph: Math.random() * Math.PI * 2,
    c: palette[Math.floor(Math.random() * 4)],
  }));

  const glowCache = new Map();
  const glowFor = (rgb) => {
    const k = rgb.join();
    if (!glowCache.has(k)) {
      const s = 64;
      const cv = document.createElement("canvas");
      cv.width = s;
      cv.height = s;
      const g = cv.getContext("2d");
      const rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      rg.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.95)`);
      rg.addColorStop(0.4, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.32)`);
      rg.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
      g.fillStyle = rg;
      g.fillRect(0, 0, s, s);
      glowCache.set(k, cv);
    }
    return glowCache.get(k);
  };

  const resize = () => {
    // En pantallas chicas basta 1.5x: la mitad de píxeles por frame.
    DPR = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2);
    const rect = heroFx.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    heroFx.width = Math.max(1, Math.round(W * DPR));
    heroFx.height = Math.max(1, Math.round(H * DPR));
  };

  let boost = 0;
  let target = 0;
  let last = null;
  heroPhoto.addEventListener("pointermove", (event) => {
    const rect = heroPhoto.getBoundingClientRect();
    const p = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (last) target = Math.min(1, target + Math.hypot(p.x - last.x, p.y - last.y) / 240);
    last = p;
    target = Math.max(target, 0.5);
  });
  heroPhoto.addEventListener("pointerleave", () => { target = 0; last = null; });
  heroPhoto.addEventListener("pointerdown", () => { target = 1; });

  let t0 = performance.now();
  const draw = (now) => {
    const dt = Math.min(40, Math.max(0, now - t0));
    t0 = now;
    boost += (target - boost) * 0.06;
    target *= 0.95;
    const speed = 0.00016 + boost * 0.00075;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#060a22");
    bg.addColorStop(0.55, "#0c1540");
    bg.addColorStop(1, "#141a5a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const nx = NODE.x * W;
    const ny = NODE.y * H;
    const halo = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(W, H) * 0.5);
    halo.addColorStop(0, `rgba(96,255,255,${0.12 + boost * 0.12})`);
    halo.addColorStop(0.5, "rgba(48,80,180,0.05)");
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = "lighter";

    bokeh.forEach((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -0.1) b.x = 1.1;
      if (b.x > 1.1) b.x = -0.1;
      if (b.y < -0.1) b.y = 1.1;
      if (b.y > 1.1) b.y = -0.1;
      const r = b.r * W;
      ctx.globalAlpha = b.a;
      ctx.drawImage(glowFor(b.c), b.x * W - r, b.y * H - r, r * 2, r * 2);
    });
    ctx.globalAlpha = 1;

    streams.forEach((s) => {
      ctx.beginPath();
      s.pts.forEach((pt, i) => {
        const x = pt[0] * W;
        const y = pt[1] * H;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${0.16 + boost * 0.14})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    streams.forEach((s) => {
      const glow = glowFor(s.c);
      s.packets.forEach((pk) => {
        pk.t += speed * dt;
        pk.t -= Math.floor(pk.t);
        const idx = pk.t * SAMPLES;
        const i0 = Math.floor(idx);
        const i1 = Math.min(SAMPLES, i0 + 1);
        const f = idx - i0;
        const a = s.pts[i0];
        const b = s.pts[i1];
        const x = (a[0] + (b[0] - a[0]) * f) * W;
        const y = (a[1] + (b[1] - a[1]) * f) * H;

        const trail = Math.max(0, i0 - Math.round(5 + boost * 12));
        ctx.beginPath();
        for (let i = trail; i <= i0; i += 1) {
          const px = s.pts[i][0] * W;
          const py = s.pts[i][1] * H;
          if (i === trail) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},0.5)`;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        const r = 11 + boost * 9;
        ctx.drawImage(glow, x - r, y - r, r * 2, r * 2);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    const pulse = 1 + Math.sin(now / 380) * 0.08 + boost * 0.15;
    const nr = (66 + boost * 44) * pulse;
    ctx.drawImage(glowFor(C.cyan), nx - nr, ny - nr, nr * 2, nr * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(nx, ny, 6 + boost * 3, 0, Math.PI * 2);
    ctx.fill();

    const ringR = (108 + boost * 34) * pulse;
    ctx.strokeStyle = "rgba(96,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(224,80,255,0.3)";
    const rot = (now / 2000) % (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(nx, ny, ringR * 1.4, rot, rot + Math.PI * 1.3);
    ctx.stroke();

    sparks.forEach((sp) => {
      const a = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now / 500 + sp.ph));
      ctx.fillStyle = `rgba(${sp.c[0]},${sp.c[1]},${sp.c[2]},${a * 0.8})`;
      ctx.beginPath();
      ctx.arc(sp.x * W, sp.y * H, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
    heroPhoto.classList.toggle("is-fast", boost > 0.4);
  };

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(heroFx);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }

  // Solo dibuja mientras el hero está en pantalla y la pestaña visible.
  let heroVisible = true;
  let rafId = 0;
  let userPaused = false;
  const heroPause = qs("#heroPause");
  // En celular se dibuja a ~30 fps: la animación sigue fluida y cuesta la mitad.
  let lastDraw = 0;
  const loop = (now) => {
    rafId = 0;
    if (!heroVisible || document.hidden || userPaused || motionQuery.matches) return;
    if (window.innerWidth >= 700 || now - lastDraw >= 30) {
      lastDraw = now;
      draw(now);
    }
    rafId = requestAnimationFrame(loop);
  };
  const start = () => {
    if (rafId || userPaused || motionQuery.matches) return;
    t0 = performance.now();
    rafId = requestAnimationFrame(loop);
  };

  // WCAG 2.2.2: el usuario puede pausar la animación; el último fotograma queda quieto en el canvas.
  heroPause?.addEventListener("click", () => {
    userPaused = !userPaused;
    heroPause.setAttribute("aria-pressed", String(userPaused));
    qs("span", heroPause).textContent = userPaused ? "Reanudar animación" : "Pausar animación";
    const icon = qs("[data-lucide], svg", heroPause);
    if (icon) icon.setAttribute("data-lucide", userPaused ? "play" : "pause");
    if (window.lucide) window.lucide.createIcons();
    if (userPaused) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else {
      start();
    }
  });
  onMotionChange(() => (motionQuery.matches ? cancelAnimationFrame(rafId) : start()));

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries.some((entry) => entry.isIntersecting);
        if (heroVisible) start();
      },
      { threshold: 0.05 }
    ).observe(heroPhoto);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && heroVisible) start();
  });

  resize();
  start();
}

/* ---------- Estado "en línea" (horario Lima, UTC-5) ---------- */

const onlineState = qs("#onlineState");

if (onlineState) {
  const limaHour = (new Date().getUTCHours() + 24 - 5) % 24;
  const isOpen = limaHour >= 8 && limaHour < 22;

  if (!isOpen) {
    onlineState.classList.add("offline");
    onlineState.lastChild.textContent = "Te respondemos desde las 8:00 a. m.";
  }
}

/* ---------- Validación compartida de formularios ---------- */

const collapse = (value) => String(value || "").replace(/\s+/g, " ").trim();

const checkers = {
  // 9 dígitos que empiezan en 9, con prefijo +51 opcional; admite espacios y guiones al escribir
  phone: (value) => {
    const digits = value.replace(/[\s-]/g, "");
    return /^(?:\+?51)?9\d{8}$/.test(digits) ? digits.replace(/^\+?51/, "") : null;
  },
  // DNI (8) o RUC (11) solo dígitos; opcional
  document: (value) => (value === "" || /^(?:\d{8}|\d{11})$/.test(value) ? value : null),
  // La zona necesita al menos dos letras: rechaza vacíos, espacios y solo números o símbolos
  zone: (value) => (/\p{L}.*\p{L}/u.test(value) ? value : null),
};

const messages = {
  phone: "Escribe un celular de 9 dígitos que empiece en 9 (el +51 es opcional).",
  document: "El DNI tiene 8 dígitos y el RUC 11, solo números.",
  zone: "Escribe tu distrito o una referencia con letras.",
};

/* Normaliza, valida y marca cada campo con setCustomValidity; devuelve los valores limpios o null.
   Al fallar, reportValidity enfoca el primer campo inválido y no se abre WhatsApp. */
const validateFields = (form, rules) => {
  const values = {};
  let firstInvalid = null;

  Object.entries(rules).forEach(([name, kind]) => {
    const input = form.elements[name];
    const raw = collapse(input.value);
    const clean = checkers[kind](raw);
    input.setCustomValidity(clean === null ? messages[kind] : "");
    if (clean === null && !firstInvalid) firstInvalid = input;
    values[name] = clean;
    input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
  });

  if (firstInvalid) {
    firstInvalid.reportValidity();
    return null;
  }
  return values;
};

/* ---------- Consulta de cobertura ---------- */

const coverageForm = qs("#coverageForm");

coverageForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const values = validateFields(coverageForm, { zona: "zone" });
  if (!values) return;

  openWhatsApp(
    `Hola Connect Star, quiero validar si hay cobertura de fibra óptica en mi zona: ${values.zona}.`
  );
});

/* ---------- Formulario de contacto ---------- */

const leadForm = qs("#leadForm");

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  // Los campos vacíos y la casilla sin marcar los resuelve la validación nativa (required).
  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    return;
  }

  const values = validateFields(leadForm, { documento: "document", telefono: "phone", zona: "zone" });
  if (!values) return;

  const plan = collapse(new FormData(leadForm).get("plan"));
  const text = [
    "Hola Connect Star, quiero validar cobertura.",
    `Plan de interés: ${plan}`,
    `Zona: ${values.zona}`,
    `Celular: ${values.telefono}`,
    values.documento ? `DNI/RUC: ${values.documento}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  openWhatsApp(text);
});

/* ---------- FAQ: solo una abierta ---------- */

qsa(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    qsa(".faq-list details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

/* ---------- Nav activa según scroll ---------- */

const navSections = qsa("main section[id]");
const navLinks = qsa(".main-nav a");

const setActiveNav = () => {
  let activeId = "";

  navSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) activeId = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("is-current", link.getAttribute("href") === `#${activeId}`);
  });
};

/* ---------- Header con sombra al hacer scroll + volver arriba ---------- */

const backTop = qs("#backTop");

const onScroll = () => {
  const y = window.scrollY;

  header?.classList.toggle("is-scrolled", y > 70);
  backTop?.classList.toggle("show", y > 700);
  setActiveNav();
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: motionQuery.matches ? "auto" : "smooth" });
});

