import { ArrowLeft, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { formatArticleDate, formatReadingTime, getFeaturedArticles } from "@/data/posts"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const copy = {
  intro: {
    zh: "我认为最值得先读的几篇：问题驱动、有结论，踩过的坑也写清楚了。",
    en: "The ones I would read first: problem-driven, with conclusions, and the dead ends written down.",
  },
  empty: { zh: "还没有标记精选的文章。", en: "Nothing is marked featured yet." },
}

/**
 * 精选文章 — a real route, not an anchor into `/blog`.
 *
 * The nav menu links here, and a menu entry should land on something with a
 * beginning and an end; dropping the reader into the middle of a long list is
 * not a destination.
 *
 * Fully static: `getFeaturedArticles()` reads the content data, so nothing here
 * touches the clock or the request.
 */
export default async function FeaturedPage(props: PageProps<"/[locale]/blog/featured">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  const featured = getFeaturedArticles()

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{blogLabels.featuredTitle[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {blogLabels.featuredTitle[locale]}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {copy.intro[locale]}
        </p>
      </header>

      {featured.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{copy.empty[locale]}</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {featured.map((article) => (
            <li
              key={article.slug}
              className="rounded-2xl border border-border/60 p-5 transition-colors duration-200 hover:border-brand/40"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-brand">
                  <Sparkles aria-hidden className="size-3" />
                  {article.topic}
                </span>
                <span>{formatArticleDate(article.publishedAt, locale)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden className="size-3" />
                  {formatReadingTime(article.readingMinutes, locale)}
                </span>
              </div>

              <h2 className="font-heading mt-2 text-xl font-semibold tracking-tight text-balance">
                <Link href={`/blog/${article.slug}`} className={cn("hover:text-brand", focusRing)}>
                  {article.title[locale]}
                </Link>
              </h2>

              {article.summary ? (
                <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                  {article.summary[locale]}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/blog"
        className={cn(
          "mt-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
          focusRing
        )}
      >
        <ArrowLeft aria-hidden className="size-4" />
        {blogLabels.backToBlog[locale]}
      </Link>
    </Container>
  )
}
