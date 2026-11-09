import GithubSlugger from "github-slugger"

/** One line of the table of contents. */
export interface TocEntry {
  id: string
  text: string
  /** 2 for `##`, 3 for `###`. Deeper levels are not listed. */
  depth: number
}

/**
 * Headings of an MDX document, with the ids `rehype-slug` will give them.
 *
 * ## Why this is a regex and not a parse
 *
 * The ids have to match what the renderer produces, and `rehype-slug` derives
 * them from the heading text with `github-slugger`. Running the same slugger over
 * the same strings, in document order, yields the same ids — including the `-1`
 * suffix for a repeated heading. A full MDX parse here would only add a second
 * copy of the pipeline that could drift from the first.
 *
 * Fenced blocks are skipped: a `## ` inside a shell example is a comment, not a
 * heading.
 */
export function slugifyHeadings(source: string): TocEntry[] {
  const slugger = new GithubSlugger()
  const entries: TocEntry[] = []
  let inFence = false
  let fenceMarker = ""

  for (const line of source.split("\n")) {
    const fence = /^\s*(```+|~~~+)/.exec(line)
    if (fence) {
      if (!inFence) {
        inFence = true
        fenceMarker = fence[1][0]
      } else if (fence[1][0] === fenceMarker) {
        inFence = false
      }
      continue
    }
    if (inFence) continue

    const heading = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!heading) continue

    // Strip inline Markdown the heading might carry; the slugger sees text, not
    // syntax, and so should the label.
    const text = heading[2].replace(/`/g, "").replace(/\*\*/g, "").trim()
    entries.push({ id: slugger.slug(text), text, depth: heading[1].length })
  }

  return entries
}
