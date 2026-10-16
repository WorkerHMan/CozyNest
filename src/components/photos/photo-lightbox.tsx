"use client"

import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Photo } from "@/data/photos"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

/** Accessible names and visible labels, taken from the dictionary. */
export interface PhotoLightboxLabels {
  close: string
  previous: string
  next: string
}

const aspectClass: Record<Photo["aspect"], string> = {
  square: "aspect-square w-full",
  portrait: "aspect-[3/4] w-[min(100%,22rem)]",
  landscape: "aspect-[3/2] w-full",
}

/**
 * Photo viewer.
 *
 * Built on the shadcn `Dialog`, which already provides the hard accessibility
 * requirements for a lightbox: Escape closes it, focus is trapped inside, and
 * outside pointer events are blocked. This component adds the parts Radix
 * cannot know about:
 *  - ArrowLeft / ArrowRight step through the photos, handled on the dialog
 *    content so the keystroke works wherever focus currently sits inside it;
 *  - previous/next are real buttons that are `disabled` at the ends, so the
 *    bounds are announced instead of silently doing nothing;
 *  - the close button carries an accessible name from the dictionary;
 *  - the dialog's description requirement is satisfied by a real
 *    `DialogDescription` holding the photo's alt text rather than opted out of
 *    with `aria-describedby={undefined}`, so Radix has no reason to warn and
 *    the description is genuinely attached to the dialog;
 *  - a polite live region announces the counter on every step, because the
 *    visible counter is a sibling of the title and would otherwise change
 *    silently for screen reader users.
 */
export function PhotoLightbox({
  photos,
  activeIndex,
  onIndexChange,
  onOpenerChange,
  locale,
  labels,
}: {
  photos: readonly Photo[]
  /** Index into `photos`, or -1 when the dialog is closed. */
  activeIndex: number
  onIndexChange: (index: number) => void
  /**
   * Called with the `data-photo-id` of the control that opened the dialog,
   * once the dialog has fully closed — the hook the grid uses to put focus
   * back on the tile the visitor came from.
   */
  onOpenerChange?: (photoId: string | null) => void
  locale: Locale
  labels: PhotoLightboxLabels
}) {
  const open = activeIndex >= 0 && activeIndex < photos.length
  const photo = open ? photos[activeIndex] : undefined
  const isFirst = activeIndex <= 0
  const isLast = activeIndex >= photos.length - 1
  const opener = useRef<string | null>(null)

  // Captured on the closed -> open transition: by the time Radix has moved
  // focus into the content, the tile is no longer the active element.
  useEffect(() => {
    if (!open) return
    const active = document.activeElement
    opener.current =
      active instanceof HTMLElement
        ? active.closest<HTMLElement>("[data-photo-id]")?.dataset.photoId ?? null
        : null
  }, [open])

  const step = (delta: number) => {
    const next = activeIndex + delta
    if (next < 0 || next >= photos.length) return
    onIndexChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onIndexChange(-1)
      }}
    >
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          // Without a `DialogTrigger` Radix would restore focus to `<body>`,
          // dropping a keyboard visitor out of the grid. Put it back on the
          // tile instead.
          if (opener.current) {
            event.preventDefault()
            onOpenerChange?.(opener.current)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault()
            step(-1)
          }
          if (event.key === "ArrowRight") {
            event.preventDefault()
            step(1)
          }
        }}
        className="max-w-4xl gap-3"
      >
        {photo ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-base text-balance">
                  {photo.title[locale]}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {photo.alt[locale]}
                </DialogDescription>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <p className="font-mono text-xs text-muted-foreground">
                  {activeIndex + 1} / {photos.length}
                </p>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={labels.close}
                  >
                    <X aria-hidden />
                  </Button>
                </DialogClose>
              </div>
            </div>

            {/* Reserved aspect ratio: the box never reflows when a portrait
                photo follows a landscape one. */}
            <div className="flex max-h-[60vh] items-center justify-center overflow-hidden rounded-lg bg-muted">
              <div
                role="img"
                aria-label={photo.alt[locale]}
                className={cn(aspectClass[photo.aspect], "rounded-lg")}
                style={{ backgroundImage: photo.gradient }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => step(-1)}
                disabled={isFirst}
                className="border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <ChevronLeft aria-hidden />
                {labels.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => step(1)}
                disabled={isLast}
                className="border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {labels.next}
                <ChevronRight aria-hidden />
              </Button>
            </div>

            {/* The description in text as well, so it is available to everyone
                and not only to the accessibility tree. */}
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {photo.alt[locale]}
            </p>

            <p aria-live="polite" className="sr-only">
              <span key={`${photo.id}-${activeIndex}`}>
                {`${photo.title[locale]} — ${activeIndex + 1} / ${photos.length}`}
              </span>
            </p>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
