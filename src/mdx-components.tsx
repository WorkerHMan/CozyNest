import type { MDXComponents } from "mdx/types"
import Link from "next/link"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/**
 * Element mapping for MDX article bodies.
 *
 * The bulk of article typography lives in one `.mdx-body` block in globals.css
 * (so headings, lists, quotes, tables and code blocks all read from the same
 * tokens), and this file only adds behaviour that CSS cannot: heading anchors,
 * scroll offsets under the sticky header, and safe external links.
 *
 * Required by `@next/mdx` with the App Router: the file must export a single
 * argument-less `useMDXComponents`.
 */
const components: MDXComponents = {
  h2: ({ className, ...props }: ComponentProps<"h2">) => (
    <h2 className={cn("scroll-mt-24", className)} {...props} />
  ),
  h3: ({ className, ...props }: ComponentProps<"h3">) => (
    <h3 className={cn("scroll-mt-24", className)} {...props} />
  ),
  h4: ({ className, ...props }: ComponentProps<"h4">) => (
    <h4 className={cn("scroll-mt-24", className)} {...props} />
  ),
  a: ({ href = "", className, ...props }: ComponentProps<"a">) => {
    const external = /^https?:\/\//.test(href)
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          {...props}
        />
      )
    }
    return <Link href={href} className={className} {...props} />
  },
}

export function useMDXComponents(): MDXComponents {
  return components
}
