"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

/**
 * `attribute="class"` matches the `@custom-variant dark (&:is(.dark *))` rule in
 * globals.css, and next-themes injects a blocking script so the correct theme is
 * on <html> before first paint.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
