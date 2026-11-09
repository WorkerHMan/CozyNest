# content/posts/

One Markdown file per article. The filename is the slug, and therefore the URL.

## What a file looks like

```md
---
title:
  zh: "编译期查表"
  en: "Compile-time tables"
summary:
  zh: "一句话摘要。"
  en: "One-line summary."
category:
  zh: "C / C++"
  en: "C / C++"
topic: cpp
publishedAt: "2025-11-28"
readingMinutes: 11
tags: ["C++", "模板"]
cover: "/hero/rooftop-berries.webp"
featured: false
---

## 先看代价

正文用 Markdown 写。
```

`topic` must match an id in `src/config/topics.ts`. `cover` is optional — without it
the card draws a gradient from the slug. `featured` only affects the home page's
strip. Bodies are written in Chinese for now, and the article page says so to an
English reader rather than silently showing the wrong language.

## Why Markdown and not MDX

MDX was tried. Its loader either evaluates generated code at render time or ships a
compiler into the build, and the one library that reads a content directory during
render (`next-mdx-remote`) calls `Date.now()` for scheduling — which this project's
`cacheComponents` mode refuses, correctly, because a value that changes between
renders cannot be prerendered. Shiki, the obvious highlighter, had the same problem
inside `@shikijs/core`.

So the pipeline is `unified`: remark → rehype → React elements
(`src/lib/markdown.ts`). Deterministic, no eval, no clock. Highlighting is
highlight.js, which is synchronous and pure.

**The trade:** a post cannot import a custom component. If one ever needs to, add
that deliberately rather than paying MDX's cost on every article that does not.

## How the table of contents stays honest

`rehype-slug` gives every heading an id. `slugifyHeadings` in `src/lib/mdx.ts`
recomputes the same ids from the source with the same `github-slugger`, so the TOC
links match. That agreement is the linchpin of the feature, so it is covered by
`tests/blog/toc.test.ts` — including the `-1` suffix for a repeated heading.

## Adding an article

Drop a file in this directory. No registry to update: `src/data/posts.ts` reads the
directory, and the index, topic pages, tag pages, archive and home strip all derive
from it.
