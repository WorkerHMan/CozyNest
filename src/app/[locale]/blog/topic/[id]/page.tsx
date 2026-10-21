import { PostCard } from "@/components/blog/post-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { blogLabels } from "@/config/blog-labels"
import { getTopic, topics } from "@/config/topics"
import { getArticlesByTopic } from "@/data/posts"
import { defaultLocale, isLocale, locales } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** Only topics that actually have articles, so no page is generated empty. */
export function generateStaticParams() {
  const used = topics
    .filter((topic) => getArticlesByTopic(topic.id).length > 0)
    .map((topic) => topic.id)
  return locales.flatMap((locale) => used.map((id) => ({ locale, id })))
}

export default async function TopicPage(props: PageProps<"/[locale]/blog/topic/[id]">) {
  const { locale: rawLocale, id } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const topic = getTopic(id)
  if (!topic) notFound()

  const articles = getArticlesByTopic(id)
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
        <p className={cn("eyebrow font-mono", topic.accent)}>{label("topicEyebrow")}</p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {topic.label[locale]}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground">
          {topic.blurb[locale]}
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {articles.length} {label("totalThisYear")}
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{label("noPosts")}</p>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <PostCard article={article} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
