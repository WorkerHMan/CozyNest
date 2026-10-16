import { Star } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { MagneticField } from "@/components/common/magnetic-field"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { board, type BoardEntry } from "@/data/board"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import type { Dictionary, Locale } from "@/i18n"

/**
 * Anime board.
 *
 * The magnetic field lives here rather than on the home page, so each screen
 * keeps a single focal motion (the home page's is now the WebGL stage).
 */
function BoardCard({
  entry,
  locale,
  dict,
}: {
  entry: BoardEntry
  locale: Locale
  dict: Dictionary
}) {
  const percent = Math.round((entry.watched / entry.episodes) * 100)
  const labels = dict.pages.board

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <CardTitle className="text-balance">{entry.title[locale]}</CardTitle>
          <span className="font-mono text-xs text-muted-foreground">
            {entry.year}
          </span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star aria-hidden className="size-3.5 text-brand" />
          <span>
            {labels.ratingLabel} {entry.rating}/10
          </span>
          <span aria-hidden>·</span>
          <span>
            {entry.watched}/{entry.episodes} {labels.episodeLabel}
          </span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress
          value={percent}
          aria-label={`${entry.title[locale]} ${entry.watched}/${entry.episodes}`}
        />
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {entry.note[locale]}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline">{tag}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const labels = dict.pages.board

  const watching = board.filter((entry) => entry.status === "watching")
  const finished = board.filter((entry) => entry.status === "finished")

  const sections = [
    { key: "watching", heading: labels.watchingLabel, entries: watching },
    { key: "finished", heading: labels.finishedLabel, entries: finished },
  ]

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        meta={`${board.length} ${labels.countLabel}`}
      />

      <div className="relative mt-8 h-56 overflow-hidden rounded-2xl border border-border/60 bg-card/40 sm:h-64">
        <MagneticField />
      </div>

      {board.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="mt-10 space-y-10">
          {sections.map((section) =>
            section.entries.length === 0 ? null : (
              <section key={section.key} className="space-y-4">
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {section.heading}
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.entries.map((entry) => (
                    <li key={entry.id}>
                      <BoardCard entry={entry} locale={resolved} dict={dict} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          )}
        </div>
      )}
    </Container>
  )
}
