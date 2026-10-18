import { cn } from "@/lib/utils"

/**
 * A year-by-month contribution grid.
 *
 * ## Why months, not days
 *
 * GitHub's graph is 53 weeks × 7 days. On a blog that grows slowly that grid is
 * 371 cells with four of them lit, which reads as broken rather than sparse. A
 * month is the smallest unit where the chart says something true at this size,
 * and it stays legible as the archive fills up.
 *
 * ## Why the data is passed in
 *
 * Nothing here reads the clock. The years, the month buckets and the maximum are
 * all computed from the articles in the page, so the grid is identical on every
 * build and cannot trip the prerender-time clock rule.
 */
export interface ContributionYear {
  year: string
  /** 12 entries, January first, each holding that month's article count. */
  months: readonly number[]
}

const LEVELS = [
  "bg-muted/70",
  "bg-brand/25",
  "bg-brand/45",
  "bg-brand/70",
  "bg-brand",
] as const

export function ContributionGrid({
  years,
  monthLabel,
  countLabel,
}: {
  years: readonly ContributionYear[]
  /** `1` → the localised name of January. */
  monthLabel: (month: number) => string
  /** `2` → "2 篇" / "2 posts". */
  countLabel: (count: number) => string
}) {
  const max = Math.max(1, ...years.flatMap((year) => year.months))

  function level(count: number): string {
    if (count === 0) return LEVELS[0]
    // Four non-empty levels, scaled so a single post is already visible.
    const step = Math.ceil((count / max) * 4)
    return LEVELS[Math.min(4, Math.max(1, step))]
  }

  return (
    <div className="space-y-3">
      {years.map((year) => (
        <div key={year.year} className="flex items-center gap-3">
          <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">
            {year.year}
          </span>
          <ul className="flex flex-1 gap-1">
            {year.months.map((count, index) => (
              <li key={index} className="flex-1">
                <div
                  title={`${year.year}-${String(index + 1).padStart(2, "0")} · ${countLabel(count)}`}
                  className={cn(
                    "h-6 w-full rounded-[3px] transition-colors duration-200",
                    level(count)
                  )}
                />
                <span className="sr-only">
                  {monthLabel(index + 1)} {year.year}: {countLabel(count)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="pt-1 font-mono text-[0.625rem] text-muted-foreground">
        {monthLabel(1)} → {monthLabel(12)}
      </p>
    </div>
  )
}
