import { CalendarDays, Clock, Tag } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { getTopic, topics } from "@/config/topics"
import {
  formatArticleDate,
  formatReadingTime,
  getAllArticles,
  getArchiveByYear,
  getTopicCounts,
} from "@/data/posts"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * The article index.
 *
 * Three readings of the same list, because a slowly-grown blog is browsed three
 * ways: by topic (what it is about), by year (when), and straight down the list
 * (newest first). Topic chips are counts for now rather than links — the topic
 * routes arrive next, and a filter that does not filter is worse than none.
 */
export default async function BlogPage(props: PageProps<"/[locale]/blog">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  getDictionary(locale)

  const articles = getAllArticles()
  const archive = getArchiveByYear()
  const topicCounts = getTopicCounts()
  const label = (key: keyof typeof blogLabels) => blogLabels[key][locale]

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{label("eyebrow")}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {label("title")}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {label("intro")}
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {articles.length} {label("count")}
          <span aria-hidden className="mx-2">·</span>
          <Link
            href="/blog/archive"
            className={cn(
              "underline decoration-dotted underline-offset-2 transition-colors duration-200 hover:text-foreground",
              focusRing
            )}
          >
            {label("archiveLink")}
          </Link>
        </p>
      </header>

      <section aria-labelledby="topics" className="mt-12">
        <h2 id="topics" className="eyebrow text-muted-foreground">
          {label("topicsTitle")}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {topicCounts.map(({ topic, count }) => {
            const meta = getTopic(topic)
            return (
              <li key={topic}>
                <Link
                  href={`/blog/topic/${topic}`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-sm transition-colors duration-200 hover:border-brand/50 hover:bg-muted/60",
                    focusRing
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 rounded-full bg-current",
                      meta?.accent ?? "text-muted-foreground"
                    )}
                  />
                  <span className="font-medium">{meta?.label[locale] ?? topic}</span>
                  <span className="font-mono text-xs text-muted-foreground">{count}</span>
                </Link>
              </li>
            )
          })}
          {topicCounts.length === 0 ? (
            <li className="text-sm text-muted-foreground">{topics.length ? "—" : label("empty")}</li>
          ) : null}
        </ul>
      </section>

      <section className="mt-14 space-y-14">
        <h2 className="sr-only">{label("allTitle")}</h2>
        {archive.length === 0 ? (
          <p className="text-sm text-muted-foreground">{label("empty")}</p>
        ) : null}
        {archive.map((group) => (
          <div key={group.year}>
            {/* Year groups double as the timeline's spine; the archive page will
                hang a contribution grid off the same grouping. */}
            <div className="flex items-baseline gap-3">
              <h3 className="font-heading text-2xl font-semibold tracking-tight">{group.year}</h3>
              <span aria-hidden className="h-px flex-1 bg-border/60" />
              <span className="font-mono text-xs text-muted-foreground">
                {group.articles.length}
              </span>
            </div>
            <ul className="mt-5 divide-y divide-border/60">
              {group.articles.map((article) => {
                const topic = getTopic(article.topic)
                return (
                  <li key={article.slug} className="py-5 first:pt-0">
                    <article className="group">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays aria-hidden className="size-3.5" />
                          <time dateTime={article.publishedAt}>
                            {formatArticleDate(article.publishedAt, locale)}
                          </time>
                        </span>
                        <span aria-hidden>·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden className="size-3.5" />
                          {formatReadingTime(article.readingMinutes, locale)}
                        </span>
                        {topic ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className={cn("font-medium", topic.accent)}>
                              {topic.label[locale]}
                            </span>
                          </>
                        ) : null}
                      </div>
                      <h4 className="font-heading mt-2 text-lg font-semibold tracking-tight text-balance">
                        <Link
                          href={`/blog/${article.slug}`}
                          className={cn(
                            "transition-colors duration-200 group-hover:text-brand",
                            focusRing
                          )}
                        >
                          {article.title[locale]}
                        </Link>
                      </h4>
                      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
                        {article.summary[locale]}
                      </p>
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {article.tags.map((tag) => (
                          <li key={tag}>
                            <Link
                              href={`/blog/tag/${encodeURIComponent(tag)}`}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground transition-colors duration-200 hover:text-foreground",
                                focusRing
                              )}
                            >
                              <Tag aria-hidden className="size-2.5" />
                              {tag}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
    </Container>
  )
}
