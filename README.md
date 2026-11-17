# Balamurugan Devadarshan — portfolio

A hand-built, single-page interactive portfolio: HTML + CSS + vanilla JavaScript. No framework, no build step, no dependencies.

## Put it online for free (GitHub Pages)

1. On GitHub, create a **public** repository named exactly `devadd2105-max.github.io`.
2. Upload everything in this folder (the files themselves, not the folder) and commit.
3. Repository **Settings → Pages → Build and deployment → Deploy from a branch → main / (root)**.
4. After a minute the site is live at `https://devadd2105-max.github.io/`.
5. To be found on Google: open Google Search Console, add that URL, and submit `sitemap.xml`.

## Using it

- Bottom dock, or arrow keys / number keys 1–8, to switch pages.
- `Ctrl/Cmd + K` opens the command menu. The backtick key opens the terminal (try `help`, `goto awards`, `hack`).
- Email and phone are assembled by JavaScript when you tap Reveal, to keep them away from scrapers.

## Editing

- Text lives in `index.html` (projects, leadership, credentials). Awards and photos are plain HTML cards: copy one `<li class="card award">` or `<figure class="shot">` block to add more.
- Colours are CSS variables at the top of `style.css`.
- Optional headshot: add `assets/photo.jpg` (about 520 x 640) and it appears in the Home profile card.

## Files

`index.html` · `style.css` · `script.js` · `photography/` (images) · `assets/` (favicon, social preview) · `sitemap.xml` · `robots.txt` · `404.html` · `photography.html` (redirects to the Photos page).
- With JavaScript off, every page stacks into one long page (fallback).

## v7 additions
- Home: photographer's viewfinder (rotating own photos) and featured roles (President, Head of Photography, Senior Prefect) linking into the Leadership page.
- About: Education and a tabbed "What makes me, me" (interests, strengths, aspirations, values). The reflection text is a draft: edit it in your own words.
- Projects: Case studies, Code (five real excerpts from SG Wayfinder and Clearway) and a Live demo (password strength lab, runs locally).
- Service page (id `credentials`): Industry exploration, Service, Earned, In progress, Skills.
- Photos: viewfinder lightbox with filmstrip; press G for a rule-of-thirds grid.
- Terminal: type `ctf` for a small puzzle.

## Optional: AI answers in the terminal (`ask`)
Never put an API key in this site: GitHub Pages is public and anyone could read it. To enable `ask`,
deploy a tiny proxy (for example a Cloudflare Worker) that holds your Gemini key as a secret, accepts
`POST {q}` and returns `{answer}`, with CORS limited to your site and a rate limit. Then add
`<script>window.ASK_URL="https://your-proxy.workers.dev"</script>` before `script.js` in index.html.
