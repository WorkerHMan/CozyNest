"use client"

import { cn } from "@/lib/utils"

/**
 * The mascot, drawn by hand as SVG.
 *
 * ## Why it is drawn rather than imported
 *
 * Paimon's official model is miHoYo's copyrighted asset. Drawing the character
 * from scratch keeps this repo free of redistributed game material — the whole
 * point of choosing the SVG route over a Live2D port.
 *
 * ## Why everything is outlined
 *
 * The site defaults to a light theme with a near-white background, so white hair
 * on it would disappear. A dark contour around the silhouette (a sticker edge)
 * makes one palette work on both light and dark without a second colour ramp.
 *
 * `transform-box: fill-box` is what lets the groups below scale and rotate around
 * their own centres: SVG transforms default to the viewBox origin, which would
 * swing the eyes off the face.
 */
const FIGURE_CSS = `
@keyframes paimon-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2.5px); }
}
@keyframes paimon-blink {
  0%, 44%, 48%, 92%, 96%, 100% { transform: scaleY(1); }
  46%, 94%                     { transform: scaleY(0.08); }
}
@keyframes paimon-ahoge {
  0%, 100% { transform: rotate(0deg); }
  30%      { transform: rotate(4deg); }
  70%      { transform: rotate(-3deg); }
}
@keyframes paimon-shake {
  0%   { transform: rotate(0deg); }
  18%  { transform: rotate(-6deg); }
  38%  { transform: rotate(5deg); }
  58%  { transform: rotate(-3deg); }
  78%  { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
}
.paimon-bob   { animation: paimon-bob 3.6s ease-in-out infinite; }
.paimon-blink { animation: paimon-blink 6.4s steps(1, end) infinite; transform-box: fill-box; transform-origin: center; }
.paimon-ahoge { animation: paimon-ahoge 4.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
.paimon-shake { animation: paimon-shake 420ms cubic-bezier(0.34, 1.56, 0.64, 1); transform-box: fill-box; transform-origin: 50% 92%; }
.paimon-head  { transform-box: fill-box; transform-origin: 50% 88%; }

/* Speech bubble: pops in, then fades. The fade is scheduled with a delay equal
   to the bubble's lifetime, and the component unmounts after both. */
@keyframes paimon-bubble-in {
  from { opacity: 0; transform: translateY(4px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes paimon-bubble-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
`

const OUTLINE = "#1b2440"

export interface PaimonFigureProps {
  /** `poked` swaps to the happy closed eyes and open mouth. */
  mood: "idle" | "poked"
  /** Rendered width in CSS pixels; the height follows the viewBox ratio. */
  size: number
  className?: string
}

