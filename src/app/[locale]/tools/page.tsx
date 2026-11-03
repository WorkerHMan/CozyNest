import Link from "next/link"

import { Container } from "@/components/layout/container"
import { toolCategories } from "@/config/tools"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/**
 * 工具 — a link directory, laid out the way the reference does it: one block per
 * category, a heading and a single line of context, then a grid of cards.
 *
 * ## The card
 *
 * Title, one line of description, the domain underneath. That is the whole card,
 * because the only decision a visitor makes here is "open this or not", and the
 * domain is the cheapest signal that this is the site they meant.
 *
 * ## Hover
 *
 * Border brightens, the card lifts two pixels and an arrow slides in. The lift is
 * a transform, so it cannot shift the grid; the arrow lives in a slot that is
 * always occupied, so nothing reflows when it appears. Both are 200ms, matching
 * the rest of the site.
 *
 * ## Entries without an address
 *
 * Rendered as plain cards with a "待补" marker rather than hidden or linked to
 * nothing. A directory that quietly drops its unfinished rows looks complete when
 * it is not.
 */
export default async function ToolsPage(props: PageProps<"/[locale]/tools">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const total = toolCategories.reduce((sum, category) => sum + category.items.length, 0)

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{locale === "zh" ? "导航" : "Directory"}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {locale === "zh" ? "工具导航" : "Tool directory"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {locale === "zh"
            ? "好的工具从不喧哗，它只是让你离想做的事更近一点。"
            : "A good tool never shouts; it just moves you a little closer to what you meant to do."}
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground tabular-nums">
          {toolCategories.length} {locale === "zh" ? "个分类" : "categories"}
          <span aria-hidden className="mx-2">·</span>
          {total} {locale === "zh" ? "条" : "entries"}
        </p>
      </header>

      <div className="mt-14 flex flex-col gap-14">
        {toolCategories.map((category) => (
          <section key={category.id} aria-labelledby={`tools-${category.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border/60 pb-3">
              <h2 id={`tools-${category.id}`} className="font-heading text-lg font-semibold tracking-tight">
                {category.label[locale]}
              </h2>
              <p className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                {category.items.length} {locale === "zh" ? "条" : "entries"}
              </p>
            </div>

            {category.items.length === 0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                {locale === "zh" ? "还没有收录。" : "Nothing filed here yet."}
              </p>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => {
                  const body = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-heading text-sm font-semibold leading-snug">
                          {item.label[locale]}
                        </h3>
                        {/* Always occupies its slot, so the arrow cannot reflow
                            the row when it appears on hover. */}
                        <span
                          aria-hidden
                          className="mt-0.5 shrink-0 text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                        >
                          ↗
                        </span>
                      </div>

                      {item.note ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.note[locale]}
                        </p>
                      ) : null}

                      <div className="mt-3 flex items-center gap-2">
                        <span className="font-mono text-[0.625rem] text-muted-foreground/80">
                          {item.domain ?? (locale === "zh" ? "地址待补" : "address pending")}
                        </span>
                      </div>
                    </>
                  )

                  const card = cn(
                    "group flex h-full flex-col rounded-xl border border-border/70 bg-muted/20 p-4",
                    "transition-[border-color,box-shadow,transform] duration-200",
                    "motion-safe:hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg hover:shadow-black/5",
                    focusRing
                  )

                  return (
                    <li key={item.label.en}>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={card}
                        >
                          {body}
                        </a>
                      ) : (
                        <div className={cn(card, "hover:translate-y-0 hover:border-border/70 hover:shadow-none")}>
                          {body}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-border/60 pt-6">
        <Link
          href="/"
          className={cn(
            "font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-foreground",
            focusRing
          )}
        >
          ← {locale === "zh" ? "返回首页" : "Back home"}
        </Link>
      </p>
    </Container>
  )
}
