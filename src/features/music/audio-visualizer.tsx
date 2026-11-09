"use client"

import { useEffect, useRef, useSyncExternalStore } from "react"

import {
  getAnalyser,
  getServerSnapshot,
  getSnapshot,
  resumeAnalyser,
  subscribe,
} from "@/lib/audio-store"

/**
 * The /music backdrop: a sphere of cubes that grows with the music.
 *
 * ## Nothing is drawn while nothing plays
 *
 * The sphere only exists during playback. A idle field of blocks draws the eye to
 * a page that is supposed to be a still cover, so `mesh.visible` follows the
 * player's `playing` flag — pause, and the scene empties.
 *
 * ## Shape
 *
 * Blocks sit on a sphere — 40 latitude rings by 80 columns — and each grows
 * **along its own normal**, so the surface bristles rather than sliding.
 *
 * ## Which cube answers to which note
 *
 * Latitude picks the band: the north pole reads the bass, the south pole the
 * treble. That turns the sphere into a 3D spectrogram — a low note lifts a cap at
 * the top, a bright one a band along the bottom — instead of every block
 * breathing together.
 *
 * ## Interaction
 *
 * Left-drag orbits (the same gesture as the reference); a click without movement
 * throws a ripple, measured as **angular** distance from the point pressed, so it
 * travels around the surface rather than across a plane.
 *
 * ## Instances
 *
 * One `InstancedMesh`: ~3.2k cubes, one draw call. `three` is imported
 * dynamically, `prefers-reduced-motion` renders a single frame, everything is
 * disposed on unmount.
 */
const LATITUDE_RINGS = 40
const LONGITUDE_COLUMNS = 80
const CUBE = 0.085
const MAX_RISE = 0.62
const RIPPLE_MS = 1500
const RIPPLE_SPEED = Math.PI * 0.9
/** Roughly the share of the spectrum that carries musical content. */
const BAND_SPAN = 0.65

interface Ripple {
  dir: { x: number; y: number; z: number }
  start: number
}

