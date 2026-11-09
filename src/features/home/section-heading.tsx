import type { ReactNode } from "react"

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="font-heading text-2xl font-semibold tracking-tighter text-balance sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
