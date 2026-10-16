import { Container } from "@/components/layout/container"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Route-level loading UI.
 *
 * The design system's Next.js stack rules say to use `loading.tsx` rather than
 * hand-managed loading state, and to reserve space with skeletons whose sizes
 * match the real content so nothing shifts (CLS < 0.1 is High severity).
 *
 * Because every page currently prerenders statically, this boundary is rarely
 * seen today; it becomes visible as soon as a route is dynamic (dynamic params,
 * uncached data), which is why it is in place before then.
 */
export function PageSkeleton({
  blocks = 3,
  columns = 3,
}: {
  blocks?: number
  columns?: 1 | 2 | 3
}) {
  return (
    <Container className="py-16 sm:py-20">
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div
        className={
          columns === 1
            ? "mt-8 grid gap-4"
            : columns === 2
              ? "mt-8 grid gap-4 sm:grid-cols-2"
              : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {Array.from({ length: blocks }, (_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </Container>
  )
}
