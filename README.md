# blog.sentirum.ai

Technical blog built with Astro.

## Stack

- Astro 6 (static output)
- MD/MDX content collections
- Tailwind CSS 4
- KaTeX math rendering
- RSS + sitemap
- Auto-generated OG images (per post)
- Pagefind local search
- Giscus comments (optional)

## Local Development

```bash
npm install
npm run dev
```

Open: `http://localhost:4321`

## New Post

Add a file under:

- `src/content/blog/my-post.md`
- or `src/content/blog/my-post.mdx`

Example frontmatter:

```yaml
---
title: "My Post"
description: "Post description"
pubDate: 2026-04-01
tags: ["ai", "devops"]
ogImage: "/og/custom-image.png" # optional override
draft: false
---
```

## Build

```bash
npm run build
```

Build command automatically:

1. Generates OG images in `public/og/`
2. Builds the static site
3. Generates Pagefind search index in `dist/pagefind/`

## Giscus Comments Setup

1. Enable **GitHub Discussions** on your repo.
2. Go to `https://giscus.app` and configure your site.
3. Copy values into `.env` from `.env.example`.

Required vars:

- `PUBLIC_GISCUS_REPO`
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY_ID`

## Deploy (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Custom domain: `blog.sentirum.ai`
