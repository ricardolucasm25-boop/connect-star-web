# Connect Star — Landing comercial

Landing estática de Connect Star (internet 100% fibra óptica), lista para GitHub Pages.
Diseño neón alineado al logo, orientado a conversión por WhatsApp.

## Estructura

- `index.html` — contenido: hero, ofertas, planes, cobertura, beneficios, mesh, métricas, opiniones, contacto, FAQ.
- `styles.css` — diseño responsive, paleta neón, animaciones.
- `script.js` — menú, filtros de planes, contadores, formularios → WhatsApp, canvas de fibra.
- `assets/img/` — imágenes de la página. **Son placeholders**: ver `GUIA-IMAGENES.md` para el brief del diseñador (se reemplazan sobreescribiendo el archivo, sin tocar código).

## Datos comerciales

- WhatsApp / teléfono: `51967967540` (editable en `script.js`, constante `WHATSAPP_NUMBER`, y en los enlaces `wa.me` / `tel:` de `index.html`).
- Los planes y precios se editan directamente en las tarjetas de `index.html`.

## Publicar en GitHub Pages

1. En GitHub: `Settings > Pages`.
2. Source: `Deploy from a branch`, rama `main`, carpeta `/ (root)`.
3. Guardar y esperar 1-2 minutos; GitHub muestra la URL pública.

Cada `git push` a `main` republica la página automáticamente.

## Conectar tu dominio propio

1. Crear en la raíz del repo un archivo `CNAME` con una sola línea: el dominio (ej. `www.connectstar.pe`).
2. En el panel DNS del dominio:
   - `www` → registro **CNAME** apuntando a `<usuario>.github.io`
   - dominio raíz (`@`) → registros **A** hacia GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. En GitHub `Settings > Pages > Custom domain`: escribir el dominio y activar **Enforce HTTPS** (disponible tras propagar el DNS, hasta 24 h).
4. Actualizar la etiqueta `<link rel="canonical">` de `index.html` con el dominio final.

## Panel de imágenes para el diseñador (`admin.html`)

La página incluye un panel en `/admin.html` para que el diseñador suba las fotos
sin tocar código: arrastra la imagen a su casilla, el panel la recorta/comprime al
tamaño exacto y hace commit a `assets/img/` vía la API de GitHub. Pages republica solo.

Para darle acceso al diseñador:

1. Entrar (con la cuenta dueña del repo) a
   `GitHub > Settings > Developer settings > Fine-grained personal access tokens > Generate new token`.
2. Configurar: **Repository access** → Only select repositories → este repo.
   **Permissions** → Repository permissions → **Contents: Read and write**. Lo demás en "No access".
3. Poner vencimiento (ej. 90 días) y generar. Copiar el token (`github_pat_…`).
4. Enviarle al diseñador el link `https://<tu-dominio>/admin.html` y el token por un canal privado.
   Él lo pega una sola vez en el panel ("se guarda solo en este navegador").

El token solo permite editar archivos de este repositorio; se puede revocar en cualquier momento
desde la misma pantalla de GitHub.

## Desarrollo local

No requiere build. Abrir `index.html` en el navegador, o servir con:

```bash
python -m http.server 8080
```
