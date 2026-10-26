# Web Graphs Technologies — Website

A static multi-page website for Web Graphs Technologies, a Johannesburg-based
company offering Uber/Bolt fingerprint capture, web & app development,
graphic design, graphic design courses, office printing and computer
software installation.

## Structure

- `index.html` — Home page
- `services.html` — Full service details
- `courses.html` — Graphic design courses
- `about.html` — About the company
- `contact.html` — Contact form, info and map
- `css/brand-palette.css` — Brand colour tokens (Ink `#111111`, WebGraphs Blue `#1E88E5`, Action Blue `#0A6CC2`, graphite neutrals)
- `js/script.js` — Navigation, scroll reveal animations, contact form
- `assets/favicon.svg` — Site favicon

## Running locally

No build step required. Serve the folder with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
