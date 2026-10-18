"use client"

import { useEffect, useState } from "react"

export interface UptimeUnits {
  days: string
  hours: string
  minutes: string
  seconds: string
}

/**
 * "Up for 293 天 4 小时 12 分钟 37 秒", ticking once a second.
 *
 * Every unit carries its own label rather than a `HH:MM:SS` clock: letters that
 * mean nothing have to be learned, words do not.
 *
 * The arithmetic has to run in the browser — the page is prerendered, and reading
 * `Date.now()` during prerender trips the cache-components clock rule. So this
 * renders a non-breaking space until it mounts (no layout shift), then fills in.
 * The first value is written from a deferred timeout rather than straight in the
 * effect body, which `react-hooks/set-state-in-effect` forbids.
 */
export function FooterUptime({
  since,
  label,
  units,
}: {
  since: string
  label: string
  units: UptimeUnits
}) {
  const [elapsed, setElapsed] = useState<number | null>(null)

  useEffect(() => {
    const start = new Date(`${since}T00:00:00Z`).getTime()

    function tick() {
      setElapsed(Math.max(0, Date.now() - start))
    }

    const first = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(interval)
    }
  }, [since])

  if (elapsed === null) {
    return (
      <span className="inline-flex items-baseline gap-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{"\u00a0"}</span>
      </span>
    )
  }

  const totalSeconds = Math.floor(elapsed / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1">
      <span className="text-muted-foreground">{label}</span>
      {/* tabular-nums keeps the row from twitching as the seconds tick over. */}
      <span className="font-mono text-foreground tabular-nums">
        {days} {units.days} {hours} {units.hours} {minutes} {units.minutes} {seconds}{" "}
        {units.seconds}
      </span>
    </span>
  )
}
