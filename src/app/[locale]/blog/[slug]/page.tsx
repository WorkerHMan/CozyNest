import { ArrowLeft, CalendarDays, Clock, Tag } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PostBody, PostToc } from "@/features/blog/post-body"
import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { getTopic } from "@/config/topics"
import {
  formatArticleDate,
  formatReadingTime,
  getAllArticles,
  getArticleBySlug,
} from "@/data/posts"
import { defaultLocale, isLocale, locales } from "@/i18n"
import { slugifyHeadings } from "@/lib/mdx"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Every locale × slug is prerendered: the store is a static module, so the set is
 * known at build time and no request ever has to resolve a slug at runtime.
 */
export function generateStaticParams() {
  const slugs = getAllArticles().map((article) => article.slug)
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

/**
 * Compiling MDX counts as request-time work to Next 16's prerender validator —
 * it cannot prove the await resolves before the first byte. There is nothing to
 * stream here: the body is the page, and a reader would only see a spinner where
 * the article should be. So this route declares itself blocking, which is what
 * the validator's `[block]` option is for.
 */
export const instant = false

export default async function ArticlePage(props: PageProps<"/[locale]/blog/[slug]">) {
  const { locale: rawLocale, slug } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const topic = getTopic(article.topic)
  const label = (key: keyof typeof blogLabels) => blogLabels[key][locale]
  // Computed from the MDX source with the same slugger `rehype-slug` uses, so
  // every link lands on the heading it names.
  const toc = article.body ? slugifyHeadings(article.body) : []

  return (
    <Container className="py-16 sm:py-20">
      <Link
        href="/blog"
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
          focusRing
        )}
      >
        <ArrowLeft aria-hidden className="size-4" />
        {label("backToList")}
      </Link>

      <div className="mt-8 xl:grid xl:grid-cols-[minmax(0,42rem)_14rem] xl:items-start xl:gap-12">
        <article className="max-w-2xl min-w-0">
        <header>
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
                <span className={cn("font-medium", topic.accent)}>{topic.label[locale]}</span>
              </>
            ) : null}
          </div>

          <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {article.title[locale]}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
            {article.summary[locale]}
          </p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground"
              >
                <Tag aria-hidden className="size-2.5" />
                {tag}
              </li>
            ))}
          </ul>
        </header>

        <PostToc entries={toc} label={label("toc")} variant="inline" />

        <div className="mt-10">
          {article.body ? (
            <PostBody source={article.body} />
          ) : (
            <p className="text-sm text-muted-foreground">{label("bodyMissing")}</p>
          )}
        </div>

        {/* Bodies are written in Chinese for now; saying so beats silently
            showing the wrong language to an English reader. */}
        {locale === "en" ? (
          <p className="mt-10 border-t border-border/60 pt-4 font-mono text-xs text-muted-foreground">
            {label("articleOnlyZh")}
          </p>
        ) : null}
      </article>

        <PostToc entries={toc} label={label("toc")} variant="sidebar" />
      </div>
    </Container>
  )
}
