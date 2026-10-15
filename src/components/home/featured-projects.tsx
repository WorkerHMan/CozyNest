import { ArrowRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/layout/container"
import { SectionHeading } from "@/components/home/section-heading"
import { getFeaturedProjects } from "@/data/projects"
import type { Dictionary, Locale } from "@/i18n"

export function FeaturedProjects({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const items = getFeaturedProjects(3)

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.home.projects.title}
        subtitle={dict.home.projects.subtitle}
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/projects">
              {dict.home.viewAll}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        }
      />
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((project) => (
          <li key={project.slug}>
            <Card className="h-full transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-mono">{project.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {project.year}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                  {project.summary[locale]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <Link
                  href="/projects"
                  className="mt-auto inline-flex items-center gap-1 rounded-sm text-sm font-medium text-brand transition-colors duration-200 hover:text-brand-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {dict.home.viewAll}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  )
}
