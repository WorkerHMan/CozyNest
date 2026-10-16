import Link from "next/link"
import { Download, Info } from "lucide-react"
import { Suspense } from "react"
import { PageHeader } from "@/components/common/page-header"
import { PageSkeleton } from "@/components/common/page-skeleton"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fileCategories, files, formatFileSize } from "@/data/files"
import { defaultLocale, getDictionary, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * File manager.
 *
 * The listing is placeholder data and there is no storage backend behind it, so
 * the honest control is a **disabled** download button plus a visible note saying
 * why — never a link to a file that does not exist. Filters live in the URL
 * (`?category=<key>`, absent means all) and every chip is a server-rendered
 * `Link`, so the view survives a refresh, a share and the back button, and works
 * without JavaScript, exactly like the blog's category filter.
 */
export default function FilesPage(props: PageProps<"/[locale]/files">) {
  return (
    <Suspense
      fallback={
        <Container className="py-12 sm:py-16">
          <PageSkeleton />
        </Container>
      }
    >
      <FilesContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}

async function FilesContent({
  params,
  searchParams,
}: {
  params: PageProps<"/[locale]/files">["params"]
  searchParams: PageProps<"/[locale]/files">["searchParams"]
}) {
  const { locale } = await params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)

  const search = await searchParams
  const activeCategory =
    typeof search.category === "string" ? search.category : undefined

  const categoryLabel = (key: string): string =>
    fileCategories.find((category) => category.key === key)?.label[resolved] ??
    key

  const rows = files.filter(
    (file) => !activeCategory || file.category === activeCategory
  )

  const chipClass = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center rounded-full px-3 text-xs font-medium outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      active
        ? "bg-brand text-[var(--brand-foreground)]"
        : "bg-muted text-muted-foreground hover:text-foreground"
    )

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={dict.pages.files.title}
        subtitle={dict.pages.files.subtitle}
      />

      <nav className="mt-8" aria-label={dict.pages.files.columnsCategory}>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/files"
              aria-current={activeCategory ? undefined : "true"}
              className={chipClass(!activeCategory)}
            >
              {dict.blog.all} ({files.length})
            </Link>
          </li>
          {fileCategories.map((category) => {
            const count = files.filter(
              (file) => file.category === category.key
            ).length
            return (
              <li key={category.key}>
                <Link
                  href={`/files?category=${encodeURIComponent(category.key)}`}
                  aria-current={
                    activeCategory === category.key ? "true" : undefined
                  }
                  className={chipClass(activeCategory === category.key)}
                >
                  {category.label[resolved]} ({count})
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          {dict.pages.files.empty}
        </p>
      ) : (
        <div className="mt-8">
          <Table aria-label={dict.pages.files.title}>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">
                  {dict.pages.files.columnsName}
                </TableHead>
                <TableHead scope="col">
                  {dict.pages.files.columnsCategory}
                </TableHead>
                <TableHead scope="col">
                  {dict.pages.files.columnsSize}
                </TableHead>
                <TableHead scope="col">
                  {dict.pages.files.columnsUpdated}
                </TableHead>
                <TableHead scope="col" className="text-right">
                  {dict.pages.files.download}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((file) => (
                <TableRow key={file.name}>
                  <TableCell className="min-w-[14rem] whitespace-normal">
                    <span className="block font-medium break-all">
                      {file.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {file.description[resolved]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categoryLabel(file.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {formatFileSize(file.size, resolved)}
                  </TableCell>
                  <TableCell>
                    <time
                      dateTime={file.updatedAt}
                      className="font-mono text-xs text-muted-foreground"
                    >
                      {file.updatedAt}
                    </time>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Disabled on purpose: there is no storage behind these rows,
                        so there is nothing to download. `aria-describedby` points
                        at the note under the table. */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      aria-describedby="files-upload-note"
                    >
                      <Download aria-hidden="true" />
                      {dict.pages.files.download}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p
            id="files-upload-note"
            className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {dict.pages.files.uploadNote}
          </p>
        </div>
      )}
    </Container>
  )
}
