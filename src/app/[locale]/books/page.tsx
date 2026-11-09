import { existsSync } from "node:fs"
import path from "node:path"

import Link from "next/link"

import { HideMascot } from "@/components/shared/hide-mascot"
import { Container } from "@/components/layout/container"
import { bookCategories, books, type Book } from "@/data/books"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

/** Four spine heights, so a row is a shelf and not a bar chart. */
const HEIGHTS = ["h-52", "h-56", "h-60", "h-64"] as const

/** Deterministic hash, so a given book keeps its look across builds. */
function hashOf(id: string): number {
  let hash = 2166
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 100000
  return hash
}

/**
 * A spine's look: two tones of one hue, mostly quiet.
 *
 * Real shelves are furniture with books on them, not a colour wheel. So most
 * spines sit at low chroma — the muted olive, brown and slate of actual bindings —
 * and one in nine is allowed to be saturated. That single rule is what stops 61
 * spines from looking like a swatch test.
 */
function spineStyle(id: string): { background: string; texture: string } {
  const hue = hashOf(id) % 360
  const loud = hashOf(id) % 9 === 0
  const chroma = loud ? 0.13 : 0.045
  const top = 0.46 + (hashOf(id) % 5) * 0.02
  const bottom = top - 0.09

  return {
    background: `linear-gradient(178deg, oklch(${top} ${chroma} ${hue}) 0%, oklch(${bottom} ${chroma} ${
      (hue + 22) % 360
    }) 100%)`,
    texture:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.055) 0 1px, rgba(0,0,0,0.045) 1px 3px)",
  }
}

/**
 * 书籍 — a shelf of spines.
 *
 * ## Why a shelf and not a card grid
 *
 * The photo and tool pages answer "what have I got" with cards, because every item
 * there is a picture or a link of equal weight. Books are objects: they stand up,
 * they are identified by their spine, and a row of them reads as a collection.
 *
 * ## Covers do the talking on hover
 *
 * Page one of each PDF is rendered to a cover at build time (git-ignored, like the
 * PDFs). The shelf stays spines — mixing cover cards with drawn spines in one row
 * looks like a bug, not a design — but hovering a spine slides out a card with the
 * actual cover, so the shelf never hides what it has.
 *
 * ## The three states
 *
 * A readable book is a link, leans out and shows its cover; an external one opens
 * a new tab; a registered one cannot be pressed. Structure first, colour second.
 */
