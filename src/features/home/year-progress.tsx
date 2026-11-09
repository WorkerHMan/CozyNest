"use client"

import { useEffect, useState } from "react"

import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Countdown to the next 春节, plus how much of today / this week / this month /
 * this year has gone.
 *
 * ## Finding the next festival
 *
 * Chinese New Year follows the lunar calendar, so it has no simple arithmetic
 * rule — a table of published dates is both shorter and far more honest than a
 * formula that is wrong for some years. The list runs to 2040, comfortably past
 * the useful life of this page; past its end the last date is used rather than
 * showing a wrong countdown.
 *
 * ## Everything is computed after mount
 *
 * These are clock readings, and reading the clock during render trips the
 * cache-components rule for prerendered pages. Until mount the numbers render as
 * dashes: no layout shift, and no invented values.
 *
 * The minute interval keeps "how much of today" honest in a tab left open.
 */

/** Published 春节 dates, 2025–2040. */
const SPRING_FESTIVALS = [
  "2025-01-29",
  "2026-02-17",
  "2027-02-06",
  "2028-01-26",
  "2029-02-13",
  "2030-02-03",
  "2031-01-23",
  "2032-02-11",
  "2033-01-31",
  "2034-02-19",
  "2035-02-08",
  "2036-01-28",
  "2037-02-15",
  "2038-02-04",
  "2039-01-24",
  "2040-02-12",
] as const

const copy = {
  time: { zh: "时间", en: "Time" },
  distanceTo: { zh: "距离", en: "Until" },
  festival: { zh: "春节", en: "Spring Festival" },
  day: { zh: "天", en: "days" },
  today: { zh: "今日", en: "Today" },
  week: { zh: "本周", en: "This week" },
  month: { zh: "本月", en: "This month" },
  year: { zh: "本年", en: "This year" },
}

interface Metrics {
  days: number
  target: string
  today: number
  week: number
  month: number
  year: number
}

function percent(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.min(100, Math.max(0, (part / whole) * 100))
}

function nextSpringFestival(now: Date): string {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  for (const date of SPRING_FESTIVALS) {
    if (new Date(`${date}T00:00:00`).getTime() >= midnight) return date
  }
  return SPRING_FESTIVALS[SPRING_FESTIVALS.length - 1]
}

function compute(): Metrics {
  const now = new Date()

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1)

  // Weeks start on Monday; `getDay()` puts Sunday at 0.
  const weekday = (now.getDay() + 6) % 7
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday)
  const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000)

  const target = nextSpringFestival(now)
  const days = Math.max(0, Math.ceil((new Date(`${target}T00:00:00`).getTime() - now.getTime()) / 86_400_000))

  return {
    days,
    target,
    today: percent(now.getTime() - startOfDay.getTime(), 86_400_000),
    week: percent(now.getTime() - weekStart.getTime(), weekEnd.getTime() - weekStart.getTime()),
    month: percent(now.getTime() - monthStart.getTime(), monthEnd.getTime() - monthStart.getTime()),
    year: percent(now.getTime() - yearStart.getTime(), yearEnd.getTime() - yearStart.getTime()),
  }
}

export function YearProgress({ locale }: { locale: Locale }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    function tick() {
      setMetrics(compute())
    }

    // Written from a timer, not synchronously in the effect body.
    const first = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 60_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(interval)
    }
  }, [])

  const ready = metrics !== null

  const rows = [
    { key: "today" as const, label: copy.today[locale], value: metrics?.today ?? 0 },
    { key: "week" as const, label: copy.week[locale], value: metrics?.week ?? 0 },
    { key: "month" as const, label: copy.month[locale], value: metrics?.month ?? 0 },
    { key: "year" as const, label: copy.year[locale], value: metrics?.year ?? 0 },
  ]

  return (
    <section
      aria-label={copy.time[locale]}
      className="rounded-2xl border border-border/60 bg-muted/30 p-6"
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-8">
        <div>
          <p className="eyebrow text-muted-foreground">{copy.time[locale]}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy.distanceTo[locale]}{" "}
            <span className="text-foreground">{copy.festival[locale]}</span>
          </p>
          <p
            className={cn(
              "font-heading mt-1 text-4xl font-semibold tabular-nums text-brand",
              !ready && "opacity-40"
            )}
          >
            {ready ? metrics.days : "—"}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {copy.day[locale]}
            {ready ? ` · ${metrics.target}` : ""}
          </p>
        </div>

        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-xs text-muted-foreground">{row.label}</span>

              {/* The bar is pure geometry; the number sits beside it so a narrow
                  bar — a few percent into the day — cannot clip its own label. */}
              <span className="relative h-6 flex-1 overflow-hidden rounded-full bg-border/60">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-500"
                  style={{ width: ready ? `${row.value}%` : "0%" }}
                />
              </span>

              <span className="w-14 shrink-0 text-right font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                {ready ? `${row.value.toFixed(2)}%` : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
