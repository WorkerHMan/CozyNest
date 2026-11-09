# content/

Article and knowledge-base source files live here once they stop being
TypeScript data.

## Why this directory is empty

Articles currently live in `src/data/posts.ts` as typed objects. That has real
advantages: the shape is checked at compile time, `zh` and `en` are guaranteed to
line up, and nothing has to be parsed at build time.

The requirement this repository was written against asks for Markdown / MDX with
a `content/` directory. Moving there is a writing-experience decision, not a
technical one — you either prefer creating a `.mdx` file per post, or editing one
object in a typed file. Nothing has moved until that decision is made, because
migrating and then migrating back is pure churn.

## What a migration would touch

1. `src/data/posts.ts` → one `.mdx` file per article, with front matter for
   title, topic, date, summary and cover.
2. `src/lib/posts.ts` (new): read the directory, parse front matter, expose the
   same functions `posts.ts` exposes today — so pages do not change.
3. Body rendering: `PostBody` currently renders typed blocks; MDX would render
   components instead, which is also the point where syntax highlighting and a
   table of contents become cheap.

Keep the file name in the front matter identical to the slug the URLs already
use, or published links break.
