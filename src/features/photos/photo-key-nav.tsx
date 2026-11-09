"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Arrow-key paging on a photo.
 *
 * `←`/`→` walk the timeline, `Esc` goes back to the list. The arrows are a
 * convenience for the keyboard, not the only way through: the same destinations
 * are real links in the page, so nothing here is reachable *only* by a key
 * combination.
 *
 * `router.push` rather than `router.back`: the visitor arrived from a year, a
 * place, or the timeline, and going "back" would depend on which — the list is
 * the one destination that always makes sense.
 */
export function PhotoKeyNav({
  previous,
  next,
  back,
}: {
  previous: string | null
  next: string | null
  back: string
}) {
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Never hijack a key while the visitor is typing.
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return
      }
      if (event.key === "ArrowLeft" && previous) {
        event.preventDefault()
        router.push(previous)
      } else if (event.key === "ArrowRight" && next) {
        event.preventDefault()
        router.push(next)
      } else if (event.key === "Escape") {
        router.push(back)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [previous, next, back, router])

  return null
}
