import Image from "next/image"
import Link from "next/link"

import type { Photo } from "@/lib/album/types"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * The photo wall: an uneven grid, not a card grid.
 *
 * CSS `columns` rather than a grid because a grid would force every frame into
 * one aspect ratio, cropping verticals and horizontals to the same box — the
 * exact failure spec §8.9 names. Columns keep each photo's own proportions and
 * fill the gaps for you. `break-inside-avoid` stops a photo being split across
 * two columns.
 */
export function PhotoWall({ photos }: { photos: readonly Photo[] }) {
  return (
    <ul className="columns-2 gap-3 [&>li]:mb-3 [&>li]:break-inside-avoid sm:columns-3 lg:columns-4">
      {photos.map((photo) => (
        <li key={photo.id}>
          <Link
            href={`/photos/photo/${photo.id}`}
            aria-label={photo.caption ?? photo.id}
            className={cn("group block overflow-hidden rounded-xl", focusRing)}
          >
            <Image
              src={photo.src}
              alt={photo.caption ?? ""}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              placeholder={photo.blur ? "blur" : "empty"}
              blurDataURL={photo.blur || undefined}
              className="w-full transition-opacity duration-200 group-hover:opacity-90"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
