# Draft Studio

A free design-resources site: downloadable **PSD, AI, PDF and SVG templates**,
**SVG icons** and **logos**. Plain static site with no build step and no database.
It runs on GitHub Pages or any web host.

## Pages

| Page | What it does |
|------|--------------|
| `index.html` | Home: search, category tiles, featured designs, icon preview |
| `templates.html` | Templates with search, category, format (PSD/AI/PDF/SVG) filters |
| `logos.html` | Logos, same filters as templates |
| `icons.html` | SVG icons: pick colour & size, download SVG or PNG, copy SVG code |

Clicking a design opens a detail view with one download button per format, plus
a shareable link (e.g. `templates.html#event-flyer`).

## Adding content (all you ever edit is `js/catalog.js`)

1. **Upload the file(s)**
   - Templates → `files/templates/` (e.g. `wedding-invite.psd`, `wedding-invite.ai`, `wedding-invite.pdf`)
   - Logos → `files/logos/`
   - Icons → `files/icons/` (SVG only)
2. **Upload a preview image** (JPG/PNG/WEBP, ~1200px wide) to `previews/`.
   Browsers can't display PSD or AI files, so templates and logos need one.
   Items with an SVG file use it as the preview automatically.
3. **Add an entry** at the top of the right list in `js/catalog.js`. The file's
   comments explain every field and include a multi-format example.

On GitHub you can do all of this in the browser: *Add file → Upload files*
into the folder, then edit `js/catalog.js` with the pencil icon.

**Icon tips:** use `stroke="currentColor"` / `fill="currentColor"` in your SVG
icons so the colour picker can recolour them, and keep a `viewBox`.

**Large files:** GitHub rejects files over 100 MB and warns above 50 MB. For big PSDs,
zip them, or host them elsewhere (Google Drive, Dropbox, etc.) and put that link in `path`.

## Branding

- Logo: replace `assets/logo.svg` (light background) and `assets/logo-dark.svg` (dark mode).
- Favicon: `assets/favicon.svg`.
- Brand colour: change `--accent` at the top of `css/studio.css`.
- Name, tagline, email, WhatsApp, Instagram and licence text: `site` block in `js/catalog.js`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
(Opening the HTML file directly works, but icon recolouring and the PNG and code
tools need a web server.)
