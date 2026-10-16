import Link from "next/link"
import { Suspense } from "react"
import { PageHeader } from "@/components/common/page-header"
import { PageSkeleton } from "@/components/common/page-skeleton"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  bookShelves,
  books,
  type BookShelf,
  type BookStatus,
} from "@/data/books"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const shelfKeys: Record<BookShelf, "shelfNovels" | "shelfTechnical"> = {
  novels: "shelfNovels",
  technical: "shelfTechnical",
}

const statusKeys: Record<
  BookStatus,
  "statusReading" | "statusFinished" | "statusPlanned"
> = {
  reading: "statusReading",
  finished: "statusFinished",
  planned: "statusPlanned",
}

/** Status is carried by a word and a tone, never by colour alone. */
const statusVariant: Record<BookStatus, "secondary" | "outline" | "ghost"> = {
  reading: "secondary",
  finished: "outline",
  planned: "ghost",
}

/**
 * Bookshelf.
 *
 * Shelf filter in the URL (`?shelf=novels|technical`, all by default) for the
 * same reason as the blog and the gallery: shared links and back/forward must
 * land on the same view. Everything on this page renders on the server.
 *
 * The progress bar is only rendered while a book is being read, and it carries
 * an accessible name built from the book title plus the dictionary's
 * `progressLabel`, so `role="progressbar"` is never announced as a bare
 * percentage with no subject.
 */
export default function BooksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <Suspense
      fallback={
        <Container className="py-12 sm:py-16">
          <PageSkeleton />
        </Container>
      }
    >
      <BooksContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function BooksContent({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const labels = dict.pages.books
  const search = await searchParams
  const rawShelf = typeof search.shelf === "string" ? search.shelf : undefined
  const activeShelf = (bookShelves as readonly string[]).includes(rawShelf ?? "")
    ? (rawShelf as BookShelf)
    : undefined

  const visible = activeShelf
    ? books.filter((book) => book.shelf === activeShelf)
    : books

  const countByShelf = (shelf: BookShelf) =>
    books.filter((book) => book.shelf === shelf).length

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      active
        ? "bg-brand text-[var(--brand-foreground)]"
        : "border border-border-strong bg-card text-muted-foreground hover:text-foreground"
    )

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        meta={`${visible.length} / ${books.length}`}
      />

      <nav aria-label={labels.title} className="mt-8">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/library/books"
              aria-current={activeShelf ? undefined : "true"}
              className={chipClass(!activeShelf)}
            >
              {labels.shelfAll} ({books.length})
            </Link>
          </li>
          {bookShelves.map((shelf) => {
            const active = activeShelf === shelf
            return (
              <li key={shelf}>
                <Link
                  href={`/library/books?shelf=${shelf}`}
                  aria-current={active ? "true" : undefined}
                  className={chipClass(active)}
                >
                  {labels[shelfKeys[shelf]]} ({countByShelf(shelf)})
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((book) => (
          <li
            key={book.id}
            className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-base leading-snug font-semibold text-balance">
                {book.title}
              </h2>
              <Badge variant={statusVariant[book.status]} className="shrink-0">
                {labels[statusKeys[book.status]]}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {labels.authorLabel}
              {" · "}
              {book.author}
              {" · "}
              <span className="font-mono">{book.year}</span>
            </p>

            {book.status === "reading" ? (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs text-muted-foreground">
                    {labels.progressLabel}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {book.progress}%
                  </span>
                </div>
                <Progress
                  value={book.progress}
                  aria-label={`${book.title} — ${labels.progressLabel}`}
                />
              </div>
            ) : null}

            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {book.note[resolved]}
            </p>
          </li>
        ))}
      </ul>
    </Container>
  )
}
