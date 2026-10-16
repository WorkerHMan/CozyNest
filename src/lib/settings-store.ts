"use client"

import {
  defaultSettings,
  radiusRange,
  settingsStorageKey,
  type Settings,
} from "@/config/settings"

/**
 * A tiny external store for the settings.
 *
 * `useSyncExternalStore` is used rather than `useEffect` + `useState` because
 * the React 19 lint rule forbids setting state synchronously inside an effect,
 * and because it gives a correct hydration story for free: the server snapshot
 * is always the defaults, so markup matches, and the real stored values arrive
 * on the client without a mismatch.
 *
 * The <html> attributes are written by the pre-paint script and by `update()`;
 * React never renders them, so they cannot drift.
 */

const listeners = new Set<() => void>()
let cache: Settings | null = null

function coerce(raw: unknown): Settings {
  const o = (raw ?? {}) as Partial<Settings>
  return {
    font: o.font === "serif" ? "serif" : defaultSettings.font,
    shadow: o.shadow === "deep" ? "deep" : defaultSettings.shadow,
    filter:
      o.filter === "sunset" || o.filter === "darken" || o.filter === "grayscale"
        ? o.filter
        : defaultSettings.filter,
    themeColor:
      o.themeColor === "cyan" ||
      o.themeColor === "violet" ||
      o.themeColor === "amber" ||
      o.themeColor === "rose" ||
      o.themeColor === "blue" ||
      o.themeColor === "green"
        ? o.themeColor
        : defaultSettings.themeColor,
    radius:
      typeof o.radius === "number" && Number.isFinite(o.radius)
        ? Math.min(radiusRange.max, Math.max(radiusRange.min, o.radius))
        : defaultSettings.radius,
  }
}

function read(): Settings {
  try {
    return coerce(JSON.parse(localStorage.getItem(settingsStorageKey) ?? "{}"))
  } catch {
    return defaultSettings
  }
}

/** Writes the settings onto <html>. Mirrors what the pre-paint script does. */
function apply(next: Settings) {
  const d = document.documentElement
  d.setAttribute("data-font", next.font)
  d.setAttribute("data-shadow", next.shadow)
  d.setAttribute("data-filter", next.filter)
  d.setAttribute("data-theme-color", next.themeColor)
  d.style.setProperty("--radius", `${next.radius / 16}rem`)
}

export function subscribeSettings(cb: () => void): () => void {
  listeners.add(cb)
  if (listeners.size === 1 && typeof window !== "undefined") {
    // Keep multiple tabs in sync.
    window.addEventListener("storage", onStorage)
  }
  return () => {
    listeners.delete(cb)
    if (listeners.size === 0) window.removeEventListener("storage", onStorage)
  }
}

function onStorage(event: StorageEvent) {
  if (event.key !== settingsStorageKey && event.key !== null) return
  cache = read()
  apply(cache)
  listeners.forEach((cb) => cb())
}

export function getSettings(): Settings {
  cache ??= read()
  return cache
}

/** Server render always uses the defaults, so hydration cannot mismatch. */
export function getServerSettings(): Settings {
  return defaultSettings
}

export function updateSettings(patch: Partial<Settings>) {
  const next = coerce({ ...getSettings(), ...patch })
  cache = next
  try {
    localStorage.setItem(settingsStorageKey, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode); the DOM still updates for now.
  }
  apply(next)
  listeners.forEach((cb) => cb())
}

export function resetSettings() {
  updateSettings(defaultSettings)
}

export function settingsEqual(a: Settings, b: Settings): boolean {
  return (
    a.font === b.font &&
    a.shadow === b.shadow &&
    a.filter === b.filter &&
    a.themeColor === b.themeColor &&
    a.radius === b.radius
  )
}
