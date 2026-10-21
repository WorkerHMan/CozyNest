import { heroPlayer } from "@/config/hero-player"

/**
 * The site's single audio engine.
 *
 * ## Why this is not a component
 *
 * The music has to keep playing while the visitor moves between pages. A player
 * rendered inside a page cannot do that: when the route changes the element is
 * hidden (and on a hard unmount, destroyed), taking the sound with it. So the
 * `<audio>` element is created imperatively, once, at module scope — outside any
 * React tree — and every piece of UI is only a *view* over this store.
 *
 * That has a second, less obvious benefit: there is exactly **one** audio
 * element no matter how many players are mounted. The hero player and the
 * bottom-left dock can both be on screen without doubling the sound.
 *
 * ## `ready`
 *
 * Creating the element is deferred until `start()`, which the hero player calls.
 * Without that, visiting `/blog` directly would boot the music and pop up a
 * dock the visitor never asked for. `ready` therefore means "the cover started
 * this", and the dock keys off it — so music *continues* across pages but never
 * *begins* on an inner one.
 *
 * ## Contract with React
 *
 * `getSnapshot` returns a **cached object** that only changes when the state
 * actually changes. `useSyncExternalStore` compares snapshots by identity, so
 * returning a fresh object each call would loop forever. The server snapshot is
 * one frozen constant so hydration matches.
 */
export interface AudioState {
  index: number
  playing: boolean
  unavailable: boolean
  blocked: boolean
  /** True once the cover has started playback; gates the dock. */
  ready: boolean
  /** Playback position in seconds. */
  currentTime: number
  /** Track length in seconds; 0 until metadata arrives. */
  duration: number
  /** 0–1, mirrored onto the element. */
  volume: number
  /** How the playlist advances when a track ends. */
  mode: PlayMode
}

/** 顺序 → 单曲循环 → 随机. Cycled by one button, so it is a short union. */
export type PlayMode = "sequence" | "repeatOne" | "shuffle"

const { tracks } = heroPlayer

const SERVER_SNAPSHOT: AudioState = {
  index: 0,
  playing: false,
  unavailable: false,
  blocked: false,
  ready: false,
  currentTime: 0,
  duration: 0,
  volume: heroPlayer.volume,
  mode: "sequence",
}

let audio: HTMLAudioElement | null = null
let state: AudioState = SERVER_SNAPSHOT
let snapshot: AudioState = SERVER_SNAPSHOT

/**
 * Web Audio graph for the visualiser.
 *
 * `createMediaElementSource` may be called **once** per element, and it reroutes
 * all of that element's output through the graph — so the analyser is connected
 * straight to `destination`, otherwise the music would go silent. Everything is
 * wrapped in try/catch: where Web Audio is unavailable the page falls back to a
 * decorative pulse instead of failing.
 */
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null

export function getAnalyser(): AnalyserNode | null {
  return analyser
}

/**
 * Builds (once) and resumes the Web Audio graph.
 *
 * **Call this from a user gesture** — the play button. An `AudioContext` created
 * outside a gesture starts suspended, and a suspended context reports an
 * all-zero spectrum, which looks exactly like "the visualiser ignores the music".
 * That was the bug: the graph used to be built at mount from the visualiser, so
 * it never received data.
 */
export function resumeAnalyser() {
  if (typeof window === "undefined") return
  if (!audio) ensureAudio()
  if (!audio) return

  if (!audioContext) {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return

      audioContext = new Ctor()
      const source = audioContext.createMediaElementSource(audio)
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.72
      source.connect(analyser)
      analyser.connect(audioContext.destination)
    } catch {
      analyser = null
      audioContext = null
      return
    }
  }

  if (audioContext.state === "suspended") void audioContext.resume().catch(() => undefined)
}

const listeners = new Set<() => void>()

function emit(patch: Partial<AudioState>) {
  state = { ...state, ...patch }
  snapshot = state
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): AudioState {
  return snapshot
}

export function getServerSnapshot(): AudioState {
  return SERVER_SNAPSHOT
}

