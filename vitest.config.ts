import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

/**
 * Unit tests for the pure modules only.
 *
 * The repo has no DOM test library and does not need one: components and pages
 * are verified by `next build` plus assertions against what `next start`
 * serves. `environment: "node"` keeps that boundary honest — a test that
 * quietly needs a DOM fails here instead of passing by accident.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
})
