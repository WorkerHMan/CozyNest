import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { defaultLocale, locales, type Locale } from "@/i18n/config"

/**
 * The blog content library.
 *
 * Articles are MDX files on disk at `content/blog/<locale>/<slug>.mdx` with YAML
 * frontmatter. Two deliberate choices:
 *
 *  - **Metadata is read with `gray-matter`, not by importing the MDX.** The docs
 *    bless reading a content directory with `fs` server-side to build an index;
 *    doing it this way means listing the blog never compiles a single article
 *    body.
 *  - **One file per locale with fallback.** A slug present only in the default
 *    locale still renders for other locales (flagged as a fallback), so a
 *    half-translated blog is still navigable instead of 404ing.
 *
 * Everything here runs on the server only; it is imported exclusively from
 * Server Components and `generateStaticParams`.
 */

const contentRoot = path.join(process.cwd(), "content", "blog")

export interface PostMeta {
  slug: string
  title: string
  summary: string
  category: string
  tags: readonly string[]
  /** ISO calendar date, `YYYY-MM-DD`. */
  publishedAt: string
  readingMinutes: number
  featured: boolean
}

export interface PostEntry extends PostMeta {
  /** The locale whose file was actually used (may differ from the request). */
  sourceLocale: Locale
  /** True when the requested locale had no file and the default was used. */
  isFallback: boolean
}

function dirOf(locale: Locale): string {
  return path.join(contentRoot, locale)
}

/** Slugs present in any locale, so a partially translated blog stays complete. */
function allSlugs(): string[] {
  const found = new Set<string>()
  for (const locale of locales) {
    const dir = dirOf(locale)
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".mdx")) found.add(file.replace(/\.mdx$/, ""))
    }
  }
  return [...found].sort()
}

function readMeta(locale: Locale, slug: string): PostMeta | null {
  const file = path.join(dirOf(locale), `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const { data } = matter(fs.readFileSync(file, "utf8"))

  // Frontmatter is authored by hand, so every field is validated rather than
  // trusted: a typo should fail loudly at build time, not render "undefined".
  if (typeof data.title !== "string" || data.title.trim() === "") {
    throw new Error(`content/blog/${locale}/${slug}.mdx: frontmatter "title" is required`)
  }
  if (typeof data.publishedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.publishedAt)) {
    throw new Error(
      `content/blog/${locale}/${slug}.mdx: frontmatter "publishedAt" must be an ISO date (YYYY-MM-DD)`
    )
  }

  return {
    slug,
    title: data.title,
    summary: typeof data.summary === "string" ? data.summary : "",
    category: typeof data.category === "string" ? data.category : "Uncategorised",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    publishedAt: data.publishedAt,
    readingMinutes:
      typeof data.readingMinutes === "number" ? data.readingMinutes : 5,
    featured: data.featured === true,
  }
}

/** Resolves one slug for a locale, falling back to the default locale. */
export function getPostMeta(locale: Locale, slug: string): PostEntry | null {
  const local = readMeta(locale, slug)
  if (local) return { ...local, sourceLocale: locale, isFallback: false }

  const fallback = readMeta(defaultLocale, slug)
  if (fallback) {
    return { ...fallback, sourceLocale: defaultLocale, isFallback: true }
  }
  return null
}

/** Every article for a locale, newest first. */
export function listPosts(locale: Locale): PostEntry[] {
  return allSlugs()
    .map((slug) => getPostMeta(locale, slug))
    .filter((post): post is PostEntry => post !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function getFeaturedPosts(locale: Locale, limit = 3): PostEntry[] {
  const featured = listPosts(locale).filter((post) => post.featured)
  // Fall back to the newest posts so the section is never empty.
  return (featured.length > 0 ? featured : listPosts(locale)).slice(0, limit)
}

export function getCategories(locale: Locale): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of listPosts(locale)) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export function getTags(locale: Locale): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of listPosts(locale)) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/**
 * Post counts per calendar day, for the activity grid.
 *
 * The grid's range is derived from these dates rather than from "today": reading
 * the clock during prerender is a build error under `cacheComponents`.
 */
export function getActivityDays(locale: Locale): { date: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const post of listPosts(locale)) {
    counts.set(post.publishedAt, (counts.get(post.publishedAt) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface PostHeading {
  level: 2 | 3
  text: string
  id: string
}

/**
 * Reproduces the ids `rehype-slug` (github-slugger) generates for the heading
 * shapes used here: lowercase, punctuation dropped, each whitespace run turned
 * into a single dash, and non-Latin letters (CJK) preserved. Verified against
 * the rendered output — `AHB / APB 分频` → `ahb--apb-分频`.
 *
 * Known limitation: github-slugger appends `-1`, `-2`… for repeated headings;
 * this does not, so two identically-titled headings would share an anchor.
 */
function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-")
}

/**
 * Headings for the table of contents, read from the MDX source.
 *
 * Extracting them here rather than parsing the rendered tree keeps the article
 * page a plain Server Component; code fences are skipped so a `## ` inside a
 * shell snippet never becomes a TOC entry.
 */
export function getPostHeadings(
  sourceLocale: Locale,
  slug: string
): PostHeading[] {
  const file = path.join(dirOf(sourceLocale), `${slug}.mdx`)
  if (!fs.existsSync(file)) return []

  const body = matter(fs.readFileSync(file, "utf8")).content
  const headings: PostHeading[] = []
  let inFence = false

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue
    const text = match[2].replace(/[*_`]/g, "")
    headings.push({
      level: match[1].length as 2 | 3,
      text,
      id: slugifyHeading(text),
    })
  }
  return headings
}

export function postHref(locale: Locale, slug: string): string {
  return `/blog/${slug}`
}

/**
 * Re-exported so server callers keep a single import site. The implementation
 * lives in an fs-free module because Client Components need it too (see the
 * note in `post-format.ts`).
 */
export { formatPostDate } from "./post-format"
