"use client"

import { Pause, Play, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { Dictionary } from "@/i18n"

const SIZE = 17
const TICK_MS = 140
const BEST_KEY = "cozynest.snake.best"

type Cell = { x: number; y: number }

interface Game {
  snake: Cell[]
  food: Cell
  dir: Cell
  score: number
  dead: boolean
}

/**
 * Initial positions are constants, not random: the first render must be
 * identical on the server and the client or hydration mismatches. Randomness
 * only enters from inside `step`, which runs from a timer — never during render.
 */
const INITIAL: Game = {
  snake: [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 },
  ],
  food: { x: 12, y: 8 },
  dir: { x: 1, y: 0 },
  score: 0,
  dead: false,
}

const DIRECTIONS: Record<string, Cell> = {
  arrowup: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  arrowleft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
}

const isReversal = (from: Cell, to: Cell) => from.x + to.x === 0 && from.y + to.y === 0

function randomCell(occupied: readonly Cell[]): Cell {
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    }
    if (!occupied.some((c) => c.x === candidate.x && c.y === candidate.y)) {
      return candidate
    }
  }
  // Board essentially full; reusing a cell is harmless.
  return { x: 0, y: 0 }
}

/**
 * One pure tick. Keeping the whole game in a single updater means the interval
 * never reads stale state and never needs a ref — which is also what the React
 * Compiler lint rule requires (no ref access reachable from render).
 */
function step(game: Game): Game {
  if (game.dead) return game

  const head = {
    x: game.snake[0].x + game.dir.x,
    y: game.snake[0].y + game.dir.y,
  }

  const hitWall = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE
  const hitSelf = game.snake.some((c) => c.x === head.x && c.y === head.y)
  if (hitWall || hitSelf) return { ...game, dead: true }

  const ate = head.x === game.food.x && head.y === game.food.y
  const snake = ate ? [head, ...game.snake] : [head, ...game.snake.slice(0, -1)]

  return {
    snake,
    food: ate ? randomCell(snake) : game.food,
    dir: game.dir,
    score: ate ? game.score + 1 : game.score,
    dead: false,
  }
}

/**
 * Snake.
 *
 * Playable with arrow keys / WASD and with the on-screen pad, so it is not
 * keyboard-only. The 17×17 grid is `aria-hidden` because a grid of empty cells
 * means nothing to a screen reader; score, best and running state are carried
 * as text and in an `aria-live` region instead. That is an honest limitation
 * rather than a claim of full accessibility.
 */
export function SnakeGame({ labels }: { labels: Dictionary["pages"]["tools"] }) {
  const [game, setGame] = useState<Game>(INITIAL)
  const [intent, setIntent] = useState(false)
  const [best, setBest] = useState(0)

  const running = intent && !game.dead

  // The best score is read after mount: reading localStorage during render
  // would break hydration, and setting state in an effect body is rejected by
  // lint, so it happens from a timer callback.
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const stored = Number(localStorage.getItem(BEST_KEY) ?? 0)
        if (Number.isFinite(stored) && stored > 0) setBest(stored)
      } catch {
        // Storage unavailable; the in-session score still works.
      }
    }, 0)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setGame((previous) => step(previous)), TICK_MS)
    return () => clearInterval(id)
  }, [running])

  // Persist the best score once the game ends.
  useEffect(() => {
    if (!game.dead) return
    const id = setTimeout(() => {
      setBest((previous) => Math.max(previous, game.score))
      try {
        const stored = Number(localStorage.getItem(BEST_KEY) ?? 0)
        localStorage.setItem(
          BEST_KEY,
          String(Math.max(Number.isFinite(stored) ? stored : 0, game.score))
        )
      } catch {
        // Ignore: the score simply will not persist.
      }
    }, 0)
    return () => clearTimeout(id)
  }, [game.dead, game.score])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key === " " || key === "spacebar") {
        event.preventDefault()
        setIntent((value) => !value)
        return
      }
      const direction = DIRECTIONS[key]
      if (!direction) return
      event.preventDefault()
      setGame((previous) =>
        isReversal(previous.dir, direction)
          ? previous
          : { ...previous, dir: direction }
      )
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const turn = useCallback((direction: Cell) => {
    setGame((previous) =>
      isReversal(previous.dir, direction) ? previous : { ...previous, dir: direction }
    )
  }, [])

  const reset = useCallback(() => {
    setGame(INITIAL)
    setIntent(false)
  }, [])

  const cells = new Set(game.snake.map((c) => `${c.x},${c.y}`))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-base font-semibold">
          {labels.gameSnakeName}
        </h3>
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span aria-live="polite">
            {labels.scoreLabel} {game.score}
          </span>
          <span aria-hidden>·</span>
          <span>
            {labels.bestLabel} {best}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {labels.gameSnakeHint}
      </p>

      <div className="flex flex-wrap items-start gap-6">
        <div
          aria-hidden
          className="grid shrink-0 gap-px overflow-hidden rounded-lg border border-border-strong bg-border/60 p-px"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: SIZE * SIZE }, (_, index) => {
            const x = index % SIZE
            const y = Math.floor(index / SIZE)
            const part = cells.has(`${x},${y}`)
            const head = game.snake[0].x === x && game.snake[0].y === y
            const food = game.food.x === x && game.food.y === y
            return (
              <span
                key={index}
                className="size-3.5 sm:size-4"
                style={{
                  background: head
                    ? "var(--brand)"
                    : part
                      ? "color-mix(in oklab, var(--brand) 65%, var(--card))"
                      : food
                        ? "var(--destructive)"
                        : "var(--card)",
                }}
              />
            )
          })}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => (running ? setIntent(false) : setIntent(true))}
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {running ? (
                <>
                  <Pause aria-hidden className="size-3.5" />
                  {labels.pauseGame}
                </>
              ) : (
                <>
                  <Play aria-hidden className="size-3.5" />
                  {game.dead ? labels.restart : labels.startGame}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RotateCcw aria-hidden className="size-3.5" />
              {labels.restart}
            </Button>
          </div>

          {/* Direction pad, so steering is not keyboard-only. */}
          <div
            role="group"
            aria-label={labels.gameSnakeName}
            className="grid w-fit grid-cols-3 gap-1"
          >
            {PAD.map((slot, index) =>
              slot === null ? (
                <span key={`pad-${index}`} aria-hidden className="size-9" />
              ) : (
                <button
                  key={slot}
                  type="button"
                  aria-label={slot}
                  onClick={() => turn(PAD_MOVES[slot])}
                  className="size-9 rounded-md border border-border-strong bg-card text-xs font-medium outline-none transition-colors duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {PAD_ARROWS[slot]}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type PadDirection = "up" | "down" | "left" | "right"

const PAD: readonly (PadDirection | null)[] = [
  null,
  "up",
  null,
  "left",
  "down",
  "right",
]

const PAD_ARROWS: Record<PadDirection, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
}

const PAD_MOVES: Record<PadDirection, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
