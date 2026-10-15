import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"

/**
 * Shared shell for the not-yet-implemented sections. Phase 2+ replaces each
 * route's body with the real module; this keeps navigation honest until then.
 */
export function PlaceholderPage({
  title,
  description,
  badge,
  backHome,
}: {
  title: string
  description: string
  badge: string
  backHome: string
}) {
  return (
    <Container className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Badge variant="secondary">{badge}</Badge>
        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-balance leading-relaxed text-muted-foreground">{description}</p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/">{backHome}</Link>
        </Button>
      </div>
    </Container>
  )
}
