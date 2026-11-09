import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import type { Article, Localized } from "@/types/content"
import type { Locale } from "@/i18n/config"

/**
 * The blog's content store.
 *
 * ## Articles are MDX files now
 *
 * Each post is one file in `content/posts/<slug>.mdx`, with front matter carrying
 * the metadata and the body written as Markdown. The previous store was a typed
 * array of blocks in this file: safe, but every post had to be escaped into a
 * string literal and there was nowhere to put a table, a link or a highlighted
 * code block without inventing a block kind.
 *
 * ## What did not change
 *
 * Everything below the loader — the index, topic pages, tag pages, the year
 * archive, the home page's featured strip — reads the same functions it always
 * did. The store changed; its contract did not.
 *
 * ## Adding a post
 *
 * Drop a new `.mdx` file in `content/posts/`. The filename is the slug and
 * therefore the URL. `topic` must match an id in `config/topics.ts`.
 */
const CONTENT_DIR = path.join(process.cwd(), "content", "posts")

interface FrontMatter {
  title: Localized<string>
  summary: Localized<string>
  category: Localized<string>
  topic: string
  publishedAt: string
  readingMinutes: number
  tags?: string[]
  cover?: string
  featured?: boolean
}

function loadArticles(): readonly Article[] {
  const files = readdirSync(CONTENT_DIR).filter((name) => name.endsWith(".mdx"))

  const loaded = files.map((name) => {
    const raw = readFileSync(path.join(CONTENT_DIR, name), "utf8")
    const { data, content } = matter(raw)
    const front = data as FrontMatter
    const body = content.trim()

    // `body` is `undefined` rather than an empty string when a post is published
    // as a stub, because that is the difference between "no body yet" and "a body
    // that renders to nothing".
    return {
      ...front,
      slug: name.replace(/\.mdx$/, ""),
      tags: front.tags ?? [],
      ...(body ? { body } : {}),
    } as Article
  })

  /** Newest first. Ties break on slug so the order is stable across builds. */
  return loaded.sort((a, b) => {
    if (a.publishedAt === b.publishedAt) return a.slug.localeCompare(b.slug)
    return a.publishedAt < b.publishedAt ? 1 : -1
  })
}

export const articles: readonly Article[] = loadArticles()

export function getAllArticles(): readonly Article[] {
  return articles
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug)
}

export function getFeaturedArticles(limit = 3): readonly Article[] {
  return articles.filter((article) => article.featured).slice(0, limit)
}

export function getArticlesByTopic(topic: string): readonly Article[] {
  return articles.filter((article) => article.topic === topic)
}

export function getArticlesByTag(tag: string): readonly Article[] {
  return articles.filter((article) => article.tags.includes(tag))
}

/** Every topic that currently has at least one article, with its count. */
export function getTopicCounts(): readonly { topic: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const article of articles) {
    counts.set(article.topic, (counts.get(article.topic) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))
}

export function getTagCounts(): readonly { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const article of articles) {
    for (const tag of article.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

/**
 * Articles grouped by year, newest year first.
 *
 * Built for the archive timeline: the group order and the in-group order are both
 * fixed here, so the page never has to sort during prerender.
 */
export function getArchiveByYear(): readonly { year: string; articles: readonly Article[] }[] {
  const groups = new Map<string, Article[]>()
  for (const article of articles) {
    const year = article.publishedAt.slice(0, 4)
    const bucket = groups.get(year)
    if (bucket) bucket.push(article)
    else groups.set(year, [article])
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, list]) => ({ year, articles: list }))
}

export function formatArticleDate(isoDate: string, locale: Locale): string {
  // Parsing a fixed ISO string and formatting with an explicit time zone keeps
  // prerendering deterministic and free of any clock read.
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`))
}

/** `12` → `12 min` / `12 分钟`. */
export function formatReadingTime(minutes: number, locale: Locale): string {
  return locale === "zh" ? `${minutes} 分钟` : `${minutes} min`
}

export type { Article, Localized }
