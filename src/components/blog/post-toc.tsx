import type { PostHeading } from "@/lib/blog"

/**
 * Table of contents for an article.
 *
 * Plain anchor links, so it works without JavaScript and every entry is
 * keyboard reachable. Rendering happens on the server from the MDX source (see
 * `getPostHeadings`), which is why the ids must match `rehype-slug`'s output.
 */
export function PostToc({
  headings,
  label,
}: {
  headings: readonly PostHeading[]
  label: string
}) {
  if (headings.length === 0) return null

  return (
    <nav
      aria-label={label}
      className="rounded-xl border border-border/60 bg-muted/40 p-4"
    >
      <p className="eyebrow text-muted-foreground">{label}</p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : undefined}>
            <a
              href={`#${heading.id}`}
              className="block rounded-sm text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