export default async function BooksPage(props: PageProps<"/[locale]/books">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  // Availability is a fact about this machine, read from disk, not a claim in the
  // data: the files are git-ignored, so a local build opens them and a deployed
  // build simply has nothing to serve.
  const availableIds = new Set(
    books
      .filter((book) => existsSync(path.join("public", "books", book.category, `${book.id}.pdf`)))
      .map((book) => book.id)
  )
  const coverIds = new Set(
    books.filter((book) => existsSync(path.join("public", "books", "covers", `${book.id}.webp`))).map((book) => book.id)
  )

  const readable = availableIds.size
  const external = books.filter((book) => book.access.kind === "external").length
  const registered = books.length - readable - external

  return (
    <Container className="py-16 sm:py-20">
      <HideMascot />

      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{locale === "zh" ? "书架" : "Shelf"}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {locale === "zh" ? "书" : "Books"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {locale === "zh"
            ? "柜子里的书，按学科排。能在这里读的点得开，只在柜子里的就只有书脊。"
            : "The shelf, arranged by subject. The ones readable here open; the rest are spines and nothing more."}
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
              <dt>{locale === "zh" ? "本机可读" : "readable here"}</dt>
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
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-14">
          {bookCategories.map((category) => {
            const shelf = books.filter((book) => book.category === category)
            return (
              <section key={category} aria-labelledby={`shelf-${category}`}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border/60 pb-2">
                  <h2 id={`shelf-${category}`} className="font-heading text-base font-semibold tracking-tight">
                    {category}
                  </h2>
                  <p className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                    {shelf.length} {locale === "zh" ? "本" : "books"}
                  </p>
                </div>
                {/* `items-end` + a thick bottom border: the spines stand on it. */}
                <ul
                  role="list"
                  className="mt-5 flex flex-wrap items-end gap-x-2.5 border-b-[3px] border-border-strong/50 pb-0"
                >
                  {shelf.map((book) => (
                    <li key={book.id}>
                      <Spine
                        book={book}
                        locale={locale}
                        available={availableIds.has(book.id)}
                        hasCover={coverIds.has(book.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </Container>
  )
}

/** One book, standing on the shelf, with its cover waiting on hover. */
function Spine({
  book,
  locale,
  available,
  hasCover,
}: {
  book: Book
  locale: "zh" | "en"
  available: boolean
  hasCover: boolean
}) {
  const hash = hashOf(book.id)
  const { background, texture } = spineStyle(book.id)
  const title = book.title[locale]
  const height = HEIGHTS[hash % HEIGHTS.length]
  const kind = available ? "reader" : book.access.kind

  const cover = hasCover ? (
    <img
      src={`/books/covers/${book.id}.webp`}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover"
    />
  ) : null

  const spine = (
    <span className="relative block h-full w-full overflow-hidden rounded-[3px]" style={{ background }}>
      {/* Cloth grain: a 1px repeating overlay, which is what separates "coloured
          bar" from "bound book" at this size. */}
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: texture }} />
      {/* A raised band near the head and tail, like the boards of a hardback. */}
      <span aria-hidden className="absolute inset-x-0 top-2 h-px bg-white/25" />
      <span aria-hidden className="absolute inset-x-0 bottom-2 h-px bg-black/25" />
      <span className="font-heading absolute inset-0 flex items-center justify-center px-2 py-4 [writing-mode:vertical-rl] text-[0.8125rem] font-medium leading-tight tracking-tight text-white/90">
        {title}
      </span>
    </span>
  )

  const frame = cn(
    // `hover:z-30` matters: the lift below uses `transform`, which creates a
    // stacking context, so a z-index inside would stay trapped under the
    // neighbouring spines. The spine itself has to come forward.
    "group/book relative z-0 block w-11 self-end hover:z-30 focus-within:z-30",
    height,
    kind === "registered" ? "cursor-default opacity-70" : "transition-transform duration-200 motion-safe:hover:-translate-y-2"
  )

  const preview = (
    <span
      aria-hidden
      className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 hidden w-40 -translate-x-1/2 overflow-hidden rounded-lg border border-border-strong/60 bg-background shadow-xl shadow-black/25 group-hover/book:block group-focus-visible/book:block"
    >
      {cover ? (
        <img src={`/books/covers/${book.id}.webp`} alt="" loading="lazy" className="aspect-[2/3] w-full object-cover" />
      ) : (
        <span className="grid aspect-[2/3] w-full place-items-center bg-muted/40 px-2 text-center text-[0.625rem] text-muted-foreground">
          {locale === "zh" ? "没有封面" : "No cover"}
        </span>
      )}
      <span className="block border-t border-border/60 px-2 py-1.5">
        <span className="block truncate text-[0.6875rem] font-medium">{title}</span>
        <span className="block truncate font-mono text-[0.625rem] text-muted-foreground">{book.category}</span>
      </span>
    </span>
  )

  if (kind === "registered") {
    return (
      <span className={frame} title={`${title} · ${locale === "zh" ? "仅登记，无法打开" : "registered, cannot open"}`}>
        {spine}
        {preview}
      </span>
    )
  }

  if (book.access.kind === "external") {
    return (
      <a
        href={book.access.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title}${locale === "zh" ? "（在新标签页打开）" : " (opens in a new tab)"}`}
        className={cn(frame, focusRing)}
      >
        {spine}
        {preview}
      </a>
    )
  }

  return (
    <Link href={`/books/${book.id}`} aria-label={title} className={cn(frame, focusRing)}>
      {spine}
      {preview}
    </Link>
  )
}
