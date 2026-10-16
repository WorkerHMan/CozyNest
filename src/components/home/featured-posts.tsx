import { ArrowRight, CalendarDays, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/home/section-heading"
import type { Dictionary, Locale } from "@/i18n"
import { formatPostDate, type PostEntry } from "@/lib/blog"

/** Newest articles on the home page. Data comes from the MDX content library. */
export function FeaturedPosts({
  dict,
  locale,
  posts,
}: {
  dict: Dictionary
  locale: Locale
  posts: readonly PostEntry[]
}) {
  if (posts.length === 0) return null

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.home.posts.title}
        subtitle={dict.home.posts.subtitle}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog">
              {dict.home.viewAll}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        }
      />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Card className="relative h-full transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays aria-hidden className="size-3.5" />
                  <time dateTime={post.publishedAt}>
                    {formatPostDate(post.publishedAt, locale)}
                  </time>
                  <span aria-hidden>·</span>
                  <Clock aria-hidden className="size-3.5" />
                  <span>
                    {post.readingMinutes} {dict.blog.readingMinutes}
                  </span>
                </div>
                <CardTitle className="text-balance">
                  {/* Stretched link: one focus stop for the whole card. */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="rounded-sm outline-none transition-colors duration-200 after:absolute after:inset-0 hover:text-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.summary ? (
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                    {post.summary}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{post.category}</Badge>
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  )
}
