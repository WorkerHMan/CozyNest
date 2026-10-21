import { cn } from "@/lib/utils"

/**
 * The archive heatmap — GitHub's contribution card, retimed to months.
 *
 * ## The shape
 *
 * GitHub draws 53 weeks across and 7 weekdays down. A blog that publishes a few
 * times a month has nothing to say at day resolution: 371 cells with four lit
 * reads as broken rather than sparse. So the axes are swapped for the unit that
 * actually moves here — **months across, years down**, five of them.
 *
 * ## Tooltips without JavaScript
 *
 * Every cell carries a `title` (the native tooltip, and the fallback if CSS
 * fails) plus a styled tooltip that appears instantly on hover or keyboard focus.
 * No client component, no state, so the page stays fully prerendered.
 *
 * ## Nothing reads the clock
 *
 * Years, month buckets and the maximum all come from the articles, so the grid is
 * identical on every build.
 */
export interface ContributionYear {
  year: string
  /** 12 entries, January first, each holding that month's article count. */
  months: readonly number[]
}

/** Five steps, the first empty. Index maps to the legend swatch. */
const LEVELS = [
  "bg-muted/60",
  "bg-brand/25",
  "bg-brand/45",
  "bg-brand/70",
  "bg-brand",
] as const

export function ContributionGrid({
  years,
  monthLabel,
  countLabel,
  totalLabel,
  legendLabels,
  yearActionLabel,
}: {
  years: readonly ContributionYear[]
  /** `1` → the localised short name of January. */
  monthLabel: (month: number) => string
  /** `2` → "2 篇" / "2 posts". */
  countLabel: (count: number) => string
  /** "24 篇" — the headline summary. */
  totalLabel: string
  legendLabels: { less: string; more: string }
  /** `2025` → "跳到 2025 年的文章". */
  yearActionLabel: (year: string) => string
}) {
  const max = Math.max(1, ...years.flatMap((year) => year.months))

  function level(count: number): string {
    if (count === 0) return LEVELS[0]
    // Four non-empty steps, scaled so a single post is already visible.
    const step = Math.ceil((count / max) * 4)
    return LEVELS[Math.min(4, Math.max(1, step))]
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted-foreground">{totalLabel}</p>
        <p className="hidden font-mono text-[0.625rem] text-muted-foreground/70 sm:block">
          {years[0]?.year} – {years[years.length - 1]?.year}
        </p>
      </div>

      <div className="mt-4 flex gap-4">
        {/* The grid, with the year rail beside it like GitHub's sidebar. */}
        <div className="min-w-0 flex-1">
          {/* Month headings, offset by the row-label column. */}
          <div className="flex gap-1.5">
            <span aria-hidden className="w-8 shrink-0" />
            <div className="grid flex-1 grid-cols-12 gap-1.5">
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className="truncate text-center font-mono text-[0.5625rem] text-muted-foreground/70"
                >
                  {monthLabel(index + 1)}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1.5 space-y-1.5">
            {years.map((year) => (
              <div key={year.year} className="flex items-center gap-1.5">
                <span className="w-8 shrink-0 font-mono text-[0.625rem] text-muted-foreground">
                  {year.year}
                </span>
                <div className="grid flex-1 grid-cols-12 gap-1.5">
                  {year.months.map((count, index) => (
                    <div key={index} className="group relative">
                      <div
                        title={`${year.year}-${String(index + 1).padStart(2, "0")} · ${countLabel(count)}`}
                        className={cn(
                          "aspect-square w-full rounded-[3px] ring-inset transition-colors duration-200",
                          "group-hover:ring-1 group-hover:ring-foreground/25",
                          level(count)
                        )}
                      />
                      {/* Instant tooltip: month, year, and the count. */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-[0.625rem] whitespace-nowrap text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        {monthLabel(index + 1)} {year.year} · {countLabel(count)}
                      </div>
                      <span className="sr-only">
                        {monthLabel(index + 1)} {year.year}: {countLabel(count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="font-mono text-[0.5625rem] text-muted-foreground/70">
              {legendLabels.less}
            </span>
            {LEVELS.map((levelClass) => (
              <span
                key={levelClass}
                aria-hidden
                className={cn("size-2.5 rounded-[2px]", levelClass)}
              />
            ))}
            <span className="font-mono text-[0.5625rem] text-muted-foreground/70">
              {legendLabels.more}
            </span>
          </div>
        </div>

        {/* Year rail: jumps to that year's list further down the page. */}
        <ul className="hidden w-20 shrink-0 space-y-1 sm:block">
          {years.map((year) => (
            <li key={year.year}>
              <a
                href={`#year-${year.year}`}
                aria-label={yearActionLabel(year.year)}
                className="block rounded-md px-2 py-1.5 text-center font-mono text-xs text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {year.year}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
