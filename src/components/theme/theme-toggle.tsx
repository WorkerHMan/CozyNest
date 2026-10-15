"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ThemeLabels {
  light: string
  dark: string
  system: string
}

const modes = ["light", "dark", "system"] as const
type Mode = (typeof modes)[number]

const isMode = (value: string | undefined): value is Mode =>
  typeof value === "string" && (modes as readonly string[]).includes(value)

/** The snapshot never changes, so there is nothing to subscribe to. */
const subscribe = () => () => {}

/**
 * Cycles light → dark → system.
 *
 * The `useSyncExternalStore` pair is the lint-clean way to answer "are we
 * hydrating?": the server and the first client render both see `false`, so the
 * label never mismatches, and no effect has to set state on mount. The icon is
 * chosen purely in CSS from the `dark` class next-themes sets before paint.
 */
export function ThemeToggle({
  labels,
  buttonLabel,
}: {
  labels: ThemeLabels
  buttonLabel: string
}) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  const current: Mode = mounted && isMode(theme) ? theme : "system"
  const next: Mode = modes[(modes.indexOf(current) + 1) % modes.length]

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => setTheme(next)}
      aria-label={`${buttonLabel}: ${labels[current]}`}
      title={`${labels[current]} → ${labels[next]}`}
      className={cn(
        "size-10 sm:size-8",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <Sun aria-hidden className="size-4 dark:hidden" />
      <Moon aria-hidden className="hidden size-4 dark:block" />
    </Button>
  )
}