export function trackAt(index: number) {
  return tracks[index]
}

/** Creates the element exactly once and wires every media event. */
function ensureAudio(): HTMLAudioElement | null {
  if (audio) return audio
  if (typeof window === "undefined") return null

  const element = new Audio()
  element.volume = state.volume
  // No bytes fetched until playback is actually wanted.
  element.preload = "none"
  element.src = tracks[state.index].src

  element.addEventListener("play", () => emit({ playing: true, blocked: false }))
  element.addEventListener("pause", () => emit({ playing: false }))
  element.addEventListener("canplay", () => emit({ unavailable: false }))
  /**
   * What happens at the end of a track. Read from `state` rather than a closure
   * so the button that cycles the mode takes effect immediately.
   */
  element.addEventListener("ended", () => {
    if (state.mode === "repeatOne") {
      element.currentTime = 0
      void element.play().catch(() => undefined)
      return
    }
    if (state.mode === "shuffle" && tracks.length > 1) {
      let pick = Math.floor(Math.random() * tracks.length)
      if (pick === state.index) pick = (pick + 1) % tracks.length
      goTo(pick, true)
      return
    }
    next(true)
  })
  // `timeupdate` fires a handful of times per second, which is enough to drive
  // the progress bar without re-rendering on every animation frame.
  element.addEventListener("timeupdate", () => emit({ currentTime: element.currentTime }))
  element.addEventListener("loadedmetadata", () => emit({ duration: element.duration || 0 }))
  element.addEventListener("durationchange", () => emit({ duration: element.duration || 0 }))
  element.addEventListener("error", () => {
    // A src swap aborts the in-flight load and fires `error` with
    // MEDIA_ERR_ABORTED. Only network / decode / unsupported-source failures
    // mean the track is genuinely unplayable.
    const code = element.error?.code
    if (code === 2 || code === 3 || code === 4) emit({ unavailable: true })
  })

  audio = element
  emit({ ready: true })
  return element
}

/**
 * Called by the cover player: boots the engine, and **stays silent**.
 *
 * Music is off by default. Autoplay was removed deliberately — sound that starts
 * without being asked for is a nuisance on a site someone opened to read, and
 * browsers block it anyway. `preload = "none"` means arming the element fetches
 * no bytes; the first byte moves when the visitor presses play.
 */
export function start() {
  ensureAudio()
}

export function goTo(nextIndex: number, resume: boolean) {
  const element = ensureAudio()
  // A new track is not a broken track, and its clock starts over.
  emit({ index: nextIndex, unavailable: false, currentTime: 0, duration: 0 })
  if (!element) return
  element.src = tracks[nextIndex].src
  if (resume) element.play().catch(() => emit({ blocked: true }))
}

/** Jump to a position, in seconds. Used by the draggable progress bar. */
export function seek(time: number) {
  if (!audio) return
  audio.currentTime = time
  emit({ currentTime: time })
}

/** 0–1. Clamped, and applied to the element so the change is audible at once. */
export function setVolume(level: number) {
  const clamped = Math.min(1, Math.max(0, level))
  if (audio) audio.volume = clamped
  emit({ volume: clamped })
}

const MODES: readonly PlayMode[] = ["sequence", "repeatOne", "shuffle"]

/** Cycles 顺序 → 单曲循环 → 随机 → 顺序. */
export function cycleMode() {
  const index = MODES.indexOf(state.mode)
  emit({ mode: MODES[(index + 1) % MODES.length] })
}

export function next(resume: boolean) {
  goTo((state.index + 1) % tracks.length, resume)
}

export function previous(resume: boolean) {
  goTo((state.index - 1 + tracks.length) % tracks.length, resume)
}

export function toggle() {
  const element = ensureAudio()
  if (!element) return
  if (state.playing) {
    element.pause()
    return
  }
  emit({ unavailable: false })
  element.play().catch(() => emit({ unavailable: true }))
}

export function pause() {
  audio?.pause()
}
