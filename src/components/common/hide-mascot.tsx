"use client"

import { useEffect } from "react"

/**
 * Hides the mascot while a full-width page is mounted.
 *
 * The mascot floats at `fixed z-30` over everything, which is charming on a
 * reading page and actively in the way on a page that fills the width — on
 * /photos it sat on top of the category rail. Done from the page rather than
 * inside the mascot so a route check never has to live in the mascot's render
 * path, and the mascot comes back exactly as it was on unmount.
 *
 * The music page does the same thing inline; this is the shared version for the
 * pages that need it.
 */
export function HideMascot() {
  useEffect(() => {
    const mascot = document.querySelector<HTMLElement>("[data-paimon]")
    if (!mascot) return
    const previous = mascot.style.display
    mascot.style.display = "none"
    return () => {
      mascot.style.display = previous
    }
  }, [])

  return null
}
