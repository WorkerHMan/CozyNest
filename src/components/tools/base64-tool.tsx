"use client"

import { useMemo, useState } from "react"
import { CopyButton } from "@/components/tools/copy-button"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Dictionary } from "@/i18n"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * Base64 encode / decode.
 *
 * `btoa`/`atob` operate on Latin-1 code units, so calling them on raw text
 * corrupts anything outside ASCII — Chinese included. Both directions therefore
 * go through `TextEncoder`/`TextDecoder` and only the bytes touch base64.
 */
function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodeBase64(value: string): string {
  const binary = atob(value.trim())
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function Base64Tool({ labels }: { labels: Dictionary["pages"]["tools"] }) {
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [raw, setRaw] = useState("")

  const result = useMemo(() => {
    const text = raw.trim()
    if (text === "") return { ok: true, output: "", error: "" }
    try {
      return {
        ok: true,
        output: mode === "encode" ? encodeBase64(raw) : decodeBase64(raw),
        error: "",
      }
    } catch (error) {
      return {
        ok: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }, [raw, mode])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {labels.base64Name}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={labels.base64Name}
            className="flex gap-1 rounded-lg bg-muted p-1"
          >
            {(["encode", "decode"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={[
                  "h-7 rounded-md px-2.5 text-xs font-medium transition-colors duration-200",
                  focusRing,
                  mode === value
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {value === "encode" ? "text → base64" : "base64 → text"}
              </button>
            ))}
          </div>
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
        {labels.base64Hint}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="base64-input">{labels.inputLabel}</Label>
          <Textarea
            id="base64-input"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            spellCheck={false}
            rows={8}
            aria-invalid={!result.ok}
            aria-describedby={result.ok ? undefined : "base64-error"}
            className="min-h-40 font-mono text-xs"
          />
          {!result.ok ? (
            <p
              id="base64-error"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 font-mono text-xs text-destructive"
            >
              {labels.invalidInput}: {result.error}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="base64-output">{labels.outputLabel}</Label>
          <Textarea
            id="base64-output"
            value={result.output}
            readOnly
            rows={8}
            spellCheck={false}
            placeholder={labels.emptyInput}
            className="min-h-40 bg-muted/40 font-mono text-xs"
          />
          <p aria-live="polite" className="sr-only">
            {result.ok ? labels.live : labels.invalidInput}
          </p>
        </div>
      </div>
    </div>
  )
}
