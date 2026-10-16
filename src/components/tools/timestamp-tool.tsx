"use client"

import { useEffect, useMemo, useState } from "react"
import { CopyButton } from "@/components/tools/copy-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dictionary } from "@/i18n"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Timestamp converter.
 *
 * This is the one tool that reads the clock, so it must be a Client Component:
 * calling `Date.now()` during prerender is a build error under
 * `cacheComponents`. The live value starts as `null` and is filled from a timer
 * callback (setting state synchronously inside an effect body is rejected by
 * the React 19 lint rule), and the row reserves its height so nothing shifts.
 */
export function TimestampTool({
  labels,
}: {
  labels: Dictionary["pages"]["tools"]
}) {
  const [now, setNow] = useState<number | null>(null)
  const [raw, setRaw] = useState("")

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0)
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  const parsed = useMemo(() => {
    const text = raw.trim()
    if (text === "") return { ok: true, text: "", iso: "" }
    if (!/^-?\d+$/.test(text)) return { ok: false, text: "", iso: "" }
    // 10 digits = seconds, 13 = milliseconds; anything shorter is treated as
    // seconds so a value like "1700000000" is not read as 1970.
    const numeric = Number(text)
    const ms = text.replace("-", "").length >= 12 ? numeric : numeric * 1000
    const date = new Date(ms)
    if (Number.isNaN(date.getTime())) return { ok: false, text: "", iso: "" }
    return { ok: true, text: date.toLocaleString(), iso: date.toISOString() }
  }, [raw])

  const seconds = now === null ? null : Math.floor(now / 1000)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {labels.timestampName}
        </h2>
        <CopyButton
          value={seconds === null ? "" : String(seconds)}
          label={labels.copy}
          copiedLabel={labels.copied}
        />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {labels.timestampHint}
      </p>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
          <dt className="eyebrow text-muted-foreground">
            {labels.seconds} / {labels.milliseconds}
          </dt>
          {/* Fixed height reserved so the ticking value cannot shift layout. */}
          <dd className="mt-2 min-h-6 font-mono text-lg tabular-nums">
            {seconds ?? "\u00A0"}
          </dd>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/40 p-4">
          <dt className="eyebrow text-muted-foreground">{labels.live}</dt>
          <dd className="mt-2 min-h-6 font-mono text-sm tabular-nums">
            {now === null ? "\u00A0" : new Date(now).toLocaleTimeString()}
          </dd>
        </div>
      </dl>

      <div className="max-w-md space-y-2">
        <Label htmlFor="timestamp-input">{labels.inputLabel}</Label>
        <Input
          id="timestamp-input"
          inputMode="numeric"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="1700000000"
          aria-invalid={!parsed.ok}
          aria-describedby={parsed.ok ? "timestamp-output" : "timestamp-error"}
          className="h-10 font-mono"
        />
        {!parsed.ok ? (
          <p
            id="timestamp-error"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 font-mono text-xs text-destructive"
          >
            {labels.invalidInput}
          </p>
        ) : (
          <p id="timestamp-output" className="font-mono text-sm" aria-live="polite">
            {parsed.text || labels.emptyInput}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRaw(seconds === null ? "" : String(seconds))}
        disabled={seconds === null}
        className={focusRing}
      >
        {labels.timestampName}
      </Button>
    </div>
  )
}
