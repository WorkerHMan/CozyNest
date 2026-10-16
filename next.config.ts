import createMDX from "@next/mdx"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Adding md/mdx means an .md/.mdx file placed under app/ becomes a route, so
  // content lives in `content/` and `design-system/` — never inside app/.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // The root layout is app/[locale]/layout.tsx, so an unmatched URL has no
  // single layout to compose a 404 from. global-not-found.tsx handles that
  // case directly, without rendering any layout.
  experimental: {
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

/**
 * MDX.
 *
 * Plugins are given as **strings**, not imported functions: Turbopack compiles
 * MDX in Rust and JavaScript functions cannot cross that boundary. A
 * function-form plugin list (what most older tutorials show) does not work with
 * Turbopack, which this project uses for both dev and build.
 *
 * `remark-frontmatter` is required because `@next/mdx` does not understand YAML
 * frontmatter: without it, the `---` block would be rendered as body text.
 * `gray-matter` (see `src/lib/blog.ts`) reads the same block for the index, so
 * metadata is authored once.
 *
 * `rehype-highlight` (highlight.js) is used instead of Shiki/rehype-pretty-code
 * because `shiki` and `vscode-oniguruma` sit on Next's default
 * `serverExternalPackages` list, which makes them a build-time risk. Swapping to
 * Shiki later is a config change only.
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: ["rehype-slug", "rehype-highlight"],
  },
})

export default withMDX(nextConfig)
