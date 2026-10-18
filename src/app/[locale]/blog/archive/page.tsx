import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { ContributionGrid } from "@/components/blog/contribution-grid"
import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { formatArticleDate, getArchiveByYear } from "@/data/posts"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * The archive: a density grid on top, the dated list below.
 *
 * The grid and the list read from the same `getArchiveByYear()` grouping, so a
 * new article shows up in both without touching this file.
 *
 * Month names come from a fixed `Date.UTC(2026, m, 1)` rather than from today:
 * formatting the current month would read the clock during prerender, which the
 * cache-components rules forbid.
 */
export default async function ArchivePage(props: PageProps<"/[locale]/blog/archive">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const archive = getArchiveByYear()
  const label = (key: keyof typeof blogLabels) => blogLabels[key][locale]

  const monthName = (month: number) =>
    new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2026, month - 1, 1)))

  const years = archive.map(({ year, articles }) => {
    const months = Array.from({ length: 12 }, () => 0)
    for (const article of articles) {
      const month = Number(article.publishedAt.slice(5, 7))
      if (month >= 1 && month <= 12) months[month - 1] += 1
    }
    return { year, months }
  })

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
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {label("archiveTitle")}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground">
          {label("archiveIntro")}
        </p>
      </header>

      <section aria-label={label("archiveTitle")} className="mt-10 max-w-2xl">
        <ContributionGrid
          years={years}
          monthLabel={monthName}
          countLabel={(count) =>
            locale === "zh" ? `${count} 篇` : count === 1 ? "1 post" : `${count} posts`
          }
        />
      </section>

      <section className="mt-14 max-w-2xl space-y-10">
        {archive.map((group) => (
          <div key={group.year}>
            <div className="flex items-baseline gap-3">
              <h2 className="font-heading text-xl font-semibold tracking-tight">{group.year}</h2>
              <span aria-hidden className="h-px flex-1 bg-border/60" />
              <span className="font-mono text-xs text-muted-foreground">
                {group.articles.length}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {group.articles.map((article) => (
                <li key={article.slug} className="flex items-baseline gap-3">
                  <time
                    dateTime={article.publishedAt}
                    className="shrink-0 font-mono text-xs text-muted-foreground"
                  >
                    {formatArticleDate(article.publishedAt, locale)}
                  </time>
                  <Link
                    href={`/blog/${article.slug}`}
                    className={cn(
                      "text-sm transition-colors duration-200 hover:text-brand",
                      focusRing
                    )}
                  >
                    {article.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </Container>
  )
}
