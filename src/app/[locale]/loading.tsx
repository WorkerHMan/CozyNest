import { PageSkeleton } from "@/components/common/page-skeleton"

/**
 * Loading UI for every route under `[locale]`.
 *
 * Sits inside the locale layout, so the header, footer and shell stay put and
 * only the content area is replaced by skeletons that match its grid.
 */
export default function LocaleLoading() {
  return <PageSkeleton blocks={3} columns={3} />
}
