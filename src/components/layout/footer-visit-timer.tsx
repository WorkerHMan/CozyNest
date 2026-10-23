"use client"

import { useEffect, useState } from "react"

/**
 * Where the visit started. `sessionStorage` rather than a module variable: a
 * reload is not a new visit, and a module variable resets on every navigation.
 * One origin-wide key, so the clock keeps running across pages.
 */
const STORAGE_KEY = "cozynest:visit-start"

export interface VisitUnits {
  hours: string
  minutes: string
  seconds: string
}

/**
 * "This visit 3 分钟 12 秒", ticking once a second.
 *
 * ## How long, not what time
 *
 * Same voice as the uptime counter next to it: every unit carries its own word
 * rather than a `HH:MM:SS` clock, because letters that mean nothing have to be
 * learned and words do not. Hours only appear once the visit passes one, so a
 * normal read stays two words long.
 *
 * ## Why it starts after mount
 *
 * The page is prerendered, so reading the clock during render trips the
 * cache-components rule, and reading `sessionStorage` there would make the
 * server and client disagree. Until it mounts this renders a non-breaking space:
 * no layout shift, no invented value. The first tick is written from a deferred
 * timeout rather than the effect body, which `react-hooks/set-state-in-effect`
 * forbids.
 *
 * ## Local only
 *
 * Nothing is sent anywhere. The start time lives in this tab's `sessionStorage`
 * and is never read by the server. If storage is blocked the clock still runs,
 * it just restarts on each page load.
 */
export function FooterVisitTimer({ label, units }: { label: string; units: VisitUnits }) {
  const [elapsed, setElapsed] = useState<number | null>(null)

  useEffect(() => {
    const now = Date.now()
    let start = now

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY)
      const parsed = stored ? Number(stored) : Number.NaN
      // A stored value must be a real past timestamp; anything else (corrupt,
      // in the future) starts the clock over rather than producing a negative
      // or absurd duration.
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= now) {
        start = parsed
      } else {
        window.sessionStorage.setItem(STORAGE_KEY, String(now))
      }
    } catch {
      // Private mode or storage disabled: keep counting from now.
    }

    function tick() {
      setElapsed(Math.max(0, Date.now() - start))
    }

    const first = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(interval)
    }
  }, [])

  if (elapsed === null) {
    return (
      <span className="inline-flex items-baseline gap-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{"\u00a0"}</span>
      </span>
    )
  }

  const totalSeconds = Math.floor(elapsed / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1">
      <span className="text-muted-foreground">{label}</span>
      {/* `role="timer"` is a live region that is *off* by default, so a screen
          reader is not read a new number every second. tabular-nums keeps the
          footer row from twitching as the digits change. */}
      <span role="timer" className="font-mono text-foreground tabular-nums">
        {hours > 0 ? `${hours} ${units.hours} ` : ""}
        {minutes} {units.minutes} {seconds} {units.seconds}
      </span>
    </span>
  )
}
