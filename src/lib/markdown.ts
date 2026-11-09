import type { ReactNode } from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"

import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import rehypeAutolinkHeadings, { type Options as AutolinkOptions } from "rehype-autolink-headings"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

/**
 * Markdown → React, at build time, without a compiler in the page.
 *
 * ## Why not MDX
 *
 * MDX was tried and dropped. Its loader either evaluates generated code at
 * render time or ships a compiler into the build, and the one library that reads
 * a content directory during render (`next-mdx-remote`) calls `Date.now()` for
 * scheduling — which this project's `cacheComponents` mode correctly refuses,
 * because a value that changes between renders cannot be prerendered.
 *
 * None of that is needed here: these articles are headings, paragraphs, lists,
 * quotes and fenced code. There is no JSX inside them. So the pipeline is a plain
 * unified transform — mdast to hast to React elements — which is deterministic,
 * has no eval, and gives the same output every build.
 *
 * ## The trade
 *
 * A post cannot import a custom component. If one ever needs to, add the
 * capability deliberately rather than carrying MDX's cost for every article that
 * does not.
 * ## Highlighting is highlight.js, not Shiki
 *
 * Shiki was the first choice and had to go: `@shikijs/core` measures itself with
 * `Date.now()` (falling back from `performance.now()`), and this project's
 * `cacheComponents` mode refuses a value that changes between renders — correctly,
 * because it cannot be prerendered. highlight.js is synchronous, pure and has no
 * clock in it, so the page ships coloured spans and no highlighter.
 */
const highlightOptions = {
  detect: false,
  ignoreMissing: true,
}

const anchorOptions: AutolinkOptions = {
  behavior: "append",
  properties: { className: ["heading-anchor"], ariaHidden: "true", tabIndex: -1 },
}

/**
 * Render one Markdown document.
 *
 * `components` maps HTML elements to the site's own — the same idea as MDX's
 * component map, without the compiler. Highlighting happens in the rehype pass,
 * so the page ships coloured spans and no highlighter.
 */
export async function renderMarkdown(
  source: string,
  components: Parameters<typeof toJsxRuntime>[1]["components"]
): Promise<ReactNode> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, anchorOptions)
    .use(rehypeHighlight, highlightOptions)

  const hast = await processor.run(processor.parse(source))

  return toJsxRuntime(hast, { Fragment, jsx, jsxs, components }) as ReactNode
}
