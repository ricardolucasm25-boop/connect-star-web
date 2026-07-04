const WHATSAPP_NUMBER = "51967967540";

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.lucide) {
  window.lucide.createIcons();
}

const openWhatsApp = (text) => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
};

/* ---------- Menú móvil ---------- */

const header = qs(".site-header");
const navToggle = qs(".nav-toggle");
const mainNav = qs(".main-nav");

navToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen && mainNav) {
    header.style.setProperty("--mobile-nav-height", `${mainNav.offsetHeight + 8}px`);
  }
});

qsa(".main-nav a, .header-cta").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Animaciones de entrada ---------- */

const revealItems = qsa(".reveal-up");

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ---------- Contadores animados ---------- */

const counters = qsa(".counter");
let countersPlayed = false;

const playCounters = () => {
  if (countersPlayed) return;
  countersPlayed = true;

  counters.forEach((counter) => {
    const target = Number(counter.dataset.target || "0");
    const duration = 1300;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased).toLocaleString("es-PE");

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  });
};

const statsBox = qs(".stats-grid");
if (statsBox && !prefersReducedMotion) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        playCounters();
        counterObserver.disconnect();
      }
    },
    { threshold: 0.45 }
  );
  counterObserver.observe(statsBox);
} else {
  counters.forEach((counter) => {
    counter.textContent = Number(counter.dataset.target || "0").toLocaleString("es-PE");
  });
}

/* ---------- Filtro de planes ---------- */

const planCards = qsa(".plan-card");
const filterButtons = qsa(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));

    planCards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.type === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const selectPlan = (planName) => {
  planCards.forEach((card) => {
    const isMatch = card.dataset.plan === planName;
    card.classList.toggle("is-selected", isMatch);

    if (isMatch) {
      card.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
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
    qs("#planes")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    window.setTimeout(() => selectPlan(planName), prefersReducedMotion ? 0 : 500);
  });
});

/* ---------- Efecto tilt en tarjetas ---------- */

