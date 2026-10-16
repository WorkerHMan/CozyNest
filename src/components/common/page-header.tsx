import type { ReactNode } from "react"

/**
 * Shared page header for section pages (projects, resources, tools, gallery…).
 *
 * Exists so every module page opens with the same rhythm and type scale as the
 * blog, instead of each page inventing its own heading sizes — the design
 * system's consistency requirement, implemented once.
 */
export function PageHeader({
  title,
  subtitle,
  meta,
  children,
}: {
  title: string
  subtitle?: string
  /** Small monospace line under the subtitle, e.g. a count or a date. */
  meta?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="max-w-3xl space-y-3">
      <h1 className="font-heading text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="leading-relaxed text-pretty text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      {meta ? (
        <p className="font-mono text-xs text-muted-foreground">{meta}</p>
      ) : null}
      {children}
    </header>
  )
}
