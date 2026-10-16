import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { knowledgeDirections } from "@/data/knowledge"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"

/**
 * Knowledge base index.
 *
 * One card per direction, and no card pretends to be more than it is: the notes
 * themselves have not been written, so `hasPublishedNotes` is false everywhere
 * and every card says so instead of linking to a note route that would 404. Where
 * a direction does have a live counterpart, the footer links to the blog category
 * filter — the one route that really exists for these subjects — and the
 * directions without one stay plain, non-navigational cards.
 */
export default async function KnowledgePage(
  props: PageProps<"/[locale]/knowledge">
) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const linkClass =
    "inline-flex h-10 items-center gap-1.5 rounded-lg px-2 -mx-2 text-sm font-medium text-brand outline-none transition-colors duration-200 hover:text-brand-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={dict.pages.knowledge.title}
        subtitle={dict.pages.knowledge.subtitle}
        meta={`${dict.pages.knowledge.topicsLabel} · ${knowledgeDirections.length}`}
      />

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {knowledgeDirections.map((direction) => (
          <li key={direction.key} className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  <h2>{direction.title[resolved]}</h2>
                </CardTitle>
                <CardDescription className="leading-relaxed text-pretty">
                  {direction.summary[resolved]}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="flex items-baseline gap-1.5">
                  <span className="font-heading text-base font-semibold tabular-nums">
                    {direction.noteCount}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dict.pages.knowledge.noteCountLabel}
                  </span>
                </p>

                <ul
                  className="flex flex-wrap gap-2"
                  aria-label={dict.pages.knowledge.topicsLabel}
                >
                  {direction.topics.map((topic) => (
                    <li key={topic.title.en}>
                      <Badge variant="outline">{topic.title[resolved]}</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex-wrap justify-between gap-2">
                {direction.hasPublishedNotes ? null : (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock aria-hidden="true" className="size-3.5" />
                    {dict.pages.knowledge.planned}
                  </p>
                )}

                {direction.blogCategory ? (
                  <Link
                    href={`/blog?view=categories&category=${encodeURIComponent(direction.blogCategory)}`}
                    className={linkClass}
                  >
                    {dict.blog.title}
                    <span className="font-mono text-xs text-muted-foreground">
                      {direction.blogCategory}
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                ) : null}
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  )
}
