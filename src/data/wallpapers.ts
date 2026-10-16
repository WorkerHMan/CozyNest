import type { Localized } from "@/types/content"

export interface Wallpaper {
  id: string
  /** The line of creed shown over the wallpaper. */
  creed: Localized<string>
  /**
   * CSS background for the slide. Shipping gradients keeps the gate honest —
   * no placeholder image requests, no layout shift, nothing to optimise — and
   * swapping in real photography is a data change: set `image` and the gate
   * renders it through `next/image` instead (see the component).
   */
  background: string
  /** Optional photo. When present it is rendered with `next/image`. */
  image?: string
}

/**
 * Wallpapers for the gate on the home page.
 *
 * These are placeholders in the literal sense: they exist so the carousel's
 * structure, accessibility and timing can be built and verified before real
 * artwork exists.
 */
export const wallpapers: readonly Wallpaper[] = [
  {
    id: "dawn",
    creed: {
      zh: "把会的东西钉在这里，才算真的会了。",
      en: "Knowledge only counts once it is pinned down somewhere.",
    },
    background:
      "radial-gradient(120% 90% at 20% 10%, oklch(0.42 0.11 250) 0%, transparent 60%), radial-gradient(100% 80% at 85% 30%, oklch(0.55 0.16 190) 0%, transparent 55%), linear-gradient(160deg, oklch(0.16 0.04 265) 0%, oklch(0.09 0.03 265) 100%)",
  },
  {
    id: "nest",
    creed: {
      zh: "窝不必大，能装下所有折腾就行。",
      en: "A nest need not be big — it just has to hold every experiment.",
    },
    background:
      "radial-gradient(110% 80% at 75% 15%, oklch(0.5 0.14 300) 0%, transparent 58%), radial-gradient(90% 70% at 15% 40%, oklch(0.58 0.15 20) 0%, transparent 52%), linear-gradient(200deg, oklch(0.15 0.04 280) 0%, oklch(0.08 0.02 280) 100%)",
  },
  {
    id: "signal",
    creed: {
      zh: "慢一点，但每一层都自己搭。",
      en: "Slower, but every layer built by hand.",
    },
    background:
      "radial-gradient(100% 80% at 40% 20%, oklch(0.5 0.15 150) 0%, transparent 55%), radial-gradient(120% 90% at 90% 60%, oklch(0.52 0.13 210) 0%, transparent 60%), linear-gradient(140deg, oklch(0.14 0.03 200) 0%, oklch(0.08 0.02 250) 100%)",
  },
] as const
