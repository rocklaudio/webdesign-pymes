# Webdesign Pymes

Sitios demo para pymes locales (proyecto **Webs para Pymes**).

## Estructura
- `sites/<slug>/index.html` — un sitio por carpeta (estático, una página, sin dependencias).

## Deploy
**Cloudflare Pages** conectado a este repo (Git integration).
Cada `git push` a `main` publica automáticamente (no hay build real).
- Proyecto: `webdesign-pymes`
- Framework preset: `None` · Build command: `exit 0` · Build output directory: `/`

> Antes usaba Vercel. Se migró porque **Vercel Hobby prohíbe el uso comercial**
> (sitios por los que se cobra). Cloudflare Pages es gratis y sí lo permite.

## URL
- Base: `https://webdesign-pymes.pages.dev`
- Cada sitio: `https://webdesign-pymes.pages.dev/sites/<slug>/`

## Flujo para publicar un sitio
1. Copiar el sitio aprobado a `sites/<slug>/index.html` (+ `assets/`).
2. `git add -A && git commit -m "add <slug>" && git push`
3. Cloudflare Pages despliega solo (≈1 min).
