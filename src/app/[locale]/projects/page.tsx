import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { PageHeader } from "@/components/common/page-header"
import { Container } from "@/components/layout/container"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { projects } from "@/data/projects"
import {
  defaultLocale,
  getDictionary,
  isLocale,
  type Dictionary,
  type Locale,
} from "@/i18n"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/content"

const statuses = ["active", "archived", "planned"] as const
type Status = (typeof statuses)[number]

function statusLabel(status: Status, dict: Dictionary): string {
  const labels = dict.pages.projects
  if (status === "active") return labels.statusActive
  if (status === "archived") return labels.statusArchived
  return labels.statusPlanned
}

/**
 * Portfolio.
 *
 * The status filter lives in the URL (`?status=`) and is rendered as
 * server-side `<Link>` chips, so a filtered view is shareable and works without
 * JavaScript.
 *
 * `searchParams` is read **inside** the `<Suspense>` boundary, never in the page
 * body: reading URL data outside Suspense makes the navigation block, which
 * Next.js reports as "encountered URL data during prerendering or a navigation".
 * The header is static and lands in the shell; only the filterable list streams.
 */
export default async function ProjectsPage(
  props: PageProps<"/[locale]/projects">
) {
  const { locale } = await props.params
  const resolved = isLocale(locale) ? locale : defaultLocale
  const dict = getDictionary(resolved)
  const labels = dict.pages.projects

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        meta={`${projects.length} ${labels.countLabel}`}
      />
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectList
          searchParams={props.searchParams}
          dict={dict}
          locale={resolved}
        />
      </Suspense>
    </Container>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-hidden>
      <div className="flex flex-wrap gap-2">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <Skeleton key={index} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

async function ProjectList({
  searchParams,
  dict,
  locale,
}: {
  searchParams: PageProps<"/[locale]/projects">["searchParams"]
  dict: Dictionary
  locale: Locale
}) {
  const labels = dict.pages.projects
  const search = await searchParams
  const raw = typeof search.status === "string" ? search.status : ""
  const active: Status | undefined = (statuses as readonly string[]).includes(raw)
    ? (raw as Status)
    : undefined

  const visible = active
    ? projects.filter((project) => project.status === active)
    : projects

  const chipClass = (on: boolean) =>
    cn(
      "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium outline-none transition-colors duration-200",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      on
        ? "bg-brand text-[var(--brand-foreground)]"
        : "bg-muted text-muted-foreground hover:text-foreground"
    )

  return (
    <>
      <ul className="mt-8 flex flex-wrap gap-2">
        <li>
          <Link
            href="/projects"
            aria-current={active ? undefined : "true"}
            className={chipClass(!active)}
          >
            {labels.filterAll} ({projects.length})
          </Link>
        </li>
        {statuses.map((status) => {
          const count = projects.filter((p) => p.status === status).length
          return (
            <li key={status}>
              <Link
                href={`/projects?status=${status}`}
                aria-current={active === status ? "true" : undefined}
                className={chipClass(active === status)}
              >
                {statusLabel(status, dict)} ({count})
              </Link>
            </li>
          )
        })}
      </ul>

      {active ? (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          {visible.length} / {projects.length} {labels.countLabel}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {visible.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} locale={locale} dict={dict} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function ProjectCard({
  project,
  locale,
  dict,
}: {
  project: Project
  locale: Locale
  dict: Dictionary
}) {
  const labels = dict.pages.projects

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          {/* The project name is the card's heading, so the eyebrow labels
              below can be h3 without skipping a level. */}
          <h2 className="font-mono text-base leading-none font-semibold">
            {project.name}
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {labels.yearLabel} {project.year}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={project.status === "active" ? "default" : "secondary"}>
            {statusLabel(project.status, dict)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {project.summary[locale]}
        </p>

        <div className="space-y-2">
          <h3 className="eyebrow text-muted-foreground">
            {labels.highlightsLabel}
          </h3>
          <ul className="space-y-1.5">
            {project.highlights[locale].map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed">
                <span
                  aria-hidden
                  className="mt-2 size-1 shrink-0 rounded-full bg-brand"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="eyebrow text-muted-foreground">{labels.stackLabel}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <li key={tech}>
                <Badge variant="outline">{tech}</Badge>
              </li>
            ))}
          </ul>
        </div>

        {project.repo ? (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${labels.repoLink} — ${project.name}`}
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-brand outline-none transition-colors duration-200 hover:text-brand-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {labels.repoLink}
            <ExternalLink aria-hidden className="size-3.5" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  )
}
