import type { Localized } from "@/types/content"

/**
 * The books catalogue.
 *
 * ## Access is a discriminated union, not a flag
 *
 * Three states, and only one of them can carry a file. Modelling this as a union
 * means `pdf` cannot exist on a book that is not readable, and a book with no
 * `access` at all cannot be constructed — the compiler enforces the rule that
 * matters most here: **nothing becomes readable by accident**. Default when
 * adding an entry is `{ kind: "registered" }`, and opening a book means editing
 * that line on purpose.
 *
 * - `reader` — a PDF of this site's own, opened in `/books/<id>`
 * - `external` — leaves the site for somewhere the address is legitimate
 * - `registered` — copyright or no file: the catalogue knows it, and cannot open it
 */
export type BookAccess =
  | { kind: "reader"; pdf: string }
  | { kind: "external"; href: string }
  | { kind: "registered" }

export interface Book {
  id: string
  title: Localized<string>
  author: string
  /** `YYYY` of the edition read, not of writing. Optional: often unknown. */
  year?: string
  /** Cover image path, if there is one. The shelf draws a spine when there is not. */
  cover?: string
  /** One line of your own. The only opinion on the page. */
  note?: Localized<string>
  access: BookAccess
}

/**
 * Add a book here. The id becomes its URL path, so keep it ASCII and stable.
 *
 * Empty for now: an empty shelf with an honest line beats three invented books.
 * The first entry will be the one whose PDF or external address is already
 * sorted, and it starts as `registered`.
 */
export const books: readonly Book[] = []

export const readableCount = books.filter((book) => book.access.kind === "reader").length
