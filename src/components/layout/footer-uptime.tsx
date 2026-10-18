"use client"

import { useEffect, useState } from "react"

/**
 * "Up for N days", computed in the browser.
 *
 * The subtraction has to happen on the client: the page is prerendered, and
 * calling `Date.now()` during prerender trips the cache-components clock rule.
 * So this renders nothing until it mounts — a one-line placeholder would cause
 * layout shift, so it renders the label's own box with a non-breaking space.
 */
export function FooterUptime({ since, label, unit }: { since: string; label: string; unit: string }) {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    // Deferred a tick: writing state synchronously inside an effect body is
    // exactly what `react-hooks/set-state-in-effect` forbids, and it costs a
    // cascading render.
    const id = window.setTimeout(() => {
      const start = new Date(`${since}T00:00:00Z`).getTime()
      setDays(Math.max(0, Math.floor((Date.now() - start) / 86_400_000)))
    }, 0)
    return () => window.clearTimeout(id)
  }, [since])

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">
        {days === null ? "\u00a0" : days}
      </span>
      <span className="text-muted-foreground">{unit}</span>
    </span>
  )
}
