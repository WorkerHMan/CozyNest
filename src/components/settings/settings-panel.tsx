"use client"

import { RotateCcw, Settings2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  radiusRange,
  themeColorOptions,
  type Settings,
} from "@/config/settings"
import type { Dictionary } from "@/i18n"
import {
  getServerSettings,
  getSettings,
  resetSettings,
  subscribeSettings,
  updateSettings,
} from "@/lib/settings-store"
import { cn } from "@/lib/utils"

const subscribeNothing = () => () => {}

type Mode = "light" | "dark" | "system"

function Row({
  label,
  value,
  children,
}: {
  label: string
  value?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        {value ? (
          <span className="font-mono text-xs text-muted-foreground">{value}</span>
        ) : null}
      </div>
      {children}
    </div>
  )
}

/**
 * Segmented control built on native radio inputs: keyboard arrow navigation,
 * group semantics and focus handling come from the platform rather than from
 * hand-written key handlers.
 */
function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <div
      className="grid gap-1 rounded-lg bg-muted p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <label key={option.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span
            className={cn(
              "flex h-8 items-center justify-center rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-200",
              "hover:text-foreground",
              "peer-checked:bg-card peer-checked:text-card-foreground peer-checked:shadow-sm",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-muted"
            )}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}

export function SettingsPanel({
  labels,
  themeLabels,
}: {
  labels: Dictionary["settings"]
  themeLabels: Dictionary["actions"]
}) {
  const settings: Settings = useSyncExternalStore(
    subscribeSettings,
    getSettings,
    getServerSettings
  )
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false
  )
  const currentTheme: Mode =
    mounted && (theme === "light" || theme === "dark") ? theme : "system"

  const colorLabels: Record<(typeof themeColorOptions)[number], string> = {
    green: labels.colorGreen,
    cyan: labels.colorCyan,
    violet: labels.colorViolet,
    amber: labels.colorAmber,
    rose: labels.colorRose,
    blue: labels.colorBlue,
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={labels.open}
          title={labels.open}
          className={cn(
            "size-10 sm:size-8",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
        >
          <Settings2 aria-hidden className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-80 gap-0 p-0"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="font-heading text-base">{labels.title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <Row label={labels.darkMode}>
            <Segmented
              name="settings-theme"
              value={currentTheme}
              onChange={(next) => setTheme(next)}
              options={[
                { value: "light", label: themeLabels.themeLight },
                { value: "dark", label: themeLabels.themeDark },
                { value: "system", label: themeLabels.themeSystem },
              ]}
            />
          </Row>

          <Row label={labels.font}>
            <Segmented
              name="settings-font"
              value={settings.font}
              onChange={(font) => updateSettings({ font })}
              options={[
                { value: "sans", label: labels.fontSans },
                { value: "serif", label: labels.fontSerif },
              ]}
            />
          </Row>

          <Row label={labels.shadow}>
            <Segmented
              name="settings-shadow"
              value={settings.shadow}
              onChange={(shadow) => updateSettings({ shadow })}
              options={[
                { value: "shallow", label: labels.shadowShallow },
                { value: "deep", label: labels.shadowDeep },
              ]}
            />
          </Row>

          <Row label={labels.filter}>
            <Segmented
              name="settings-filter"
              value={settings.filter}
              onChange={(filter) => updateSettings({ filter })}
              options={[
                { value: "off", label: labels.filterOff },
                { value: "sunset", label: labels.filterSunset },
                { value: "darken", label: labels.filterDarken },
                { value: "grayscale", label: labels.filterGrayscale },
              ]}
            />
          </Row>

          <Row label={labels.radius} value={`${settings.radius}px`}>
            <input
              type="range"
              min={radiusRange.min}
              max={radiusRange.max}
              step={radiusRange.step}
              value={settings.radius}
              onChange={(e) => updateSettings({ radius: Number(e.target.value) })}
              aria-label={labels.radius}
              className={cn(
                "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-brand",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            />
          </Row>

          <Row label={labels.themeColor}>
            {/* Each swatch sets its own `data-theme-color`, so it renders the
                preset's real `--brand` and can never drift from the stylesheet. */}
            <div className="flex flex-wrap gap-2.5">
              {themeColorOptions.map((color) => (
                <label key={color} className="cursor-pointer" data-theme-color={color}>
                  <input
                    type="radio"
                    name="settings-theme-color"
                    value={color}
                    checked={settings.themeColor === color}
                    onChange={() => updateSettings({ themeColor: color })}
                    className="peer sr-only"
                    aria-label={colorLabels[color]}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "block size-8 rounded-full bg-[var(--brand)] ring-1 ring-border-strong transition-transform duration-200",
                      "peer-checked:ring-2 peer-checked:ring-ring peer-checked:ring-offset-2 peer-checked:ring-offset-card",
                      "peer-hover:scale-110 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                    )}
                  />
                </label>
              ))}
            </div>
          </Row>
        </div>

        <div className="border-t p-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="w-full"
          >
            <RotateCcw aria-hidden className="size-3.5" />
            {labels.reset}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
