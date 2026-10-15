import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CanvasStage } from "@/components/common/canvas-stage"
import { Container } from "@/components/layout/container"
import { articles } from "@/data/posts"
import { projects } from "@/data/projects"
import type { Dictionary } from "@/i18n"

/**
 * Server Component. Everything here is static: no clock reads, no random
 * values, so it prerenders into the static shell as-is.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const stats = [
    { value: articles.length, label: dict.home.stats.articles },
    { value: projects.length, label: dict.home.stats.projects },
    { value: 5, label: dict.home.stats.notes },
  ]

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Ambient layer, reserved for the WebGL scene. Decorative, so the stage
          is hidden from assistive tech until it carries real content. */}
      <CanvasStage className="absolute inset-0 rounded-none">
        <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)] motion-reduce:opacity-30" />
        <div className="absolute -top-32 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
      </CanvasStage>

      <Container className="relative py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start gap-6">
            <Badge
              variant="outline"
              className="gap-1.5 border-border/70 bg-background/60 py-1 backdrop-blur-md"
            >
              <Sparkles aria-hidden className="size-3 text-brand" />
              {dict.home.badge}
            </Badge>

            <h1 className="font-heading text-4xl font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">
              <span className="text-muted-foreground">{dict.home.greeting}</span>{" "}
              <span className="text-gradient-brand">{dict.home.name}</span>
            </h1>

            {/* Uppercase tracked mono eyebrow: label weight, not body copy. */}
            <p className="eyebrow font-mono text-brand">{dict.home.role}</p>

            <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {dict.home.intro}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/blog">
                  {dict.home.ctaPrimary}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/projects">{dict.home.ctaSecondary}</Link>
              </Button>
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/60 pt-6">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-0.5">
                  <dt className="eyebrow text-muted-foreground">{stat.label}</dt>
                  <dd className="font-mono text-2xl font-semibold tracking-tight">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Reserved 3D stage. The panel is composed from CSS for now and will
              be replaced by the WebGL renderer; the slot and its sizing contract
              are already fixed, so swapping it in does not move the layout. */}
          <div className="hidden lg:block">
            <CanvasStage
              className="aspect-square w-full border border-border/60 bg-card/40 shadow-2xl shadow-black/20 motion-safe:transition-shadow motion-safe:duration-[var(--motion-duration-base)] hover:shadow-brand/5"
              label={dict.home.stageLabel}
            >
              <div className="bg-grid absolute inset-0 opacity-40" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative size-40 rounded-full bg-linear-to-br from-brand to-brand-2 opacity-80 blur-2xl motion-safe:animate-pulse" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border/60 bg-background/40 px-4 py-3 backdrop-blur-md">
                <span className="eyebrow text-muted-foreground">
                  {dict.home.stageLabel}
                </span>
                <span className="font-mono text-xs text-brand">{dict.home.stageHint}</span>
              </div>
            </CanvasStage>
          </div>
        </div>
      </Container>
    </section>
  )
}
