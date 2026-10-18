import type { Locale } from "@/i18n/config"

/** A value that exists in every supported language. */
export type Localized<T> = Record<Locale, T>

/**
 * One block of article body.
 *
 * Bodies are blocks rather than Markdown strings: the project has no MDX pipeline
 * yet, and a block list keeps authoring dependency-free while staying swappable —
 * when Markdown support lands, only the renderer changes, not the content.
 */
export type ArticleBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: readonly string[] }
  | { kind: "code"; lang?: string; code: string }
  | { kind: "quote"; text: string }

export interface Article {
  slug: string
  title: Localized<string>
  summary: Localized<string>
  category: Localized<string>
  /** Topic id from `config/topics.ts`; the coarse axis the star map reads. */
  topic: string
  /** ISO calendar date, e.g. `2026-01-15`. Kept as a plain string so nothing
   *  during prerender has to read the clock. */
  publishedAt: string
  readingMinutes: number
  tags: readonly string[]
  featured?: boolean
  /** Absent while a stub is published but its body is not written yet. */
  body?: readonly ArticleBlock[]
}

export interface Project {
  slug: string
  /** Product names are not translated. */
  name: string
  summary: Localized<string>
  stack: readonly string[]
  status: "active" | "archived" | "planned"
  year: number
  featured?: boolean
}
