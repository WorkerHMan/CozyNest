import { ArrowLeft, CalendarDays, Clock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Container } from "@/components/layout/container"
import { PostToc } from "@/components/blog/post-toc"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getDictionary, isLocale, locales } from "@/i18n"
import { formatPostDate, getPostHeadings, getPostMeta, listPosts } from "@/lib/blog"

/**
 * Article page.
 *
 * Follows the pattern this version's docs actually document for MDX: a `.tsx`
 * page that dynamically imports the `.mdx` file with a template literal, plus
 * `generateStaticParams` enumerating every locale/slug pair. (The docs never
 * describe placing `page.mdx` at a dynamic segment.)
 *
 * Two deliberate omissions:
 *  - **no `dynamicParams` export** — with `cacheComponents` enabled the route
 *    segment configs `dynamic`, `dynamicParams`, `revalidate` and `fetchCache`
 *    were removed and exporting them is an error. Unknown slugs fall through to
 *    `notFound()` instead.
 *  - **no `new Date()`** — the publish date is a fixed string, so nothing reads
 *    the clock while prerendering.
 */
export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const post of listPosts(locale)) {
      params.push({ locale, slug: post.slug })
    }
  }
  return params
}

export default function PostPage(props: PageProps<"/[locale]/blog/[slug]">) {
  return (
    <Container className="py-12 sm:py-16">
      {/* `slug` is URL data that cannot be fully enumerated at build time, so
          awaiting `params` here would block the navigation. The work happens
          inside the boundary instead and streams into this fallback. */}
      <Suspense fallback={<PostSkeleton />}>
        <PostArticle params={props.params} />
      </Suspense>
    </Container>
  )
}

function PostSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4" aria-hidden>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}

async function PostArticle({
  params,
}: {
  params: PageProps<"/[locale]/blog/[slug]">["params"]
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const post = getPostMeta(locale, slug)
  if (!post) notFound()

  // Import the file for the locale that actually exists, so an untranslated
  // article still renders its original text rather than 404ing.
  const { default: Body } = await import(
    `@content/blog/${post.sourceLocale}/${slug}.mdx`
  )

  const siblings = listPosts(locale)
  const headings = getPostHeadings(post.sourceLocale, slug)
  const position = siblings.findIndex((item) => item.slug === slug)
  const newer = position > 0 ? siblings[position - 1] : null
  const older = position >= 0 ? (siblings[position + 1] ?? null) : null

  return (
    <article className="mx-auto max-w-2xl">
        <nav className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            {dict.blog.backToList}
          </Link>
        </nav>

        <header className="space-y-4 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden className="size-3.5" />
              <time dateTime={post.publishedAt}>
                {formatPostDate(post.publishedAt, locale)}
              </time>
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="size-3.5" />
              {post.readingMinutes} {dict.blog.readingMinutes}
            </span>
          </div>

          <h1 className="font-heading text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
            {post.title}
          </h1>

          {post.summary ? (
            <p className="leading-relaxed text-pretty text-muted-foreground">
              {post.summary}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {post.isFallback ? (
            <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {dict.blog.translationFallbackNote}
            </p>
          ) : null}
        </header>

        {headings.length > 0 ? (
          <div className="mt-8">
            <PostToc headings={headings} label={dict.blog.toc} />
          </div>
        ) : null}

        <div className="mdx-body mt-8">
          <Body />
        </div>

        {(newer || older) && (
          <nav
            aria-label={dict.blog.title}
            className="mt-14 grid gap-3 border-t border-border/60 pt-6 sm:grid-cols-2"
          >
            {older ? (
              <Link
                href={`/blog/${older.slug}`}
                className="group rounded-xl bg-card p-4 ring-1 ring-foreground/10 outline-none transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="eyebrow text-muted-foreground">
                  {dict.blog.prevPost}
                </span>
                <span className="mt-1.5 block text-sm font-medium text-balance">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link
                href={`/blog/${newer.slug}`}
                className="group rounded-xl bg-card p-4 text-right ring-1 ring-foreground/10 outline-none transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2"
              >
                <span className="eyebrow text-muted-foreground">
                  {dict.blog.nextPost}
                </span>
                <span className="mt-1.5 block text-sm font-medium text-balance">
                  {newer.title}
                </span>
              </Link>
            ) : null}
          </nav>
        )}
      </article>
  )
}