if (!prefersReducedMotion) {
  planCards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      const rotateX = ((y / rect.height) - 0.5) * -6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

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
    qs("#cmpX").textContent = Math.max(1, Math.round(PLAN_MBPS / current));
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

if (lagArena && !prefersReducedMotion) {
  const dotGood = qs("#dotGood");
  const dotBad = qs("#dotBad");
  const lagRange = qs("#lagRange");
  const lagVal = qs("#lagVal");
  const fields = qsa(".pane-field", lagArena);

  let lagMs = Number(lagRange?.value || 180);
  const history = []; // posiciones relativas {t, x, y} con x/y en 0..1
  let lastPos = { x: 0.5, y: 0.5 };

  lagRange?.addEventListener("input", () => {
    lagMs = Number(lagRange.value);
    if (lagVal) lagVal.textContent = lagMs;
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

  const place = (dot, pos) => {
    const field = dot.parentElement;
    dot.style.transform = `translate(${pos.x * field.clientWidth}px, ${pos.y * field.clientHeight}px)`;
  };

  const tick = () => {
    const now = performance.now();
    // bufferbloat: el retraso ondula, no es constante
    const wobble = 1 + 0.35 * Math.sin(now / 300);
    place(dotGood, lastPos);
    place(dotBad, positionAt(now - lagMs * wobble));
    requestAnimationFrame(tick);
  };

  tick();
}

/* ---------- Teaser de lag en el hero (solo desktop) ---------- */

const heroSection = qs(".hero-section");
const lagTeaser = qs("#lagTeaser");

if (
  heroSection &&
  lagTeaser &&
  !prefersReducedMotion &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
  const tzGood = qs(".tz-good", lagTeaser);
  const tzBad = qs(".tz-bad", lagTeaser);
  const tzTip = qs(".tz-tip", lagTeaser);
  const trail = [];
  let cursor = null;
  let playStart = 0;

  heroSection.addEventListener("pointermove", (event) => {
    const rect = heroSection.getBoundingClientRect();
    cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    trail.push({ t: performance.now(), ...cursor });
    if (trail.length > 200) trail.splice(0, trail.length - 200);
    if (!playStart) playStart = performance.now();
    heroSection.classList.add("is-playing");
  });

  heroSection.addEventListener("pointerleave", () => {
    heroSection.classList.remove("is-playing");
    tzTip.classList.remove("show");
    trail.length = 0;
    cursor = null;
    playStart = 0;
  });

  const trailAt = (time) => {
    for (let i = trail.length - 1; i >= 0; i -= 1) {
      if (trail[i].t <= time) return trail[i];
    }
    return cursor;
  };

  const teaserTick = () => {
    if (cursor) {
      const now = performance.now();
      const wobble = 1 + 0.35 * Math.sin(now / 300);
      const late = trailAt(now - 230 * wobble) || cursor;

      tzGood.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
      tzBad.style.transform = `translate(${late.x}px, ${late.y}px)`;
      tzTip.style.transform = `translate(${late.x + 16}px, ${late.y + 14}px)`;

      if (playStart && now - playStart > 1300) tzTip.classList.add("show");
    }
    requestAnimationFrame(teaserTick);
  };

  teaserTick();
}

/* ---------- Animación de velocidad en el hero (haces de fibra) ---------- */

const heroFx = qs(".hero-fx");
const heroPhoto = qs(".hero-photo");

if (heroFx && heroPhoto && !prefersReducedMotion) {
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
    DPR = Math.min(window.devicePixelRatio || 1, 2);
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
    bg.addColorStop(0, "#05041c");
    bg.addColorStop(0.55, "#0d0b38");
    bg.addColorStop(1, "#2a0f52");
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
    requestAnimationFrame(draw);
  };

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(heroFx);
  } else {
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();
  requestAnimationFrame(draw);
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

/* ---------- Consulta de cobertura ---------- */

const coverageForm = qs("#coverageForm");

coverageForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const zone = String(new FormData(coverageForm).get("zona") || "").trim();
  if (!zone) return;

  openWhatsApp(
    `Hola Connect Star, quiero validar si hay cobertura de fibra óptica en mi zona: ${zone}.`
  );
});

/* ---------- Formulario de contacto ---------- */

const leadForm = qs("#leadForm");

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!leadForm.checkValidity()) {
    leadForm.reportValidity();
    return;
  }

  const formData = new FormData(leadForm);
  const documentNumber = String(formData.get("documento") || "").trim();
  const phone = String(formData.get("telefono") || "").trim();
  const zone = String(formData.get("zona") || "").trim();
  const plan = String(formData.get("plan") || "").trim();
  const text = [
    "Hola Connect Star, quiero validar cobertura.",
    `Plan de interés: ${plan}`,
    `Zona: ${zone}`,
    `Celular: ${phone}`,
    documentNumber ? `DNI/RUC: ${documentNumber}` : "",
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

/* ---------- Progreso de scroll + header compacto + volver arriba ---------- */

const progressBar = qs(".scroll-progress");
const backTop = qs("#backTop");

const onScroll = () => {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const y = window.scrollY;

  if (progressBar && max > 0) {
    progressBar.style.width = `${Math.min(100, (y / max) * 100)}%`;
  }
  header?.classList.toggle("is-scrolled", y > 70);
  backTop?.classList.toggle("show", y > 700);
  setActiveNav();
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
});

/* ---------- Burbuja de invitación en WhatsApp flotante ---------- */

const waBubble = qs("#waBubble");

if (waBubble && !sessionStorage.getItem("waBubbleSeen")) {
  window.setTimeout(() => waBubble.classList.add("show"), 6000);
  window.setTimeout(() => waBubble.classList.remove("show"), 18000);
  qs(".floating-wa")?.addEventListener("click", () => {
    waBubble.classList.remove("show");
    sessionStorage.setItem("waBubbleSeen", "1");
  });
}

/* ---------- Fondo animado de fibra ---------- */

const canvas = qs("#fiberCanvas");

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let particles = [];

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const total = Math.min(88, Math.max(42, Math.round(width / 18)));
    particles = Array.from({ length: total }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      hue: Math.random() > 0.5 ? 188 : 294,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      const dxPointer = pointer.x - particle.x;
      const dyPointer = pointer.y - particle.y;
      const pointerDistance = Math.hypot(dxPointer, dyPointer);

      if (pointerDistance < 150) {
        particle.x -= dxPointer * 0.002;
        particle.y -= dyPointer * 0.002;
      }

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const dx = particle.x - next.x;
        const dy = particle.y - next.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 118) {
          const alpha = (1 - distance / 118) * 0.22;
          ctx.strokeStyle = `hsla(${particle.hue}, 100%, 66%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = `hsla(${particle.hue}, 100%, 66%, 0.42)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerleave",
    () => {
      pointer.x = -1000;
      pointer.y = -1000;
    },
    { passive: true }
  );

  resize();
  draw();
}
