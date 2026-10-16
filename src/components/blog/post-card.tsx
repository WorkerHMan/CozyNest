import { Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Dictionary, Locale } from "@/i18n"
import { formatPostDate, type PostEntry } from "@/lib/blog"

/**
 * One article in a list.
 *
 * The whole card is a single link target via the stretched-link pattern
 * (`after:absolute after:inset-0`) rather than nesting links inside a clickable
 * container: keyboard users get one stop per card, and there is no invalid
 * nested interactive markup.
 */
export function PostCard({
  post,
  locale,
  dict,
  headingLevel = 3,
}: {
  post: PostEntry
  locale: Locale
  dict: Dictionary
  /**
   * 3 by default: on the home page these cards sit under a section `<h2>`.
   * The blog index passes 2 because there they *are* the top-level list, and
   * leaving them at 3 made the page skip a heading level (h1 -> h3).
   */
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3"

  return (
    <article className="relative rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <time dateTime={post.publishedAt}>
          {formatPostDate(post.publishedAt, locale)}
        </time>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden className="size-3" />
          {post.readingMinutes} {dict.blog.readingMinutes}
        </span>
        <Badge variant="secondary" className="ml-auto">
          {post.category}
        </Badge>
      </div>

      <Heading className="mt-3 font-heading text-lg font-semibold tracking-tight text-balance">
        <Link
          href={`/blog/${post.slug}`}
          className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {post.title}
        </Link>
      </Heading>

      {post.summary ? (
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {post.summary}
        </p>
      ) : null}

      {post.tags.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="outline">{tag}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
