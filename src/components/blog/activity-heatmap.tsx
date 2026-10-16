export interface DayCount {
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string
  count: number
}

const DAY_MS = 86_400_000
const WEEKS = 53

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * GitHub-style activity grid for the blog archive.
 *
 * Two rules shaped it:
 *
 * 1. **The clock is never read.** The grid ends at the week of the most recent
 *    post, not at "today", because reading the date during prerender is a build
 *    error under `cacheComponents`. The range is therefore deterministic.
 * 2. **Intensity is not conveyed by colour alone** (the design system's Heat Map
 *    entry requires values or symbols *in addition to* the colour scale): every
 *    non-empty cell also carries a centred dot whose size grows with the count,
 *    each cell exposes a text tooltip, and the full numbers are available to
 *    assistive tech in a visually hidden table. The visual grid itself is
 *    `aria-hidden`, so screen readers get the numbers rather than 371 unnamed
 *    cells.
 */
export function ActivityHeatmap({
  days,
  legendLess,
  legendMore,
  summaryLabel,
  emptyLabel,
}: {
  days: readonly DayCount[]
  legendLess: string
  legendMore: string
  summaryLabel: string
  emptyLabel: string
}) {
  if (days.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyLabel}</p>
    )
  }

  const counts = new Map(days.map((d) => [d.date, d.count]))
  const max = Math.max(1, ...days.map((d) => d.count))
  const nonzero = [...days].filter((d) => d.count > 0).sort((a, b) => a.date.localeCompare(b.date))

  // End on the last day of the week containing the newest post, so columns are
  // whole weeks.
  const newest = new Date(`${days[days.length - 1].date}T00:00:00Z`)
  const end = new Date(newest.getTime() + (6 - newest.getUTCDay()) * DAY_MS)
  const start = new Date(end.getTime() - (WEEKS * 7 - 1) * DAY_MS)

  const cells: { date: string; count: number; level: number }[] = []
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const date = isoOf(new Date(t))
    const count = counts.get(date) ?? 0
    const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / max) * 4))
    cells.push({ date, count, level })
  }

  return (
    <figure className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div
          aria-hidden
          className="grid w-max grid-flow-col grid-rows-7 gap-[3px]"
        >
          {cells.map((cell) => (
            <span
              key={cell.date}
              title={`${cell.date} · ${cell.count}`}
              className="flex size-2.5 items-center justify-center rounded-[2px]"
              style={{
                backgroundColor:
                  cell.level === 0
                    ? "var(--muted)"
                    : `color-mix(in oklab, var(--brand) ${cell.level * 24}%, var(--muted))`,
              }}
            >
              {cell.count > 0 ? (
                <span
                  className="block rounded-full bg-background/70"
                  style={{
                    width: `${2 + cell.level}px`,
                    height: `${2 + cell.level}px`,
                  }}
                />
              ) : null}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <figcaption className="text-xs text-muted-foreground">
          {summaryLabel}
        </figcaption>
        <div aria-hidden className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{legendLess}</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="size-2.5 rounded-[2px]"
              style={{
                backgroundColor:
                  level === 0
                    ? "var(--muted)"
                    : `color-mix(in oklab, var(--brand) ${level * 24}%, var(--muted))`,
              }}
            />
          ))}
          <span>{legendMore}</span>
        </div>
      </div>

      {/* The accessible equivalent of the grid: only days that actually have
          posts, so the list stays short. */}
      <table className="sr-only">
        <caption>{summaryLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{legendLess}</th>
            <th scope="col">{legendMore}</th>
          </tr>
        </thead>
        <tbody>
          {nonzero.map((day) => (
            <tr key={day.date}>
              <th scope="row">{day.date}</th>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
