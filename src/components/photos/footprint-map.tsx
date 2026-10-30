"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { CHINA_VIEWBOX, chinaPaths, projectChina } from "@/generated/geo"
import { photosLabels } from "@/config/photos-labels"
import { placeName } from "@/lib/album/place-name"
import { dotRadius, type CityAggregate } from "@/lib/album/stats"
import type { Place } from "@/lib/album/types"
import type { Locale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const MIN_ZOOM = 1
const MAX_ZOOM = 6
/** A press that travels further than this is a pan, not a click. */
const DRAG_SLOP = 4

interface View {
  k: number
  x: number
  y: number
}

const HOME: View = { k: 1, x: 0, y: 0 }

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * The footprint map: the country as a lit plate, cities as pillars.
 *
 * ## Why hand-rolled pan and zoom
 *
 * The outlines are projected at build time, so the interaction is one transform on
 * one `<g>`. A pan/zoom library would add a dependency to move two numbers, and
 * `d3-zoom` would take over the pointer handling that the drag threshold below
 * depends on. Thirty lines here do the whole job.
 *
 * ## Height means count
 *
 * Each city is a column: a vertical rule whose length grows with the number of
 * photos, capped so one busy city cannot skew the plate, with a soft shadow under
 * it. The dot sits on top of the column, so "taller" and "bigger dot" say the same
 * thing twice — colour alone would not carry it.
 *
 * ## Accessibility
 *
 * No `role="img"` on the `<svg>`: that makes every link inside it presentational,
 * which is exactly how the map became unreachable. The landmass is `aria-hidden`;
 * each city is a real link whose `<title>` names it.
 */
export function FootprintMap({
  places,
  aggregates,
  locale,
}: {
  places: readonly Place[]
  aggregates: CityAggregate[]
  locale: Locale
}) {
  const label = (key: keyof typeof photosLabels) => photosLabels[key][locale]
  const [view, setView] = useState<View>(HOME)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{
    id: number
    startX: number
    startY: number
    baseX: number
    baseY: number
    moved: boolean
  } | null>(null)
  const suppressClick = useRef(false)

  const byId = new Map(places.map((place) => [place.id, place]))
  const busiest = aggregates.reduce((max, city) => Math.max(max, city.count), 0)

  const zoomBy = useCallback((factor: number) => {
    setView((current) => {
      const k = clamp(current.k * factor, MIN_ZOOM, MAX_ZOOM)
      const ratio = k / current.k
      return { k, x: current.x * ratio, y: current.y * ratio }
    })
  }, [])

  // Wheel zoom needs a non-passive listener; React's onWheel is passive.
  useEffect(() => {
    const node = svgRef.current
    if (!node) return

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const k = clamp(view.k * (event.deltaY < 0 ? 1.15 : 1 / 1.15), MIN_ZOOM, MAX_ZOOM)
      const rect = node!.getBoundingClientRect()
      const scale = 600 / rect.width
      // Zoom towards the pointer: the point under the cursor stays under it.
      const px = (event.clientX - rect.left) * scale
      const py = (event.clientY - rect.top) * scale
      const ratio = k / view.k
      setView({ k, x: px - (px - view.x) * ratio, y: py - (py - view.y) * ratio })
    }

    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [view])

  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    suppressClick.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: view.x,
      baseY: view.y,
      moved: false,
    }
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    const node = svgRef.current
    if (!node) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.moved && Math.hypot(dx, dy) < DRAG_SLOP) return
    state.moved = true
    const scale = 600 / node.getBoundingClientRect().width
    setView((current) => ({ ...current, x: state.baseX + dx * scale, y: state.baseY + dy * scale }))
  }

  function endDrag() {
    if (drag.current?.moved) suppressClick.current = true
    drag.current = null
  }

  if (aggregates.length === 0) {
    return (
      <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 text-center">
        <p className="text-sm text-muted-foreground">{label("noPlaces")}</p>
      </div>
    )
  }

  return (
    <figure className="relative">
      <svg
        ref={svgRef}
        viewBox={CHINA_VIEWBOX}
        className="w-full cursor-grab touch-none rounded-2xl border border-border/60 bg-muted/20 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          {/* A lit plate: brighter top-left, so the landmass reads as a surface
              with light falling on it rather than a flat silhouette. */}
          <linearGradient id="nest-land" x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {/* Neighbours are context, not content: a flat neutral fill with a
              hairline. Tinting every country green (the first attempt) flattened
              the whole plate into one pale wash and China stopped reading as a
              place at all. The brand colour is reserved for the city pillars. */}
          <g aria-hidden className="fill-muted-foreground/10 stroke-border/60" strokeWidth={0.5}>
            {chinaPaths.map((d, index) => (
              <path key={index} d={d} />
            ))}
          </g>

          {aggregates.map((city) => {
            const place = byId.get(city.placeId)
            if (!place) return null
            const [x, y] = projectChina(place.lon, place.lat)
            const radius = dotRadius(city.count, busiest)
            // 6 to 26 units: the busiest city is ~4x the quietest, never a spike.
            const rise = 6 + 20 * Math.sqrt(city.count / Math.max(1, busiest))
            const name = placeName(place, locale)

            return (
              <a
                key={city.placeId}
                href={`/photos/place/${city.placeId}`}
                className={cn("group", focusRing)}
                onClick={(event) => {
                  if (suppressClick.current) {
                    event.preventDefault()
                    suppressClick.current = false
                  }
                }}
              >
                {/* Column + shadow: that pair is what reads as height without
                    any 3D projection. */}
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={y + rise}
                  className="stroke-brand/45"
                  strokeWidth={Math.max(1, radius * 0.5)}
                  strokeLinecap="round"
                />
                <ellipse
                  cx={x}
                  cy={y + rise + 1.5}
                  rx={radius * 1.1}
                  ry={radius * 0.5}
                  className="fill-black/25"
                />
                <circle cx={x} cy={y} r={radius} className="fill-brand" />
                <circle cx={x} cy={y} r={radius} className="fill-transparent stroke-white/40" strokeWidth={0.6} />
                {/* The plate scales with its container, so the touch target has
                    to be generous in user units: r=44 holds up at phone widths. */}
                <circle cx={x} cy={y} r={44} fill="transparent" />
                <title>{`${name} · ${city.count}`}</title>
              </a>
            )
          })}
        </g>
      </svg>

      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {(
          [
            ["+", () => zoomBy(1.3), locale === "zh" ? "放大" : "Zoom in"],
            ["−", () => zoomBy(1 / 1.3), locale === "zh" ? "缩小" : "Zoom out"],
            ["⟲", () => setView(HOME), locale === "zh" ? "复位" : "Reset view"],
          ] as const
        ).map(([glyph, action, name]) => (
          <button
            key={glyph}
            type="button"
            onClick={action}
            aria-label={name}
            className={cn(
              "grid size-9 place-items-center rounded-lg border border-border/70 bg-background/80 font-mono text-sm backdrop-blur-md transition-colors duration-200 hover:text-foreground",
              focusRing
            )}
          >
            {glyph}
          </button>
        ))}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[0.6875rem] text-muted-foreground">
        <span>{label("mapHint")}</span>
        <span aria-hidden className="text-border">·</span>
        <span>{locale === "zh" ? "拖动平移 · 滚轮缩放" : "Drag to pan · wheel to zoom"}</span>
      </figcaption>
    </figure>
  )
}
