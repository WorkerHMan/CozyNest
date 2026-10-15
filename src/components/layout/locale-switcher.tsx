"use client"

import { Languages } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  localeCookieMaxAge,
  localeCookieName,
  locales,
  type Locale,
} from "@/i18n/config"
import { cn } from "@/lib/utils"

/**
 * Short badges keep the control narrow enough for a 375px viewport; the full
 * language name stays in the accessible label and the tooltip.
 */
const shortLabels: Record<Locale, string> = { zh: "中", en: "EN" }

/**
 * Switches language without changing the URL.
 *
 * The choice is stored in a cookie and the server components are re-rendered
 * for the current URL; `proxy.ts` then rewrites that URL to the new locale.
 */
export function LocaleSwitcher({
  locale,
  labels,
  buttonLabel,
}: {
  locale: Locale
  labels: Record<Locale, string>
  buttonLabel: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const next = locales[(locales.indexOf(locale) + 1) % locales.length]

  function switchTo(target: Locale) {
    document.cookie = `${localeCookieName}=${target}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => switchTo(next)}
      aria-label={`${buttonLabel}: ${labels[next]}`}
      title={`${labels[locale]} → ${labels[next]}`}
      className={cn(
        "h-10 px-2.5 sm:h-8",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      <Languages aria-hidden className="size-4" />
      <span aria-hidden className="text-xs font-medium">
        {shortLabels[next]}
      </span>
    </Button>
  )
}
