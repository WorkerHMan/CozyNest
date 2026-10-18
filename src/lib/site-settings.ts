/**
 * The site's small settings store.
 *
 * ## Why a module-level store
 *
 * The carousel's autoplay state is read by two different places — the pause
 * button inside the cover and the switch inside the settings drawer. Two local
 * `useState`s would let them disagree ("the drawer says on, the cover is
 * stopped"), so both read this one store instead.
 *
 * ## Why settings are loaded after mount
 *
 * `localStorage` does not exist during prerender. Reading it in `getSnapshot`
 * would make the server render the defaults and the client render the stored
 * values, which is a hydration mismatch. So the store starts on the defaults,
 * the first mounted consumer calls `hydrate()`, and the real values arrive on
 * the next render.
 *
 * The snapshot is cached and only replaced on change, because
 * `useSyncExternalStore` compares by identity — a fresh object every call would
 * loop forever.
 */
export interface PaimonPosition {
  /** Centre of the mascot, as a percentage of viewport width. */
  x: number
  /** Centre of the mascot, as a percentage of viewport height. */
  y: number
}

export interface SiteSettings {
  /** The cover carousel rotates on its own. */
  carouselAutoplay: boolean
  /** The mascot is on screen (otherwise only the faint handle remains). */
  paimonEnabled: boolean
  /** `null` means "use the default spot". */
  paimonPosition: PaimonPosition | null
}

const STORAGE_KEY = "cozynest:settings"

const DEFAULTS: SiteSettings = {
  carouselAutoplay: true,
  paimonEnabled: true,
  paimonPosition: null,
}

let state: SiteSettings = DEFAULTS
let snapshot: SiteSettings = DEFAULTS
let hydrated = false

const listeners = new Set<() => void>()

function emit(next: SiteSettings) {
  state = next
  snapshot = next
  for (const listener of listeners) listener()
}

/**
 * Anything may be in storage: another version's shape, hand-edited JSON, or a
 * quota error's leftovers. Read defensively and fall back field by field — a
 * broken preference must never break the page.
 */
function readStored(): SiteSettings {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<SiteSettings>
    const position = parsed.paimonPosition
    return {
      carouselAutoplay:
        typeof parsed.carouselAutoplay === "boolean"
          ? parsed.carouselAutoplay
          : DEFAULTS.carouselAutoplay,
      paimonEnabled:
        typeof parsed.paimonEnabled === "boolean"
          ? parsed.paimonEnabled
          : DEFAULTS.paimonEnabled,
      paimonPosition:
        position &&
        typeof position.x === "number" &&
        typeof position.y === "number" &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.y)
          ? { x: position.x, y: position.y }
          : null,
    }
  } catch {
    return DEFAULTS
  }
}

function persist(next: SiteSettings) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full or blocked (private mode). The setting still applies for
    // this session; it just will not be remembered.
  }
}

/** Runs once, from the first mounted consumer. */
export function hydrate() {
  if (hydrated) return
  hydrated = true
  emit(readStored())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): SiteSettings {
  return snapshot
}

export function getServerSnapshot(): SiteSettings {
  return DEFAULTS
}

export function update(patch: Partial<SiteSettings>) {
  emit({ ...state, ...patch })
  persist(state)
}
