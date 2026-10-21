import { Container } from "@/components/layout/container"
import { RandomStage } from "@/components/blog/random-stage"
import { articles, formatArticleDate } from "@/data/posts"
import { defaultLocale, isLocale } from "@/i18n"
import { getTopic } from "@/config/topics"

const copy = {
  eyebrow: { zh: "随机文章", en: "Random article" },
  title: { zh: "随便逛逛", en: "Take a wander" },
  intro: {
    zh: "把文章摊开在一个转盘上，转到哪篇读哪篇。",
    en: "The posts laid out on a ring — read whichever one stops in front.",
  },
}

/**
 * 随机文章 — a 3D ring of article cards.
 *
 * The rotation and the picking are both client-side (they are interaction state),
 * so this page stays a Server Component: it only hands the article data over.
 *
 * `formatArticleDate` runs here rather than in the client component so the dates
 * are formatted once, on the server, and never depend on the visitor's clock.
 */
export default async function RandomArticlePage(props: PageProps<"/[locale]/blog/random">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const items = articles.map((article) => ({
    slug: article.slug,
    title: article.title[locale],
    summary: article.summary[locale],
    topic: getTopic(article.topic)?.label[locale] ?? article.topic,
    date: formatArticleDate(article.publishedAt, locale),
    cover: article.cover,
  }))

  return (
    <Container className="py-14 sm:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow justify-center text-brand">{copy.eyebrow[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
          {copy.intro[locale]}
        </p>
      </header>

      <div className="mt-10">
        <RandomStage items={items} locale={locale} />
      </div>
    </Container>
  )
}
