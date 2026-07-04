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

window.addEventListener("scroll", setActiveNav, { passive: true });
setActiveNav();

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
