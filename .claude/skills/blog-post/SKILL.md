---
name: blog-post
description: >
  Guide for creating new blog posts and adding images in this Astro blog.
  Use this skill whenever the user wants to write a new post, add a tag,
  include an image, or asks how the blog content works.
---

# Blog Post Guide

## Creating a new post

Posts live in `src/content/blog/` as `.md` files. The filename becomes the URL slug — e.g. `my-post.md` → `/blog/my-post`.

### Frontmatter

Every post needs this frontmatter block at the top:

```yaml
---
title: "Your Post Title"
date: 2026-05-07
description: "One sentence describing the post."
draft: false
tags: ["tag1", "tag2"]
---
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Shown as the page `<h1>` |
| `date` | YYYY-MM-DD | yes | Used for sorting |
| `description` | string | yes | Shown in the blog listing |
| `draft` | boolean | no | Defaults to `false`; set `true` to hide from listings |
| `tags` | string array | no | Appear as pill links on the post and blog index |

### Minimal example

```markdown
---
title: "What I've Been Reading"
date: 2026-05-07
description: "A few books worth your time."
draft: false
tags: ["reading"]
---

Your content here.
```

---

## Adding images

### Step 1 — Co-locate the image

Place the image file **next to the `.md` file** in `src/content/blog/`:

```
src/content/blog/
├── my-post.md
└── my-photo.jpg
```

### Step 2 — Reference it in Markdown

Use a relative path:

```markdown
![](./my-photo.jpg)
```

The image will be centered, capped to the content width, and given rounded corners automatically.

### Step 3 — Control the size (optional)

To make an image smaller **for this post only**, wrap it in a `div` with a `max-width`. The blank lines inside the div are required:

```markdown
<div style="max-width: 500px; margin: 0 auto;">

![](./my-photo.jpg)

</div>
```

Adjust `500px` to whatever size looks right. This has no effect on other posts.

---

## Tags reference

- Tags are defined per-post in frontmatter: `tags: ["reading", "tech"]`
- Each tag gets an archive page at `/tags/<tag>` listing all posts with that tag
- The blog index (`/blog`) shows a **Search by Topic** section with all unique tags
- Any string is valid — just be consistent with spelling across posts
