"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { CopyButton } from "@/components/tools/copy-button"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Dictionary } from "@/i18n"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * JSON formatter / minifier.
 *
 * Parsing goes through `useDeferredValue`: re-parsing on every keystroke is the
 * anti-pattern the design system calls out for search-like inputs. The parse
 * error is shown **next to the input** rather than only in the output box, so
 * the message is where the mistake is.
 */
export function JsonFormatter({ labels }: { labels: Dictionary["pages"]["tools"] }) {
  const [raw, setRaw] = useState("")
  const [compact, setCompact] = useState(false)
  const deferred = useDeferredValue(raw)

  const result = useMemo(() => {
    const text = deferred.trim()
    if (text === "") return { ok: true, output: "", error: "" }
    try {
      const parsed: unknown = JSON.parse(text)
      return {
        ok: true,
        output: JSON.stringify(parsed, null, compact ? 0 : 2),
        error: "",
      }
    } catch (error) {
      return {
        ok: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }, [deferred, compact])

  const stale = raw !== deferred

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">{labels.jsonName}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={compact}
            onClick={() => setCompact((value) => !value)}
            className={focusRing}
          >
            {compact ? "—" : "⇥"}
            <span className="ms-1">{compact ? "min" : "pretty"}</span>
          </Button>
          <CopyButton
            value={result.output}
            label={labels.copy}
            copiedLabel={labels.copied}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRaw("")}
            disabled={raw === ""}
            className={focusRing}
          >
            {labels.clear}
          </Button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {labels.jsonHint}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="json-input">{labels.inputLabel}</Label>
          <Textarea
            id="json-input"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            spellCheck={false}
            rows={10}
            aria-invalid={!result.ok}
            aria-describedby={result.ok ? undefined : "json-error"}
            className="min-h-48 font-mono text-xs"
          />
          {!result.ok ? (
            <p
              id="json-error"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 font-mono text-xs text-destructive"
            >
              {labels.invalidInput}: {result.error}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="json-output">{labels.outputLabel}</Label>
          <Textarea
            id="json-output"
            value={stale ? "" : result.output}
            readOnly
            rows={10}
            spellCheck={false}
            placeholder={labels.emptyInput}
            className="min-h-48 bg-muted/40 font-mono text-xs"
          />
          <p aria-live="polite" className="sr-only">
            {stale ? "…" : result.ok ? labels.live : labels.invalidInput}
          </p>
        </div>
      </div>
    </div>
  )
}
