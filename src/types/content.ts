import type { Locale } from "@/i18n/config"

/** A value that exists in every supported language. */
export type Localized<T> = Record<Locale, T>

export interface Article {
  slug: string
  title: Localized<string>
  summary: Localized<string>
  category: Localized<string>
  /** ISO calendar date, e.g. `2026-01-15`. Kept as a plain string so nothing
   *  during prerender has to read the clock. */
  publishedAt: string
  readingMinutes: number
  tags: readonly string[]
  featured?: boolean
}

export interface Project {
  slug: string
  /** Product names are not translated. */
  name: string
  summary: Localized<string>
  /** Short, concrete outcomes — what actually came out of it, not a feature list. */
  highlights: Localized<readonly string[]>
  stack: readonly string[]
  status: "active" | "archived" | "planned"
  year: number
  featured?: boolean
  repo?: string
}
