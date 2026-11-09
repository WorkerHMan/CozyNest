import type { Locale } from "@/i18n/config"

/** A value that exists in every supported language. */
export type Localized<T> = Record<Locale, T>

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
  /**
   * Card artwork. Optional: when absent, components draw a deterministic gradient
   * from the slug instead of a broken image. The files currently come from
   * `public/hero/` — the same set the cover carousel uses — so the cards carry
   * real photography until purpose-made covers exist.
   */
  cover?: string
  /**
   * The article body as MDX source, straight from `content/posts/<slug>.mdx`.
   *
   * It is source, not HTML: rendering happens in `PostBody`, at build time. Absent
   * while a stub is published but its body is not written yet — which is different
   * from a body that renders to nothing.
   */
  body?: string
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
