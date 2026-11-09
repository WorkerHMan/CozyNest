import Link from "next/link"

import { renderMarkdown } from "@/lib/markdown"
import type { TocEntry } from "@/lib/mdx"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Element styles for article bodies.
 *
 * One map, so a post cannot drift from the rest of the site: headings get the
 * display face and scroll margin (so an anchor jump clears the sticky header),
 * lists get the brand marker, and the code frame gets the border that
 * `rehype-pretty-code` deliberately leaves to us.
 */
const components = {
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      {...props}
      className={cn(
        "font-heading mt-12 mb-4 scroll-mt-24 text-xl font-semibold tracking-tight text-balance first:mt-0",
        props.className
      )}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3
      {...props}
      className={cn("font-heading mt-8 mb-3 scroll-mt-24 text-base font-semibold tracking-tight", props.className)}
    />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p {...props} className={cn("my-5 text-base leading-relaxed text-pretty text-foreground/85", props.className)} />
  ),
  // Tailwind's preflight clears list styles, so the marker is put back on the
  // list itself — a `list-disc` on the `li` is not enough once the parent has
  // `list-style: none`.
  ul: (props: React.ComponentProps<"ul">) => (
    <ul {...props} className={cn("my-5 list-disc space-y-2 pl-5 marker:text-brand", props.className)} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol {...props} className={cn("my-5 list-decimal space-y-2 pl-5 marker:text-brand", props.className)} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li
      {...props}
      className={cn("text-base leading-relaxed text-pretty text-foreground/85", props.className)}
    />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className={cn(
        "my-6 border-l-2 border-brand/60 pl-4 text-base leading-relaxed text-pretty text-muted-foreground",
        props.className
      )}
    />
  ),
  a: (props: React.ComponentProps<"a">) => {
    const href = props.href ?? ""
    const isHeadingAnchor =
      typeof props.className === "string" && props.className.includes("heading-anchor")

    // The "#" appended to every heading. It must keep its own class: that class
    // is what makes it invisible until hover, and what draws the glyph.
    if (isHeadingAnchor) {
      return <a {...props} className={cn("heading-anchor", focusRing)} />
    }

    if (/^https?:/.test(href)) {
      return (
        <a
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "underline decoration-brand/50 underline-offset-4 transition-colors duration-200 hover:decoration-brand",
            focusRing
          )}
        />
      )
    }
    // Internal and in-page links stay in the App Router, so navigation is
    // client-side and a `#anchor` does not reload the article.
    return (
      <Link
        href={href}
        className={cn(
          "underline decoration-brand/50 underline-offset-4 transition-colors duration-200 hover:decoration-brand",
          focusRing
        )}
      >
        {props.children}
      </Link>
    )
  },
  // The frame scrolls, not the `pre`: a long line then keeps its own scrollbar
  // inside a rounded border instead of being clipped by the figure.
  figure: (props: React.ComponentProps<"figure">) => (
    <figure
      {...props}
      className={cn(
        "my-6 overflow-x-auto rounded-xl border border-border/60 bg-muted/50 text-[0.8125rem] leading-relaxed",
        props.className
      )}
    />
  ),
  pre: (props: React.ComponentProps<"pre">) => <pre {...props} className={cn("p-4 font-mono", props.className)} />,
  // Inline code only. A fenced block carries `language-*` and is framed by the
  // `pre` styling above; giving it inline padding would shift every line.
  code: (props: React.ComponentProps<"code">) => {
    const isBlock = typeof props.className === "string" && props.className.includes("language-")
    if (isBlock) return <code {...props} />
    return (
      <code
        {...props}
        className={cn(
          "rounded bg-muted px-1 py-0.5 font-mono text-[0.875em] before:content-none after:content-none",
          props.className
        )}
      />
    )
  },
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table {...props} className="w-full border-collapse text-sm" />
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th {...props} className="border-b border-border-strong/50 px-3 py-2 text-left font-semibold text-foreground" />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td {...props} className="border-b border-border/40 px-3 py-2 align-top text-foreground/85" />
  ),
  hr: () => <hr className="my-10 border-border/60" />,
  strong: (props: React.ComponentProps<"strong">) => <strong {...props} className="font-semibold text-foreground" />,
}

/** An article body. Async because highlighting runs here, at build time. */
export async function PostBody({ source }: { source: string }) {
  const content = await renderMarkdown(source, components)
  return <div className="max-w-2xl">{content}</div>
}

/**
 * The table of contents.
 *
 * Sticky beside the article on wide screens, a collapsed block above it on narrow
 * ones — a reader on a phone scrolls with their thumb, so a permanent sidebar
 * would only eat the measure.
 */
export function PostToc({
  entries,
  label,
  variant = "sidebar",
}: {
  entries: readonly TocEntry[]
  label: string
  variant?: "sidebar" | "inline"
}) {
  // One heading is not a table of contents.
  if (entries.length < 2) return null

  const list = (
    <ol className="space-y-1.5 border-l border-border/60">
      {entries.map((entry) => (
        <li key={entry.id} className={entry.depth === 3 ? "pl-3" : undefined}>
          <a
            href={`#${entry.id}`}
            className={cn(
              "-ml-px block border-l border-transparent py-0.5 pl-3 text-[0.8125rem] leading-snug text-muted-foreground transition-colors duration-200 hover:border-brand/60 hover:text-foreground",
              focusRing
            )}
          >
            {entry.text}
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === "inline") {
    return (
      <details className="mt-8 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 xl:hidden">
        <summary className="cursor-pointer font-mono text-xs text-muted-foreground">{label}</summary>
        <nav aria-label={label} className="mt-3">
          {list}
        </nav>
      </details>
    )
  }

  return (
    <aside className="hidden xl:block">
      <nav aria-label={label} className="sticky top-28">
        <p className="eyebrow mb-3 text-muted-foreground">{label}</p>
        {list}
      </nav>
    </aside>
  )
}
