"use client"

import { useRef, useState } from "react"
import {
  PhotoLightbox,
  type PhotoLightboxLabels,
} from "@/components/photos/photo-lightbox"
import type { Photo } from "@/data/photos"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const aspectClass: Record<Photo["aspect"], string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[3/2]",
}

/**
 * The gallery grid.
 *
 * Only state here is *which* photo is open — the filter is in the URL, so the
 * page around this component stays a Server Component. Every tile is a real
 * `<button>`, which means it is keyboard reachable and its accessible name is
 * the photo's description rather than a filename. The aspect ratio is reserved
 * on a wrapper element, so tiles never resize once the gradient paints.
 *
 * The ref map exists for one reason: Radix restores focus on close after its
 * unmount cleanup, which lands on `<body>` when the dialog has no `Trigger`.
 * That costs a keyboard user their place in the grid, so the lightbox reports
 * the `data-photo-id` of the tile it was opened from and that tile is focused
 * again once the dialog has gone.
 */
export function PhotoGallery({
  photos,
  locale,
  labels,
}: {
  photos: readonly Photo[]
  locale: Locale
  labels: PhotoLightboxLabels
}) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const tiles = useRef(new Map<string, HTMLButtonElement>())

  return (
    <>
      <ul className="mt-10 grid list-none grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className={cn("relative", aspectClass[photo.aspect])}
          >
            <button
              type="button"
              data-photo-id={photo.id}
              ref={(node) => {
                if (node) tiles.current.set(photo.id, node)
                else tiles.current.delete(photo.id)
              }}
              onClick={() => setActiveIndex(index)}
              aria-label={photo.alt[locale]}
              className={cn(
                "group absolute inset-0 overflow-hidden rounded-xl border border-border-strong outline-none",
                "transition-transform duration-200 motion-safe:hover:-translate-y-0.5",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl"
                style={{ backgroundImage: photo.gradient }}
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/85 to-transparent px-3 pt-8 pb-2 text-left text-xs font-medium text-foreground"
              >
                {photo.title[locale]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <PhotoLightbox
        photos={photos}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        onOpenerChange={(id) => {
          const node = id ? tiles.current.get(id) : undefined
          if (node) node.focus()
        }}
        locale={locale}
        labels={labels}
      />
    </>
  )
}
