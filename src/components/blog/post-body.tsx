import type { ArticleBlock } from "@/types/content"

/**
 * Renders article bodies.
 *
 * The body is a list of typed blocks rather than HTML or Markdown, which is what
 * keeps authoring dependency-free today and swappable later: only this renderer
 * would change if a Markdown pipeline ever lands.
 *
 * Typography follows the site: comfortable measure, generous leading, and code
 * on the monospace face with its own horizontal scroll so a long line never
 * widens the page (a classic mobile horizontal-scroll bug).
 */
export function PostBody({ blocks }: { blocks: readonly ArticleBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const key = `${block.kind}-${index}`
        switch (block.kind) {
          case "h":
            return (
              <h2
                key={key}
                className="font-heading mt-10 text-xl font-semibold tracking-tight text-balance first:mt-0"
              >
                {block.text}
              </h2>
            )
          case "p":
            return (
              <p key={key} className="text-base leading-relaxed text-pretty text-foreground/85">
                {block.text}
              </p>
            )
          case "ul":
            return (
              <ul key={key} className="space-y-2 pl-5">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="list-disc text-base leading-relaxed text-pretty text-foreground/85 marker:text-brand"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )
          case "code":
            return (
              <pre
                key={key}
                className="overflow-x-auto rounded-xl border border-border/60 bg-muted/60 p-4 font-mono text-[0.8125rem] leading-relaxed"
              >
                <code>{block.code}</code>
              </pre>
            )
          case "quote":
            return (
              <blockquote
                key={key}
                className="border-l-2 border-brand/60 pl-4 text-base leading-relaxed text-pretty text-muted-foreground"
              >
                {block.text}
              </blockquote>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
