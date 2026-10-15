import { ArrowRight, CalendarDays, Clock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/home/section-heading"
import { formatArticleDate, getFeaturedArticles } from "@/data/posts"
import type { Dictionary, Locale } from "@/i18n"

export function FeaturedPosts({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const items = getFeaturedArticles(3)

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
        {items.map((article) => (
          <li key={article.slug}>
            <Card className="h-full transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20">
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays aria-hidden className="size-3.5" />
                  <time dateTime={article.publishedAt}>
                    {formatArticleDate(article.publishedAt, locale)}
                  </time>
                  <span aria-hidden>·</span>
                  <Clock aria-hidden className="size-3.5" />
                  <span>
                    {article.readingMinutes} {locale === "zh" ? "分钟" : "min"}
                  </span>
                </div>
                <CardTitle className="text-balance">
                  <Link
                    href="/blog"
                    className="rounded-sm transition-colors duration-200 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {article.title[locale]}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                  {article.summary[locale]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{article.category[locale]}</Badge>
                  {article.tags.slice(0, 2).map((tag) => (
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
