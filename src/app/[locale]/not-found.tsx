import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

/**
 * 404 inside the locale layout, so the header and footer keep the visitor's
 * language.
 *
 * `not-found.tsx` receives no route params, and reading the locale cookie here
 * would make the page dynamic — which `cacheComponents` rejects without a
 * Suspense boundary. Rendering both languages keeps the page fully static.
 */
export default function LocaleNotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <p className="font-mono text-5xl font-semibold text-gradient-brand">404</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          页面不存在
        </h1>
        <p className="text-sm text-muted-foreground">
          你访问的地址可能已被移动或删除。
        </p>
        <p lang="en" className="text-sm text-muted-foreground">
          The page you are looking for could not be found.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/" lang="en">
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  )
}
