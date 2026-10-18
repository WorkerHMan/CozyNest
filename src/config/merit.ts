import type { Localized } from "@/types/content"

/**
 * The wooden-fish cursor easter egg.
 *
 * ## Applying the cursor
 *
 * The declared cursor sits on `html`, so it is **inherited** by everything that
 * does not set its own. Buttons and links already declare `cursor: pointer`, and
 * they keep it — an interactive control that stops advertising itself is a
 * usability regression, so "the whole page is a wooden fish" stops exactly at
 * the things you can click.
 *
 * It is also gated behind `(pointer: fine)`: touch devices have no cursor, and
 * forcing one there does nothing but cost a request.
 *
 * ## The floating counter
 *
 * Clicking anywhere spawns a short-lived reward that drifts up and fades. The
 * reward is drawn at random from `rewards`, and **never the same one twice in a
 * row** — repeating the previous word makes quick clicking feel broken rather
 * than lucky.
 *
 * The effect is decorative, so it is capped (`MAX_BUBBLES`) to keep rapid
 * clicking from flooding the DOM, and it degrades to a plain fade under
 * `prefers-reduced-motion` rather than disappearing — feedback should not vanish
 * just because motion is unwelcome.
 *
 * Cursors are bitmaps because SVG cursors are not supported by Safari. They are
 * *not* scaled by devicePixelRatio, so a 64px file would render 64 CSS px wide;
 * 32px with a centred hotspot is the size that looks right everywhere.
 */
export interface Reward {
  id: string
  label: Localized<string>
}

export const merit = {
  /**
   * Eight wishes. The first five are the classics; luck / inspiration / study
   * sit in the same register so the draw never feels like it jumped genres.
   * Add or remove an entry freely — the picker reads this array's length.
   */
  rewards: [
    { id: "merit", label: { zh: "功德", en: "Merit" } },
    { id: "wealth", label: { zh: "财富", en: "Wealth" } },
    { id: "love", label: { zh: "爱情", en: "Love" } },
    { id: "career", label: { zh: "事业", en: "Career" } },
    { id: "health", label: { zh: "健康", en: "Health" } },
    { id: "luck", label: { zh: "好运", en: "Luck" } },
    { id: "inspiration", label: { zh: "灵感", en: "Inspiration" } },
    { id: "study", label: { zh: "学业", en: "Study" } },
  ] as readonly Reward[],

  /** Appended to whichever reward was drawn. Identical in both languages. */
  increment: "+1",

  /** 32 × 32 PNG, hotspot at the centre. */
  cursor: "/cursor/wooden-fish.png",
  cursorHotspot: { x: 16, y: 16 },

  /**
   * The "struck" frame, swapped in while the pointer button is down.
   *
   * A CSS cursor is a static bitmap and cannot be animated, so the knock is
   * expressed the only way the platform allows: a second squashed frame with
   * impact ticks, held briefly on press. Both frames share the same 32px canvas
   * and hotspot so the swap does not jump.
   */
  cursorStruck: "/cursor/wooden-fish-struck.png",

  /** How long the struck frame stays up, so a fast click still registers. */
  strikeMs: 110,
} as const
