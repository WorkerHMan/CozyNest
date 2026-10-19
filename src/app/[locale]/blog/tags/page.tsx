import Link from "next/link"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { getTagCounts } from "@/data/posts"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const copy = {
  eyebrow: { zh: "标签", en: "Tags" },
  title: { zh: "全部标签", en: "All tags" },
  intro: {
    zh: "标签是细粒度的线索：同一个问题在不同技术点下都可能出现。数字是带这个标签的文章数。",
    en: "Tags are the fine grain — the same problem shows up under different topics. The number is how many articles carry it.",
  },
  posts: { zh: "篇", en: "posts" },
  empty: { zh: "还没有标签。", en: "No tags yet." },
}

/**
 * 标签 — the tag index the nav's dropdown jumps to.
 *
 * Sorted by frequency, then alphabetically, because the useful order for a tag
 * cloud is "what do I write about most", not the order they were added.
 *
 * Every link goes through `encodeURIComponent`: CJK tags such as `时钟` must be
 * percent-encoded or the route 404s.
 */
export default async function BlogTagsPage(props: PageProps<"/[locale]/blog/tags">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const tags = getTagCounts()
  const max = Math.max(1, ...tags.map((entry) => entry.count))

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{copy.eyebrow[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {copy.intro[locale]}
        </p>
      </header>

      {tags.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{copy.empty[locale]}</p>
      ) : (
        <ul className="mt-10 flex flex-wrap gap-2">
          {tags.map((entry) => {
            /* Text size follows frequency, but only across three steps: a real
               cloud with a dozen sizes is unreadable, not informative. */
            const weight = entry.count === max ? 1 : entry.count * 2 >= max ? 0.75 : 0.5
            return (
              <li key={entry.tag}>
                <Link
                  href={`/blog/tag/${encodeURIComponent(entry.tag)}`}
                  className={cn(
                    "inline-flex items-baseline gap-1.5 rounded-full border border-border/60 px-3 py-1.5 transition-colors duration-200 hover:border-brand/50 hover:text-foreground",
                    focusRing,
                    weight === 1 ? "text-base" : weight === 0.75 ? "text-sm" : "text-xs",
                    weight === 1 ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {entry.tag}
                  <span className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
                    {entry.count} {copy.posts[locale]}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      <Link
        href="/blog"
        className={cn(
          "mt-10 inline-flex text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground",
          focusRing
        )}
      >
        {blogLabels.backToBlog[locale]}
      </Link>
    </Container>
  )
}
