import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CanvasStageProps {
  /**
   * Describes what the scene shows. Supply it when the scene carries meaning;
   * omit it for purely decorative scenes, which are then hidden from assistive
   * tech instead of being announced as an unlabelled image.
   */
  label?: string
  className?: string
  children?: ReactNode
}

/**
 * Reserved stage for the WebGL scenes planned for CozyNest.
 *
 * It exists now, before any Three.js code, to fix the three contracts that are
 * expensive to retrofit (from the ui-ux-pro-max `threejs` stack rules and the
 * persisted design system):
 *
 * 1. **Sizing** — the stage is sized by its own box, never the window, so a
 *    renderer can safely read `clientWidth`/`clientHeight` when it lives inside
 *    a grid or flex column.
 * 2. **Accessibility** — a WebGL canvas contributes nothing to the accessibility
 *    tree, so a meaningful scene needs `role="img"` plus a description. That is
 *    applied to the stage's future canvas element, and the wrapper takes it here.
 * 3. **Reduced motion** — ambient layers use `motion-safe:`/`motion-reduce:` so
 *    the scene resolves to its final, readable state rather than disappearing.
 *
 * When the renderer lands, mount it inside this element and set `antialias` in
 * the `WebGLRenderer` constructor (it cannot be enabled afterwards), then update
 * `camera.aspect` and call `updateProjectionMatrix()` from a resize observer.
 */
export function CanvasStage({ label, className, children }: CanvasStageProps) {
  const decorative = label === undefined

  return (
    <div
      data-slot="canvas-stage"
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      className={cn("canvas-stage", className)}
    >
      {children}
    </div>
  )
}
