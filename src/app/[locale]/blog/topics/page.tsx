import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { topics } from "@/config/topics"
import { getArticlesByTopic } from "@/data/posts"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const copy = {
  eyebrow: { zh: "分类", en: "Topics" },
  title: { zh: "按技术分类", en: "By topic" },
  intro: {
    zh: "每个技术点是一个粗粒度的轴：一篇文章只归一个技术点，更细的划分交给标签。",
    en: "Each topic is a coarse axis — one topic per article, with tags for the finer grain.",
  },
  count: { zh: "篇文章", en: "articles" },
  empty: { zh: "还没有文章", en: "No articles yet" },
}

/**
 * 分类 — the topic index the nav's dropdown jumps to.
 *
 * Counts come from `getArticlesByTopic()`, so the numbers and the topic pages can
 * never disagree; a hard-coded count would drift the first time an article moves.
 *
 * Static: the data is read at build time and nothing here touches the clock.
 */
export default async function BlogTopicsPage(props: PageProps<"/[locale]/blog/topics">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const rows = topics.map((topic) => ({
    topic,
    count: getArticlesByTopic(topic.id).length,
  }))

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

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {rows.map(({ topic, count }) => (
          <li key={topic.id}>
            <Link
              href={`/blog/topic/${topic.id}`}
              className={cn(
                "group flex h-full flex-col rounded-2xl border border-border/60 p-5 transition-colors duration-200 hover:border-brand/40",
                focusRing
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className={cn("font-heading text-lg font-semibold", topic.accent)}>
                  {topic.label[locale]}
                </span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {count} {copy.count[locale]}
                </span>
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                {topic.blurb[locale]}
              </span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-brand">
                {count > 0 ? blogLabels.allTitle[locale] : copy.empty[locale]}
                <ArrowRight
                  aria-hidden
                  className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