export function AudioVisualizer({ size = 2.6 }: { size?: number }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sizeRef = useRef(size)

  // Mirrored through an effect so the animation loop always reads the latest value.
  useEffect(() => {
    sizeRef.current = size
  }, [size])

  const { playing } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const playingRef = useRef(playing)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let frame = 0
    let teardown: (() => void) | undefined

    async function init() {
      const THREE = await import("three")
      if (disposed) return

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const width = host!.clientWidth || 1
      const height = host!.clientHeight || 1

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height)
      const canvas = renderer.domElement
      canvas.setAttribute("aria-hidden", "true")
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.display = "block"
      host!.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)

      /* Orbit state in radians. `polar` is measured from the vertical axis. */
      const orbit = { azimuth: 0.6, polar: 1.02, distance: 9.4 }
      const POLAR_MIN = 0.35
      const POLAR_MAX = 2.4
      const AUTO_SPIN = 0.000045

      function placeCamera() {
        const horizontal = Math.sin(orbit.polar) * orbit.distance
        camera.position.set(
          Math.sin(orbit.azimuth) * horizontal,
          Math.cos(orbit.polar) * orbit.distance,
          Math.cos(orbit.azimuth) * horizontal
        )
        camera.lookAt(0, 0, 0)
      }
      placeCamera()

      // Brand colour, read from the live token so the scene follows the theme.
      let accent = new THREE.Color(0x22d3ee)
      try {
        const probe = document.createElement("span")
        probe.style.color = "var(--brand)"
        probe.style.display = "none"
        document.body.appendChild(probe)
        const resolved = getComputedStyle(probe).color
        probe.remove()
        const parsed = new THREE.Color(resolved)
        if (parsed.getHex() !== 0xffffff) accent = parsed
      } catch {
        // Keep the default accent.
      }

      const count = LATITUDE_RINGS * LONGITUDE_COLUMNS
      const geometry = new THREE.BoxGeometry(CUBE, 1, CUBE)
      // Anchored at its base, so scaling grows outward from the surface.
      geometry.translate(0, 0.5, 0)
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const mesh = new THREE.InstancedMesh(geometry, material, count)
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      scene.add(mesh)

      /* Directions and per-cube base heights, decided once. */
      const directions: { x: number; y: number; z: number; theta: number }[] = []
      const baseHeights = new Float32Array(count)
      const heights = new Float32Array(count)
      for (let ring = 0; ring < LATITUDE_RINGS; ring += 1) {
        // 0 at the north pole, π at the south pole.
        const theta = (ring / (LATITUDE_RINGS - 1)) * Math.PI
        const sinTheta = Math.sin(theta)
        for (let column = 0; column < LONGITUDE_COLUMNS; column += 1) {
          const phi = (column / LONGITUDE_COLUMNS) * Math.PI * 2
          const index = ring * LONGITUDE_COLUMNS + column
          directions.push({
            x: sinTheta * Math.cos(phi),
            y: Math.cos(theta),
            z: sinTheta * Math.sin(phi),
            theta,
          })
          const hash = ((index * 2654435761) >>> 0) % 1000
          baseHeights[index] = 0.045 + (hash / 1000) * 0.05
          heights[index] = baseHeights[index]
        }
      }

      let bins = new Uint8Array(1024)
      const demo = window.location.search.includes("vizdemo")

      const dummy = new THREE.Object3D()
      const colour = new THREE.Color()
      const warm = accent.clone().offsetHSL(0.08, 0, 0.18)
      const up = new THREE.Vector3(0, 1, 0)
      const normal = new THREE.Vector3()
      const ripples: Ripple[] = []
      const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1)
      const ray = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const hitPoint = new THREE.Vector3()

      const drag = { active: false, x: 0, y: 0, moved: 0 }

      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return
        drag.active = true
        drag.x = event.clientX
        drag.y = event.clientY
        drag.moved = 0
        canvas.setPointerCapture(event.pointerId)
        canvas.style.cursor = "grabbing"
      }

      const onPointerMove = (event: PointerEvent) => {
        if (!drag.active) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        drag.x = event.clientX
        drag.y = event.clientY
        drag.moved += Math.abs(dx) + Math.abs(dy)
        orbit.azimuth -= dx * 0.005
        orbit.polar = Math.min(POLAR_MAX, Math.max(POLAR_MIN, orbit.polar + dy * 0.004))
        placeCamera()
      }

      const onPointerUp = (event: PointerEvent) => {
        if (!drag.active) return
        drag.active = false
        canvas.style.cursor = "grab"
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
        if (drag.moved > 6) return

        // A click without a drag: hit the sphere and remember the direction.
        const rect = canvas.getBoundingClientRect()
        ndc.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        )
        ray.setFromCamera(ndc, camera)
        sphere.radius = sizeRef.current
        if (!ray.ray.intersectSphere(sphere, hitPoint)) return
        const length = hitPoint.length() || 1
        ripples.push({
          dir: { x: hitPoint.x / length, y: hitPoint.y / length, z: hitPoint.z / length },
          start: performance.now(),
        })
        if (ripples.length > 4) ripples.shift()
      }

      canvas.style.cursor = "grab"
      canvas.addEventListener("pointerdown", onPointerDown)
      canvas.addEventListener("pointermove", onPointerMove)
      canvas.addEventListener("pointerup", onPointerUp)
      canvas.addEventListener("pointercancel", onPointerUp)

      function draw(time: number) {
        const analyser = getAnalyser()

        /* Nothing but the player decides whether the sphere exists. The demo flag
           overrides it so the scene can still be reviewed without audio. */
        const active = demo || playingRef.current
        mesh.visible = active
        if (!active) {
          renderer.render(scene, camera)
          return
        }

        if (demo) {
          for (let i = 0; i < bins.length; i += 1) {
            const x = i / bins.length
            const a = Math.exp(-((x - 0.12 - Math.sin(time / 2600) * 0.05) ** 2) / 0.004)
            const b = Math.exp(-((x - 0.36 - Math.sin(time / 1800) * 0.06) ** 2) / 0.002)
            const c = Math.exp(-((x - 0.66 - Math.sin(time / 1300) * 0.07) ** 2) / 0.003)
            bins[i] = Math.min(
              255,
              (a * 240 + b * 200 + c * 150) * (0.7 + Math.sin(time / 380 + i) * 0.3)
            )
          }
        } else if (analyser) {
          if (bins.length !== analyser.frequencyBinCount) {
            bins = new Uint8Array(analyser.frequencyBinCount)
          }
          analyser.getByteFrequencyData(bins)
        }

        const radius = sizeRef.current

        for (let i = 0; i < count; i += 1) {
          const dir = directions[i]

          /* Latitude chooses the band: north pole = bass, south pole = treble. */
          let band = 0
          if (demo || analyser) {
            const index = Math.min(
              bins.length - 1,
              Math.floor((dir.theta / Math.PI) * (bins.length - 1) * BAND_SPAN)
            )
            band = Math.sqrt(bins[index] / 255)
          }

          /* Ripples travel by angle, so they wrap around the surface. */
          let ripple = 0
          for (const wave of ripples) {
            const age = (time - wave.start) / RIPPLE_MS
            if (age < 0 || age > 1) continue
            const dot = Math.min(
              1,
              Math.max(-1, dir.x * wave.dir.x + dir.y * wave.dir.y + dir.z * wave.dir.z)
            )
            const angle = Math.acos(dot)
            const delta = Math.abs(angle - age * RIPPLE_SPEED)
            if (delta < 0.32) ripple += (1 - age) * (1 - delta / 0.32) * 0.7
          }

          /* Height: the cube's own base plus the amplitude of its band. */
          const target = baseHeights[i] + band * MAX_RISE
          heights[i] += (target - heights[i]) * 0.3
          const height = heights[i] + ripple * MAX_RISE * 1.4

          normal.set(dir.x, dir.y, dir.z)
          dummy.position.copy(normal).multiplyScalar(radius)
          // Point the box's +Y along the surface normal.
          dummy.quaternion.setFromUnitVectors(up, normal)
          dummy.scale.set(1, height, 1)
          dummy.updateMatrix()
          mesh.setMatrixAt(i, dummy.matrix)

          const heat = Math.min(1, height / (MAX_RISE * 1.2) + ripple * 0.3)
          colour.copy(accent).lerp(warm, heat).multiplyScalar(0.4 + heat * 0.85)
          mesh.setColorAt(i, colour)
        }

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

        if (!drag.active) {
          orbit.azimuth += AUTO_SPIN * 16
          placeCamera()
        }

        while (ripples.length > 0 && time - ripples[0].start > RIPPLE_MS) ripples.shift()

        renderer.render(scene, camera)
      }

      const tick = (time: number) => {
        draw(time)
        frame = requestAnimationFrame(tick)
      }

      const onResize = () => {
        const w = host!.clientWidth || 1
        const h = host!.clientHeight || 1
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }

      window.addEventListener("resize", onResize)

      if (reduce) {
        draw(0)
      } else {
        resumeAnalyser()
        frame = requestAnimationFrame(tick)
      }

      teardown = () => {
        canvas.removeEventListener("pointerdown", onPointerDown)
        canvas.removeEventListener("pointermove", onPointerMove)
        canvas.removeEventListener("pointerup", onPointerUp)
        canvas.removeEventListener("pointercancel", onPointerUp)
        window.removeEventListener("resize", onResize)
        geometry.dispose()
        material.dispose()
        mesh.dispose()
        renderer.dispose()
        canvas.remove()
      }
    }

    void init()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      teardown?.()
    }
  }, [])

  return (
    <div
      ref={hostRef}
      /* `select-none` and `touch-none`: a left-drag is the camera control, so it
         must not start a text selection or a page scroll on touch. */
      className="absolute inset-0 touch-none opacity-70 select-none"
    />
  )
}
