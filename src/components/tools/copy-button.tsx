"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

/**
 * Copy-to-clipboard with reported state.
 *
 * The label swap is wrapped in `aria-live` so a screen-reader user learns that
 * the copy succeeded — otherwise the only feedback is a visual change.
 */
export function CopyButton({
  value,
  label,
  copiedLabel,
  disabled,
}: {
  value: string
  label: string
  copiedLabel: string
  disabled?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      // A camera-style timeout, not an effect: no state is set during render.
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be unavailable (insecure context); the value stays
      // selectable in the textarea, which is the fallback.
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copy}
      disabled={disabled || value === ""}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {copied ? (
        <Check aria-hidden className="size-3.5" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </Button>
  )
}
