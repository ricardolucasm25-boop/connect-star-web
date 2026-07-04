/* Panel de imágenes Connect Star
 *
 * Sube imágenes a assets/img/ del repositorio vía la API de GitHub.
 * Requiere un token fine-grained con permiso "Contents: Read and write"
 * SOLO sobre este repositorio. GitHub Pages republica tras cada commit.
 */

const REPO_OWNER = "ricardolucasm25-boop";
const REPO_NAME = "connect-star-web";
const BRANCH = "main";
const TOKEN_KEY = "cs_admin_token";

const SLOTS = [
  {
    file: "hero-hogar.jpg",
    label: "Foto principal (portada)",
    desc: "Familia o persona disfrutando internet en casa",
    w: 1600,
    h: 1200,
  },
  {
    file: "instalacion-tecnico.jpg",
    label: "Instalación / técnico",
    desc: "Técnico instalando fibra óptica",
    w: 1200,
    h: 900,
  },
  {
    file: "router-mesh.jpg",
    label: "Equipos WiFi / mesh",
    desc: "Router WiFi 6 y punto mesh instalados",
    w: 1200,
    h: 900,
  },
  {
    file: "testimonio-1.jpg",
    label: "Cliente 1 (opiniones)",
    desc: "Retrato o avatar, se muestra en círculo",
    w: 400,
    h: 400,
  },
  {
    file: "testimonio-2.jpg",
    label: "Cliente 2 (opiniones)",
    desc: "Retrato o avatar, se muestra en círculo",
    w: 400,
    h: 400,
  },
  {
    file: "testimonio-3.jpg",
    label: "Cliente 3 (opiniones)",
    desc: "Retrato o avatar, se muestra en círculo",
    w: 400,
    h: 400,
  },
  {
    file: "og-cover.jpg",
    label: "Imagen para redes (al compartir)",
    desc: "Se ve al compartir el link por WhatsApp/Facebook",
    w: 1200,
    h: 630,
  },
];

const qs = (s, sc = document) => sc.querySelector(s);
const state = { token: localStorage.getItem(TOKEN_KEY) || "", pending: {} };

const api = async (path, options = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${state.token}`,
      ...(options.headers || {}),
    },
  });
  if (!response.ok && response.status !== 404) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Error HTTP ${response.status}`);
  }
  return response;
};

/* ---------- Conexión ---------- */

const tokenInput = qs("#tokenInput");
const connStatus = qs("#connStatus");

const setStatus = (el, text, kind) => {
  el.textContent = text;
  el.className = `status ${kind || ""}`;
};

const testConnection = async () => {
  if (!state.token) {
    setStatus(connStatus, "Pega el código de acceso para empezar.", "err");
    return false;
  }
  setStatus(connStatus, "Verificando acceso…", "busy");
  try {
    const response = await api(`/repos/${REPO_OWNER}/${REPO_NAME}`);
    if (response.status === 404) throw new Error("El token no tiene acceso al repositorio.");
    const repo = await response.json();
    if (!repo.permissions || !repo.permissions.push) {
      throw new Error("El token no tiene permiso de escritura (Contents: Read and write).");
    }
    setStatus(connStatus, "✓ Conectado. Ya puedes subir imágenes.", "ok");
    return true;
  } catch (error) {
    setStatus(connStatus, `✗ ${error.message}`, "err");
    return false;
  }
};

qs("#connectBtn").addEventListener("click", () => {
  const value = tokenInput.value.trim();
  if (value) {
    state.token = value;
    localStorage.setItem(TOKEN_KEY, value);
  }
  testConnection();
});

qs("#forgetBtn").addEventListener("click", () => {
  state.token = "";
  tokenInput.value = "";
  localStorage.removeItem(TOKEN_KEY);
  setStatus(connStatus, "Código olvidado en este navegador.", "");
});

if (state.token) {
  tokenInput.value = state.token;
  testConnection();
}

/* ---------- Procesamiento de imagen ---------- */

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = url;
  });