export function PaimonFigure({ mood, size, className }: PaimonFigureProps) {
  const poked = mood === "poked"

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={Math.round((size * 160) / 120)}
      className={cn("overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <style>{FIGURE_CSS}</style>
      <defs>
        <linearGradient id="paimon-eye" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fb4f5" />
          <stop offset="55%" stopColor="#3d6ad6" />
          <stop offset="100%" stopColor="#24408f" />
        </linearGradient>
      </defs>

      {/* Contact shadow: sells that the figure floats just above the surface. */}
      <ellipse cx="60" cy="147" rx="24" ry="5.5" fill="#0a0f1f" opacity="0.16" />

      <g className="paimon-bob">
        {/* Cloak: the top edge curves up to the chin so the head is not floating
          above a separate box. */}
        <path
          d="M36 88 C28 100 26 126 28 138 L38 133 L46 142 L60 134 L74 142 L82 133 L92 138 C94 126 92 100 84 88 Z"
          fill="#26365e"
          stroke={OUTLINE}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Collar. */}
        <path d="M50 88 L60 100 L70 88" fill="#1d2a4a" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
        {/* Cloak stars. */}
        <g fill="#f4c76a">
          <path d="M46 112 l1.8 4.4 4.4 1.8 -4.4 1.8 -1.8 4.4 -1.8 -4.4 -4.4 -1.8 4.4 -1.8 z" />
          <path d="M62 120 l1.6 3.9 3.9 1.6 -3.9 1.6 -1.6 3.9 -1.6 -3.9 -3.9 -1.6 3.9 -1.6 z" />
          <path d="M76 108 l1.5 3.6 3.6 1.5 -3.6 1.5 -1.5 3.6 -1.5 -3.6 -3.6 -1.5 3.6 -1.5 z" />
        </g>

        {/* Little hands peeking out of the cloak. */}
        <ellipse cx="27" cy="113" rx="5" ry="6.5" fill="#fdeee2" stroke={OUTLINE} strokeWidth="2" />
        <ellipse cx="93" cy="113" rx="5" ry="6.5" fill="#fdeee2" stroke={OUTLINE} strokeWidth="2" />

        {/* Head: follows the pointer via --paimon-px / -py / -pr. */}
        <g
          className="paimon-head"
          style={{
            transform:
              "translate(var(--paimon-px, 0px), var(--paimon-py, 0px)) rotate(var(--paimon-pr, 0deg))",
          }}
        >
          {/* Hair mass. */}
          <ellipse cx="60" cy="50" rx="35" ry="33" fill="#ffffff" stroke={OUTLINE} strokeWidth="2.4" />
          {/* Face: drawn over the hair so a white rim is left as the hairline.
              No separate side locks: at 110 px they read as ears rather than hair. */}
          <ellipse cx="60" cy="66" rx="27" ry="24" fill="#fdeee2" />
          {/* Fringe: three scallops that stop above the eyes, leaving the brow clear. */}
          <path
            d="M33 56 C37 42 47 37 60 37 C73 37 83 42 87 56 C83 50 77 48 73 54 C70 46 64 45 60 52 C56 45 50 46 47 54 C43 48 37 50 33 56 Z"
            fill="#ffffff"
            stroke={OUTLINE}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Ahoge — the curl that does most of the "this is Paimon" work. */}
          <g className="paimon-ahoge">
            <path
              d="M60 24 C59 13 52 6 45 10 C40 13 43 19 49 18"
              fill="none"
              stroke={OUTLINE}
              strokeWidth="3.8"
              strokeLinecap="round"
            />
            <path
              d="M60 24 C59 13 52 6 45 10 C40 13 43 19 49 18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          {/* Star hairpin. */}
          <path
            d="M86 30 l2.4 6.2 6.2 2.4 -6.2 2.4 -2.4 6.2 -2.4 -6.2 -6.2 -2.4 6.2 -2.4 z"
            fill="#f4c76a"
            stroke={OUTLINE}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          {poked ? (
            /* Happy squeezed eyes + open mouth. */
            <g>
              <path d="M40 66 q8 -8 16 0" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
              <path d="M64 66 q8 -8 16 0" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="60" cy="80" rx="5" ry="4.2" fill="#a83c50" stroke={OUTLINE} strokeWidth="1.8" />
            </g>
          ) : (
            <g>
              <g className="paimon-blink">
                <ellipse cx="48" cy="66" rx="8.2" ry="9.4" fill="url(#paimon-eye)" stroke={OUTLINE} strokeWidth="1.8" />
                <ellipse cx="72" cy="66" rx="8.2" ry="9.4" fill="url(#paimon-eye)" stroke={OUTLINE} strokeWidth="1.8" />
                <circle cx="45.4" cy="62" r="3" fill="#ffffff" />
                <circle cx="69.4" cy="62" r="3" fill="#ffffff" />
                <circle cx="50.6" cy="70" r="1.5" fill="#ffffff" opacity="0.85" />
                <circle cx="74.6" cy="70" r="1.5" fill="#ffffff" opacity="0.85" />
              </g>
              <path d="M56 79 q4 3.4 8 0" fill="none" stroke={OUTLINE} strokeWidth="2.2" strokeLinecap="round" />
            </g>
          )}
        </g>
      </g>
    </svg>
  )
}

/**
 * The tiny mark left behind when the mascot is switched off: the same silhouette,
 * no animation, no interaction beyond the button that wraps it.
 */
export function PaimonSilhouette({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={Math.round((size * 160) / 120)}
      className={cn("overflow-visible", className)}
      aria-hidden
      focusable="false"
    >
      <ellipse cx="60" cy="52" rx="34" ry="33" fill="currentColor" opacity="0.55" />
      <path
        d="M38 98 C31 106 29 124 31 134 L42 130 L50 138 L60 131 L70 138 L78 130 L89 134 C91 124 89 106 82 98 Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  )
}
