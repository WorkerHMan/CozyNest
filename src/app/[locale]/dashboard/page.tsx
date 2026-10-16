import { FileText, FolderGit2, Image, Info, Notebook } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent } from "@/components/ui/card"
import { dashboardPlaceholderCounts } from "@/data/knowledge"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { getCategories, listPosts } from "@/lib/blog"

/**
 * Site statistics.
 *
 * Both charts are plain CSS (`div` widths in percent) — no charting library — and
 * both follow the design system's chart rule: a bar never carries information by
 * colour alone. Each row shows the numeric value in text next to the bar, and the
 * bar itself is `role="img"` with the value spelled out in its accessible name,
 * so the numbers survive a screen reader and a greyscale print alike.
 *
 * The only "real" number here is the article count: it comes from the content
 * library. Projects / notes / photos are build-time placeholders (see
 * `dashboardPlaceholderCounts`) because the modules that own them are still being
 * written, and `dict.pages.dashboard.buildTimeNote` tells the visitor that the
 * runtime-style numbers need a backend. Nothing reads the clock: every date is a
 * fixed string from the content, which `cacheComponents` requires.
 */
export default async function DashboardPage(
  props: PageProps<"/[locale]/dashboard">
) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const posts = listPosts(resolved)
  const categories = getCategories(resolved)
  /** The unit both charts count in, used in the legend and the bar labels. */
  const unit = dict.blog.resultsSuffix

  const months = Object.entries(
    posts.reduce<Record<string, number>>((groups, post) => {
      const month = post.publishedAt.slice(0, 7)
      groups[month] = (groups[month] ?? 0) + 1
      return groups
    }, {})
  )
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const maxMonthCount = months.reduce((max, item) => Math.max(max, item.count), 0)
  const maxCategoryCount = categories.reduce(
    (max, item) => Math.max(max, item.count),
    0
  )

  const stats = [
    {
      key: "articles",
      value: posts.length,
      label: dict.pages.dashboard.statArticles,
      Icon: FileText,
    },
    {
      key: "projects",
      value: dashboardPlaceholderCounts.projects,
      label: dict.pages.dashboard.statProjects,
      Icon: FolderGit2,
    },
    {
      key: "notes",
      value: dashboardPlaceholderCounts.notes,
      label: dict.pages.dashboard.statNotes,
      Icon: Notebook,
    },
    {
      key: "photos",
      value: dashboardPlaceholderCounts.photos,
      label: dict.pages.dashboard.statPhotos,
      Icon: Image,
    },
  ]

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={dict.pages.dashboard.title}
        subtitle={dict.pages.dashboard.subtitle}
        meta={`${dict.blog.resultsPrefix} ${posts.length} ${dict.blog.resultsSuffix}`}
      />

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ key, value, label, Icon }) => (
          <li key={key}>
            <Card size="sm" className="h-full">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-2xl font-semibold tabular-nums">
                    {value}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {label}
                  </span>
                </span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-10 space-y-10">
        <figure className="space-y-4">
          <figcaption className="space-y-1">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {dict.pages.dashboard.trendTitle}
            </h2>
            <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-2 w-4 shrink-0 rounded-full bg-brand"
              />
              {unit}
            </p>
          </figcaption>

          <Card>
            <CardContent>
              {months.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dict.blog.heatmapEmpty}
                </p>
              ) : (
                <ul className="space-y-2">
                  {months.map(({ month, count }) => (
                    <BarRow
                      key={month}
                      label={month}
                      value={count}
                      max={maxMonthCount}
                      unit={unit}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </figure>

        <figure className="space-y-4">
          <figcaption className="space-y-1">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              {dict.pages.dashboard.categoriesTitle}
            </h2>
            <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="h-2 w-4 shrink-0 rounded-full bg-brand"
              />
              {unit}
            </p>
          </figcaption>

          <Card>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dict.blog.heatmapEmpty}
                </p>
              ) : (
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <BarRow
                      key={category.name}
                      label={category.name}
                      value={category.count}
                      max={maxCategoryCount}
                      unit={unit}
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </figure>
      </div>

      <aside className="mt-10 flex gap-3 rounded-xl border border-border bg-card p-4">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
        <div className="space-y-1">
          <h2 className="font-heading text-sm font-semibold">
            {dict.pages.dashboard.noteLabel}
          </h2>
          <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
            {dict.pages.dashboard.buildTimeNote}
          </p>
        </div>
      </aside>
    </Container>
  )
}

/**
 * One horizontal bar: visible label, visible value, and a bar whose accessible
 * name repeats the pair — so the chart is readable with the colour gone and with
 * the pixels gone.
 */
function BarRow({
  label,
  value,
  max,
  unit,
}: {
  label: string
  value: number
  max: number
  unit: string
}) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <li className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 sm:grid-cols-[8rem_1fr_2.5rem]">
      <span className="truncate font-mono text-xs text-muted-foreground">
        {label}
      </span>
      <span
        role="img"
        aria-label={`${label}: ${value} ${unit}`}
        className="block h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <span
          aria-hidden="true"
          className="block h-full rounded-full bg-brand"
          style={{
            width: `${percent}%`,
            minWidth: value > 0 ? "0.375rem" : undefined,
          }}
        />
      </span>
      <span className="text-right font-mono text-xs tabular-nums">{value}</span>
    </li>
  )
}
