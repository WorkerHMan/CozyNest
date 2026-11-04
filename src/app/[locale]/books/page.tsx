import Link from "next/link"

import { Container } from "@/components/layout/container"
import { books, type Book } from "@/data/books"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** Deterministic spine colour, so a shelf looks like a shelf and not a gradient. */
function spineHue(id: string): number {
  let hue = 210
  for (const char of id) hue = (hue * 31 + char.charCodeAt(0)) % 360
  return hue
}

/**
 * 书籍 — a shelf, not a card grid.
 *
 * ## Why a different shape from /photos and /tools
 *
 * Those two answer "what have I got" with cards, because every item is a picture
 * or a link of equal weight. Books are physical objects: they stand upright, they
 * are identified by their spines, and the pleasure of a shelf is seeing them side
 * by side. So each book is a narrow vertical spine with its title running down
 * it, and hovering pulls it out of the row — the one gesture everybody already
 * knows from a real shelf.
 *
 * ## The three states, without colour carrying the meaning
 *
 * A readable book is a link that lifts and carries 「读」; an external one opens a
 * new tab and carries an arrow; a registered one does not lift, is not pressable,
 * and carries a lock. The difference is structural first and chromatic second.
 */
export default async function BooksPage(props: PageProps<"/[locale]/books">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const readable = books.filter((book) => book.access.kind === "reader").length
  const external = books.filter((book) => book.access.kind === "external").length
  const registered = books.length - readable - external

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{locale === "zh" ? "书架" : "Shelf"}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {locale === "zh" ? "书" : "Books"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {locale === "zh"
            ? "柜子里的书。能在这里读的会说明能读，只在柜子里的就只有书脊。"
            : "What is on the shelf. The ones readable here say so; the rest are spines and nothing more."}
        </p>

        {books.length > 0 ? (
          <dl className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <div className="flex items-baseline gap-1.5">
              <dd className="text-sm font-semibold text-foreground tabular-nums">{books.length}</dd>
              <dt>{locale === "zh" ? "本" : "books"}</dt>
            </div>
            <span aria-hidden className="text-border">·</span>
            <div className="flex items-baseline gap-1.5">
              <dd className="text-sm font-semibold text-foreground tabular-nums">{readable}</dd>
              <dt>{locale === "zh" ? "可读" : "readable"}</dt>
            </div>
            <span aria-hidden className="text-border">·</span>
            <div className="flex items-baseline gap-1.5">
              <dd className="text-sm font-semibold text-foreground tabular-nums">{external}</dd>
              <dt>{locale === "zh" ? "外链" : "external"}</dt>
            </div>
            <span aria-hidden className="text-border">·</span>
            <div className="flex items-baseline gap-1.5">
              <dd className="text-sm font-semibold text-foreground tabular-nums">{registered}</dd>
              <dt>{locale === "zh" ? "仅登记" : "registered"}</dt>
            </div>
          </dl>
        ) : null}
      </header>

      {books.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border-strong/60 bg-muted/20 px-6 py-20 text-center">
          <p className="font-heading text-lg font-semibold">
            {locale === "zh" ? "架子还空着。" : "The shelf is empty."}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {locale === "zh"
              ? "第一本书进来之前，这里不放示例书脊——书架上摆假书，比空着更难看。"
              : "No sample spines before the first real book. A shelf of invented titles looks worse than an empty one."}
          </p>
        </div>
      ) : (
        <ul role="list" className="mt-12 flex flex-wrap gap-x-3 gap-y-8 border-t border-border-strong/40 pt-8">
          {books.map((book) => (
            <li key={book.id}>
              <Spine book={book} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

/** One book, standing up. A card would be a row of rectangles; a spine is a shelf. */
function Spine({ book, locale }: { book: Book; locale: "zh" | "en" }) {
  const hue = spineHue(book.id)
  const title = book.title[locale]
  const kind = book.access.kind

  const body = (
    <>
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-white/40"
        style={{ opacity: kind === "registered" ? 0.2 : 0.5 }}
      />
      <span className="font-heading flex-1 [writing-mode:vertical-rl] text-[0.8125rem] font-medium leading-tight tracking-tight">
        {title}
      </span>
      <span aria-hidden className="mt-2 shrink-0 font-mono text-[0.5625rem] opacity-70">
        {kind === "external" ? "↗" : kind === "registered" ? "—" : locale === "zh" ? "读" : "read"}
      </span>
    </>
  )

  const frame =
    "relative flex h-56 w-11 flex-col items-center justify-center rounded-sm px-2 py-3"

  // Registered: not pressable, does not lift, and says why in its title.
  if (kind === "registered") {
    return (
      <div
        className={cn(frame, "border border-border-strong/50 text-muted-foreground")}
        style={{ background: `oklch(0.42 0.02 ${hue})` }}
        title={locale === "zh" ? `${title} · 仅登记，无法打开` : `${title} · registered, cannot open`}
      >
        {body}
      </div>
    )
  }

  const surface = cn(
    frame,
    "text-white transition-transform duration-200 motion-safe:hover:-translate-y-1.5",
    focusRing
  )
  const style = { background: `oklch(0.52 0.11 ${hue})` }
  const label =
    kind === "external"
      ? locale === "zh"
        ? `${title}（在新标签页打开）`
        : `${title} (opens in a new tab)`
      : title

  if (kind === "external") {
    return (
      <a
        href={book.access.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={surface}
        style={style}
      >
        {body}
      </a>
    )
  }

  return (
    <Link href={`/books/${book.id}`} aria-label={label} className={surface} style={style}>
      {body}
    </Link>
  )
}
