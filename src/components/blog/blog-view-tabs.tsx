import Link from "next/link"
import type { Dictionary } from "@/i18n"
import { cn } from "@/lib/utils"

export const blogViews = ["featured", "categories", "archive", "tags"] as const
export type BlogView = (typeof blogViews)[number]

export function isBlogView(value: string | undefined): value is BlogView {
  return typeof value === "string" && (blogViews as readonly string[]).includes(value)
}

/**
 * View switcher for the blog index.
 *
 * Deliberately built from `Link`s rather than a client-side tab component:
 *  - each view gets a real, shareable URL (the design system requires view and
 *    filter state to live in the URL, and warns against static URLs for dynamic
 *    content);
 *  - the active view is marked with `aria-current="page"`, which is also the
 *    "active state" rule;
 *  - it works with JavaScript disabled and needs no `useSearchParams`, so the
 *    page keeps its static shell.
 */
export function BlogViewTabs({
  active,
  basePath,
  label,
  views,
}: {
  active: BlogView
  basePath: string
  label: string
  views: Dictionary["blog"]["views"]
}) {
  const items: { view: BlogView; text: string }[] = [
    { view: "featured", text: views.featured },
    { view: "categories", text: views.categories },
    { view: "archive", text: views.archive },
    { view: "tags", text: views.tags },
  ]

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {items.map((item) => {
          const current = item.view === active
          return (
            <li key={item.view}>
              <Link
                href={item.view === "featured" ? basePath : `${basePath}?view=${item.view}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors duration-200",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted",
                  current
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.text}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