// Recorte tipo "cover" al tamaño exacto del slot + compresión JPEG.
const processImage = async (file, slot) => {
  const { img, url } = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = slot.w;
  canvas.height = slot.h;
  const ctx = canvas.getContext("2d");

  const scale = Math.max(slot.w / img.naturalWidth, slot.h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, (slot.w - dw) / 2, (slot.h - dh) / 2, dw, dh);
  URL.revokeObjectURL(url);

  let quality = 0.86;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  // Ajusta calidad hasta quedar bajo ~350 KB.
  while (dataUrl.length * 0.75 > 350 * 1024 && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
};

/* ---------- Subida a GitHub ---------- */

const uploadSlot = async (slot, dataUrl, statusEl) => {
  const path = `assets/img/${slot.file}`;
  setStatus(statusEl, "Obteniendo versión actual…", "busy");

  const current = await api(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${BRANCH}`);
  const sha = current.status === 404 ? undefined : (await current.json()).sha;

  setStatus(statusEl, "Subiendo…", "busy");
  const body = {
    message: `img: actualizar ${slot.file} desde el panel`,
    content: dataUrl.split(",")[1],
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const put = await api(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (put.status === 404) throw new Error("Sin acceso de escritura al repositorio.");

  setStatus(statusEl, "✓ Publicada. La web se actualiza en 1-2 minutos.", "ok");
};

/* ---------- Render de casillas ---------- */

const grid = qs("#slotsGrid");

SLOTS.forEach((slot) => {
  const card = document.createElement("article");
  card.className = "slot";
  card.innerHTML = `
    <h3>${slot.label}</h3>
    <p class="meta"><code>${slot.file}</code> · ${slot.w}×${slot.h}px · ${slot.desc}</p>
    <div class="drop" tabindex="0" role="button" aria-label="Elegir imagen para ${slot.label}">
      <img src="./assets/img/${slot.file}?v=${Date.now()}" alt="" />
      <span class="overlay">Arrastra una foto aquí o haz clic</span>
    </div>
    <input type="file" accept="image/*" />
    <div class="row">
      <button class="publish" disabled>Publicar</button>
      <button class="ghost cancel" type="button" disabled>Descartar</button>
    </div>
    <p class="status"></p>
  `;
  grid.appendChild(card);

  const drop = qs(".drop", card);
  const preview = qs(".drop img", card);
  const overlay = qs(".overlay", card);
  const fileInput = qs("input[type=file]", card);
  const publishBtn = qs(".publish", card);
  const cancelBtn = qs(".cancel", card);
  const statusEl = qs(".status", card);
  const originalSrc = preview.src;

  const setPending = (dataUrl) => {
    state.pending[slot.file] = dataUrl;
    preview.src = dataUrl;
    drop.classList.add("has-new");
    overlay.textContent = "Lista para publicar";
    publishBtn.disabled = false;
    cancelBtn.disabled = false;
    if (!qs(".badge-new", drop)) {
      const badge = document.createElement("span");
      badge.className = "badge-new";
      badge.textContent = "Nueva";
      drop.appendChild(badge);
    }
  };

  const clearPending = () => {
    delete state.pending[slot.file];
    preview.src = originalSrc;
    drop.classList.remove("has-new");
    overlay.textContent = "Arrastra una foto aquí o haz clic";
    publishBtn.disabled = true;
    cancelBtn.disabled = true;
    qs(".badge-new", drop)?.remove();
    fileInput.value = "";
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setStatus(statusEl, "El archivo debe ser una imagen.", "err");
      return;
    }
    try {
      setStatus(statusEl, "Procesando imagen…", "busy");
      const dataUrl = await processImage(file, slot);
      setPending(dataUrl);
      setStatus(statusEl, "Imagen ajustada al tamaño correcto. Revisa la vista previa.", "");
    } catch (error) {
      setStatus(statusEl, `✗ ${error.message}`, "err");
    }
  };

  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));

  ["dragenter", "dragover"].forEach((type) =>
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.add("dragover");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    drop.addEventListener(type, (event) => {
      event.preventDefault();
      drop.classList.remove("dragover");
    })
  );
  drop.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));

  cancelBtn.addEventListener("click", clearPending);

  publishBtn.addEventListener("click", async () => {
    const dataUrl = state.pending[slot.file];
    if (!dataUrl) return;
    if (!state.token) {
      setStatus(statusEl, "Primero conecta con tu código de acceso (sección 1).", "err");
      return;
    }
    publishBtn.disabled = true;
    try {
      await uploadSlot(slot, dataUrl, statusEl);
      drop.classList.remove("has-new");
      qs(".badge-new", drop)?.remove();
      overlay.textContent = "Publicada ✓";
      cancelBtn.disabled = true;
      delete state.pending[slot.file];
    } catch (error) {
      setStatus(statusEl, `✗ ${error.message}`, "err");
      publishBtn.disabled = false;
    }
  });
});
