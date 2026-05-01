# Agent Context: Duy's Personal Blog Site

## Project Overview
A high-performance personal blog built with **Astro** and **React**. It uses a Git-based headless CMS (**Decap CMS**) where the source of truth for content is Markdown files stored in the repository.

## Tech Stack & Constraints
- **Framework:** Astro (latest)
- **Component Model:** Islands Architecture. Use `.astro` components for static UI and **React** (`.tsx`) only for interactive "islands."
- **Content:** Astro **Content Collections** for local Markdown files located in `src/content/blog/`.
- **Package Manager:** `bun` (use `bun install` and `bun dev`).
- **CMS:** Decap CMS. Configuration lives in `public/admin/config.yml`.
- **Deployment:** Vercel (Production builds).

## Coding Standards
- **Styling:** Plain CSS with CSS custom properties (no framework). Design tokens in `src/styles/global.css`; scoped `<style>` blocks in `.astro` components.
- **TypeScript:** Use strict TypeScript for all React components and Astro scripts.
- **Islands:** Always specify client directives (e.g., `client:load`, `client:visible`) when using React components in Astro pages.
- **Content Access:** Use `getCollection('blog')` from `astro:content` to fetch blog data.
- **Routing:** Follow the `src/pages/` directory structure for routing. Use `[slug].astro` for dynamic blog posts.

## Content Schema (Frontmatter)
All Markdown files in `src/content/blog/` must follow this schema:
- `title`: string
- `date`: Date (YYYY-MM-DD)
- `description`: string
- `draft`: boolean

## Interaction Protocol
1. **Context Awareness:** Before proposing a new feature, check if it should be an Astro component (static) or a React island (interactive).
2. **CMS Integration:** If modifying the `src/content/` schema, remind me to update the `public/admin/config.yml` so the Decap CMS UI stays in sync.
3. **Build Plan Adherence:** Reference the "Build Plan" in `README.md` to ensure we are following the established project phases.
4. **Tooling:** Default to `bun` commands for all terminal tasks.

## 📂 Key File Locations
- **Layouts:** `src/layouts/Base.astro` (Global shell)
- **Blog Engine:** `src/pages/blog/[slug].astro`
- **CMS Config:** `public/admin/config.yml`