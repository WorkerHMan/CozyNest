"use client"

import { useEffect, useState } from "react"
import { siteConfig } from "@/config/site"
import type { Dictionary } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Countdown to a fixed date plus how far through today/week/month/year we are.
 *
 * Two constraints shape this component:
 *  - Reading the clock during prerender is a **build error** under
 *    `cacheComponents`, so the value is only computed after mount.
 *  - Because it is empty in the static shell, the container reserves its final
 *    height and every bar has a fixed track, so filling in cannot shift layout
 *    (the design system lists CLS < 0.1 as a High-severity requirement).
 */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfWeek = (d: Date) => {
  const s = startOfDay(d)
  // Monday-first, matching the archive view.
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7))
  return s
}
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1)
const plusDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
const plusWeek = (d: Date) => {
  const s = startOfWeek(d)
  s.setDate(s.getDate() + 7)
  return s
}
const plusMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1)
const plusYear = (d: Date) => new Date(d.getFullYear() + 1, 0, 1)

function elapsedPercent(now: Date, from: Date, to: Date): number {
  const total = to.getTime() - from.getTime()
  const done = now.getTime() - from.getTime()
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, (done / total) * 100))
}

function Bar({
  label,
  value,
  percentLabel,
}: {
  label: string
  value: number
  percentLabel: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div
        role="progressbar"
        aria-label={`${label} ${percentLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        className="h-5 flex-1 overflow-hidden rounded-md bg-muted"
      >
        <div
          className="flex h-full items-center justify-end rounded-md bg-brand px-1.5 transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{
            width: `${Math.max(value, 18)}%`,
            // The bar is a solid brand fill, so its label uses the paired
            // foreground token rather than an assumed white.
            color: "var(--brand-foreground)",
          }}
        >
          <span className="font-mono text-[0.7rem] leading-none font-medium">
            {value.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function Countdown({ dict }: { dict: Dictionary }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Both callbacks are external-system callbacks, which is the documented
    // alternative to setting state synchronously in an effect body.
    const first = setTimeout(() => setNow(new Date()), 0)
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  const labels = dict.home.countdown
  const target = new Date(`${siteConfig.countdownDate}T00:00:00`)

  const days = now
    ? Math.max(
        0,
        Math.ceil((target.getTime() - startOfDay(now).getTime()) / 86_400_000)
      )
    : null

  const periods = now
    ? [
        { label: labels.today, value: elapsedPercent(now, startOfDay(now), plusDay(now)) },
        { label: labels.week, value: elapsedPercent(now, startOfWeek(now), plusWeek(now)) },
        { label: labels.month, value: elapsedPercent(now, startOfMonth(now), plusMonth(now)) },
        { label: labels.year, value: elapsedPercent(now, startOfYear(now), plusYear(now)) },
      ]
    : []

  return (
    <section className="border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,15rem)_1fr] lg:px-8">
        <div className="space-y-1">
          <h2 className="eyebrow text-muted-foreground">{labels.title}</h2>
          <p className="flex items-baseline gap-2 text-sm text-muted-foreground">
            {labels.lead}
            <span className="font-heading text-base font-semibold text-foreground">
              {labels.festival}
            </span>
          </p>
          {/* Reserved height: null holds the same box as the number. */}
          <p className="font-mono text-4xl font-semibold tracking-tighter text-brand tabular-nums">
            {days ?? "\u00A0"}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {labels.unit} · {siteConfig.countdownDate}
          </p>
        </div>

        <div
          className={cn(
            "flex flex-col justify-center gap-2.5",
            // Reserve the four rows before the clock is available.
            !now && "opacity-0"
          )}
        >
          {now
            ? periods.map((period) => (
                <Bar
                  key={period.label}
                  label={period.label}
                  value={period.value}
                  percentLabel={`${Math.round(period.value)}%`}
                />
              ))
            : [0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="h-4 w-10 shrink-0 rounded bg-muted" />
                  <span className="h-5 flex-1 rounded-md bg-muted" />
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}
