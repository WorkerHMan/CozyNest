"use client"

import { Dices, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { RandomStage, type StageItem } from "@/components/blog/random-stage"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const EVENT = "cozynest:random-picker"

const copy = {
  trigger: { zh: "随机", en: "Random" },
  title: { zh: "随机一篇", en: "Picking one" },
  close: { zh: "关闭", en: "Close" },
}

/**
 * The menu entry. It only announces intent — the panel itself lives in
 * `RandomPickerHost`, outside the dropdown.
 *
 * That split matters: the dropdown unmounts when it closes, and anything rendered
 * inside it (portals included) unmounts with it. Keeping the trigger dumb means
 * the menu can close on selection without taking the picker down.
 */
export function RandomPickerTrigger({ locale }: { locale: Locale }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(EVENT))}
      className={cn(
        "block w-full rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground",
        focusRing
      )}
    >
      {copy.trigger[locale]}
    </button>
  )
}

/**
 * The picker: a centred picture-in-picture panel, portalled to `document.body`.
 *
 * The portal is not decoration. `position: fixed` is only viewport-relative while
 * no ancestor has a `transform` — and the header is translated for its
 * hide-on-scroll behaviour. Rendered in place, the panel was positioned against the
 * header instead of the screen, which is exactly why it refused to centre.
 */
export function RandomPickerHost({
  items,
  locale,
}: {
  items: readonly StageItem[]
  locale: Locale
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  /** A fresh random ten each time the picker opens. */
  const [pool, setPool] = useState<readonly StageItem[]>([])

  // Portals need a DOM target, which does not exist during prerender.
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    function onRequest() {
      // Shuffle and keep ten, so the drum never repeats the same order twice.
      const shuffled = [...items]
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      setPool(shuffled.slice(0, Math.min(10, shuffled.length)))
      setOpen(true)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener(EVENT, onRequest)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener(EVENT, onRequest)
      document.removeEventListener("keydown", onKeyDown)
    }
    // `items` comes from the server and is stable for the life of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!open || !mounted) return null

  return createPortal(
    <div
      role="region"
      aria-label={copy.title[locale]}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-1 overflow-y-auto bg-black/75 p-6 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-5xl items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70">
          <Dices aria-hidden className="size-4" />
          {copy.title[locale]}
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={copy.close[locale]}
          className={cn(
            "grid size-10 place-items-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white",
            "outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          )}
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <RandomStage
          items={pool}
          locale={locale}
          compact
          tone="dark"
          autoSpin
          onDone={(slug) => {
            setOpen(false)
            router.push(`/blog/${slug}`)
          }}
        />
      </div>
    </div>,
    document.body
  )
}
