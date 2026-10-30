import { photosLabels } from "@/config/photos-labels"
import type { AlbumStats } from "@/lib/album/stats"
import type { Locale } from "@/i18n"

/**
 * The album's head: what this page is, then the three numbers that answer it.
 *
 * The numbers come first among the content because they *are* the first answer —
 * "386 张 · 23 个城市 · 2014—2024" tells a returning visitor what changed without
 * them reading anything. Spec §8.1.
 */
export function PhotosHead({ stats, locale }: { stats: AlbumStats; locale: Locale }) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]

  const span =
    stats.minYear === null || stats.maxYear === null
      ? "—"
      : stats.minYear === stats.maxYear
        ? String(stats.minYear)
        : `${stats.minYear}—${stats.maxYear}`

  return (
    <header className="max-w-2xl">
      <p className="eyebrow text-brand">{label("eyebrow")}</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {label("title")}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
        {label("intro")}
      </p>

      {/* One line of figures, mono and quiet: they are a summary, not a hero. */}
      <dl className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
        <div className="flex items-baseline gap-1.5">
          <dd className="text-sm font-semibold text-foreground">{stats.photoCount}</dd>
          <dt>{label("count")}</dt>
        </div>
        <span aria-hidden className="text-border">·</span>
        <div className="flex items-baseline gap-1.5">
          <dd className="text-sm font-semibold text-foreground">{stats.cityCount}</dd>
          <dt>{label("cities")}</dt>
        </div>
        <span aria-hidden className="text-border">·</span>
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">{label("years")}</dt>
          <dd className="text-sm font-semibold text-foreground">{span}</dd>
        </div>
      </dl>
    </header>
  )
}
