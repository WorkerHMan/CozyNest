import { PostCard } from "@/components/blog/post-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { getFeaturedArticles } from "@/data/posts"
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
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => (
            <li key={article.slug}>
              <PostCard article={article} locale={locale} />
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
