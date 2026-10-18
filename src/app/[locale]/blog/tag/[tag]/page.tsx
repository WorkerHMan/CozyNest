import { ArrowLeft, CalendarDays } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { getTopic } from "@/config/topics"
import { formatArticleDate, getArticlesByTag, getTagCounts } from "@/data/posts"
import { defaultLocale, isLocale, locales } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Tag pages.
 *
 * Tags are authored strings, including Chinese ones, so the segment can arrive
 * either decoded or still percent-encoded — it depends on whether the proxy
 * rewrite or the router normalised it first. Decoding defensively means the
 * lookup works in both cases; a tag with no `%` sequences is returned unchanged.
 */
function decodeTag(tag: string): string {
  try {
    return decodeURIComponent(tag)
  } catch {
    return tag
  }
}

export function generateStaticParams() {
  const tags = getTagCounts().map(({ tag }) => tag)
  return locales.flatMap((locale) => tags.map((tag) => ({ locale, tag })))
}

export default async function TagPage(props: PageProps<"/[locale]/blog/tag/[tag]">) {
  const { locale: rawLocale, tag: rawTag } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const tag = decodeTag(rawTag)
  const articles = getArticlesByTag(tag)
  if (articles.length === 0) notFound()

  const label = (key: keyof typeof blogLabels) => blogLabels[key][locale]

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
        {label("backToBlog")}
      </Link>

      <header className="mt-8 max-w-2xl">
        <p className="eyebrow font-mono text-brand">{label("tagEyebrow")}</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {tag}
        </h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {articles.length} {label("totalThisYear")}
        </p>
      </header>

      <ul className="mt-10 max-w-2xl divide-y divide-border/60">
        {articles.map((article) => {
          const topic = getTopic(article.topic)
          return (
            <li key={article.slug} className="py-5 first:pt-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="size-3.5" />
                  <time dateTime={article.publishedAt}>
                    {formatArticleDate(article.publishedAt, locale)}
                  </time>
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
              <h2 className="font-heading mt-2 text-lg font-semibold tracking-tight text-balance">
                <Link href={`/blog/${article.slug}`} className={cn("hover:text-brand", focusRing)}>
                  {article.title[locale]}
                </Link>
              </h2>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}
