# Duy's Personal Blog Site

A personal website and blog built with **Astro**, **React**, **Decap CMS**, and deployed to **Vercel**.

---

## How this site works

```
                  ┌─────────────────────────┐
  Write a post    │       Decap CMS          │
  in the browser  │  (hosted at /admin)      │
        │         └────────────┬────────────┘
        │                      │ commits Markdown to Git
        ▼                      ▼
  ┌───────────────────────────────────────────┐
  │              GitHub Repo                  │
  │  content/blog/*.md  ◄──── source of truth │
  └────────────────────┬──────────────────────┘
                       │ push triggers deploy
                       ▼
  ┌───────────────────────────────────────────┐
  │              Vercel Build                 │
  │  astro build → static HTML + JS islands  │
  └────────────────────┬──────────────────────┘
                       │
                       ▼
              https://yourdomain.com
```

### The pieces

| Layer | Technology | Role |
|---|---|---|
| Framework | [Astro](https://astro.build) | Renders pages to static HTML at build time |
| Components | [React](https://react.dev) | Interactive "islands" that hydrate in the browser |
| Content | Markdown (`.md`) | Blog posts stored as files in `content/blog/` |
| CMS | [Decap CMS](https://decapcms.org) | Browser UI for writing posts — commits Markdown to Git |
| Hosting | [Vercel](https://vercel.com) | Builds and serves the site; auto-deploys on every push |

### Why Astro?

Astro's [Islands Architecture](https://docs.astro.build/en/concepts/islands/) ships zero JavaScript by default. Only the components explicitly marked `client:load` (or `client:visible`, etc.) send JS to the browser. This makes the site fast without giving up React for interactive pieces like a search box or a theme toggle.

### Why Decap CMS?

Decap CMS is Git-native — there is no separate database. When you save a post in the CMS UI, it opens a pull request (or commits directly to `main`). Vercel detects the commit and rebuilds the site. Everything lives in this repo and is version-controlled.

---

## Project structure

```
/
├── src/
│   ├── components/          # Shared UI — Astro (.astro) and React (.tsx)
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ThemeToggle.tsx  # Example React island
│   ├── layouts/
│   │   ├── Base.astro       # HTML shell (head, header, footer)
│   │   └── BlogPost.astro   # Layout wrapper for individual posts
│   ├── pages/
│   │   ├── index.astro      # Home page
│   │   ├── about.astro      # About page
│   │   └── blog/
│   │       ├── index.astro  # Blog index — lists all posts
│   │       └── [slug].astro # Dynamic route — renders one post
│   ├── content/
│   │   └── blog/            # Markdown files — one file = one post
│   │       └── hello-world.md
│   └── styles/
│       └── global.css
├── public/
│   ├── admin/
│   │   ├── index.html       # Decap CMS entry point
│   │   └── config.yml       # CMS config — fields, collections, Git backend
│   └── images/              # Static assets (uploaded via CMS or manually)
├── astro.config.mjs          # Astro config — React integration, site URL
├── package.json
└── README.md
```

---

## Local development

```bash
# Install dependencies
bun install

# Start dev server (hot reload)
bun dev
# → http://localhost:4321

# Build for production
bun run build

# Preview the production build locally
bun run preview
```

The Decap CMS admin panel (`/admin`) only works fully when connected to GitHub. For local content editing, edit the Markdown files in `src/content/blog/` directly.

---

## Adding a blog post

**Via CMS (recommended):** Go to `https://yourdomain.com/admin`, log in with GitHub, and use the editor. Saving commits a new `.md` file to `src/content/blog/` and Vercel redeploys automatically.

**Manually:** Create a file in `src/content/blog/my-post-title.md` with frontmatter:

```markdown
---
title: "My Post Title"
date: 2026-04-27
description: "A short description shown in the blog index."
draft: false
---

Post content goes here.
```

---

## Deployment

The site deploys automatically to Vercel on every push to `main`.

**One-time setup:**
1. Import this repo in the [Vercel dashboard](https://vercel.com/new)
2. Framework preset: **Astro** (auto-detected)
3. Add a custom domain in Vercel project settings
4. In `public/admin/config.yml`, set `base_url` to your Vercel domain so Decap CMS OAuth works

---

## Build plan

- [ ] **Phase 1 — Scaffold Astro** Replace `react-app/` with an Astro project at the repo root; configure the React integration
- [ ] **Phase 2 — Core pages** Home, About, and Blog index pages with a base layout
- [ ] **Phase 3 — Blog engine** Dynamic `[slug].astro` route powered by Astro Content Collections
- [ ] **Phase 4 — Decap CMS** Add `public/admin/` config wired to this repo's `main` branch
- [ ] **Phase 5 — Styling** Design system (typography, color, dark mode toggle)
- [ ] **Phase 6 — Vercel deploy** Connect repo, verify CI/CD, set custom domain
