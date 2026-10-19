"use client"

import { useEffect, useRef } from "react"

/**
 * WebGL scene for the hero's stage: a slowly turning icosahedron wireframe.
 *
 * Ported from `branch1`, where it was built against the design system's
 * `threejs` rules. Those rules exist because these are the things you cannot
 * retrofit:
 *
 *  - `antialias` is set **in the constructor**; assigning it later has no effect
 *    because the WebGL context already exists.
 *  - Sizing reads the **container's** `clientWidth/clientHeight`, never
 *    `window.innerWidth` — the canvas lives inside a grid column.
 *  - The resize handler updates `camera.aspect` **and calls
 *    `updateProjectionMatrix()`**; a stale aspect stretches the whole scene.
 *  - `prefers-reduced-motion` renders one static frame and never starts the loop,
 *    rather than removing the scene.
 *  - Everything (renderer, geometry, material, RAF, listeners) is disposed on
 *    unmount, and `three` is imported dynamically so it stays out of the initial
 *    bundle.
 *
 * The canvas contributes nothing to the accessibility tree, so it is labelled
 * only when `label` is passed; the wrapping `CanvasStage` usually names the
 * region, in which case the canvas is hidden instead of announced twice.
 */
export function SceneCanvas({ label }: { label?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)

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
      if (label) {
        canvas.setAttribute("role", "img")
        canvas.setAttribute("aria-label", label)
      } else {
        canvas.setAttribute("aria-hidden", "true")
      }
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.display = "block"
      host!.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
      camera.position.set(0, 0, 6)

      const geometry = new THREE.IcosahedronGeometry(1.9, 1)

      // Read the live brand token so the scene follows the theme presets.
      // `THREE.Color` only understands hex/rgb/hsl, so an unparsable value is
      // detected (it parses to white) and replaced by the default accent.
      let accent = 0x22c55e
      try {
        const probe = document.createElement("span")
        probe.style.color = "var(--brand)"
        probe.style.display = "none"
        document.body.appendChild(probe)
        const resolved = getComputedStyle(probe).color
        probe.remove()
        const parsed = new THREE.Color(resolved)
        if (parsed.getHex() !== 0xffffff) accent = parsed.getHex()
      } catch {
        // Keep the default accent.
      }

      const material = new THREE.MeshBasicMaterial({
        color: accent,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const pointer = { x: 0, y: 0 }
      const onPointerMove = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1
      }

      const onResize = () => {
        const w = host!.clientWidth || 1
        const h = host!.clientHeight || 1
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }

      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("resize", onResize)

      const render = () => {
        renderer.render(scene, camera)
      }

      const tick = () => {
        mesh.rotation.x += 0.0012
        mesh.rotation.y += 0.0018
        mesh.rotation.y += pointer.x * 0.0006
        mesh.rotation.x += pointer.y * 0.0004
        render()
        frame = requestAnimationFrame(tick)
      }

      if (reduce) {
        // Static final state: one frame, no loop, no motion.
        render()
      } else {
        tick()
      }

      teardown = () => {
        window.removeEventListener("pointermove", onPointerMove)
        window.removeEventListener("resize", onResize)
        geometry.dispose()
        material.dispose()
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
  }, [label])

  return <div ref={hostRef} className="absolute inset-0" />
}
