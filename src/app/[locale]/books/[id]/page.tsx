import { existsSync } from "node:fs"
import path from "node:path"

import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/layout/container"
import { books } from "@/data/books"
import { defaultLocale, isLocale } from "@/i18n"

/**
 * Reading one book.
 *
 * ## The frame keeps the site's header
 *
 * The page is the site — header, container, back link — and the book gets the rest
 * of the viewport as an `<iframe>`. So the browser's own PDF viewer supplies the
 * scrolling, zoom, page numbers, print and download, and we supply the identity:
 * you never lose the way back.
 *
 * ## Availability is read from disk, not from a licence claim
 *
 * `books.ts` says every entry is `registered` — that is the honest claim for a
 * published repository. Whether *this* machine can open the book is a different
 * question, answered by `existsSync`: the files live in git-ignored
 * `public/books/<category>/<id>.pdf`, so a local build reads them and a public
 * build simply has nothing to serve. No flag, no accidental leak.
 */
export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }))
}

export default async function BookPage(props: PageProps<"/[locale]/books/[id]">) {
  const { locale: rawLocale, id } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  const book = books.find((item) => item.id === id)
  if (!book) notFound()

  const file = path.join("public", "books", book.category, `${book.id}.pdf`)
  const available = existsSync(file)
  const title = book.title[locale]

  return (
    <Container className="py-10 sm:py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="eyebrow text-brand">{book.category}</p>
          <h1 className="font-heading mt-1 truncate text-xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        <Link
          href="/books"
          className="font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-foreground"
        >
          ← {locale === "zh" ? "返回书架" : "Back to the shelf"}
        </Link>
      </header>

      {available ? (
        <div className="mt-6">
          {/* `h-[calc(100svh-11rem)]` rather than a fixed height: the frame has to
              end at the bottom of the viewport on every device, under a header of
              unpredictable height. */}
          <iframe
            src={`/books/${book.category}/${book.id}.pdf`}
            title={title}
            className="h-[calc(100svh-11rem)] w-full rounded-lg border border-border-strong/60 bg-muted/20"
          />
          <p className="mt-3 font-mono text-[0.625rem] text-muted-foreground">
            {locale === "zh"
              ? "这份文件只存在于这台机器上，没有进入仓库。"
              : "This file exists on this machine only; it is not in the repository."}
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border-strong/60 bg-muted/20 px-6 py-16 text-center">
          <p className="font-heading text-lg font-semibold">
            {locale === "zh" ? "这本在这里打不开。" : "This one cannot be opened here."}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {locale === "zh"
              ? "书架上有这本，但这台机器上没有它的文件——所以只有书脊，没有内容。"
              : "The shelf knows this book, but this machine has no file for it — a spine and nothing more."}
          </p>
        </div>
      )}
    </Container>
  )
}
