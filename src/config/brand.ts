/**
 * The brand mark's public path.
 *
 * ## Why the filename carries a hash
 *
 * `next/image` rewrites `src` to `/_next/image?url=%2Fbrand%2Flogo.png&w=96`.
 * Replace the file and the URL does not change — so the browser serves the old
 * bytes from its cache, and Next serves the old optimised copy from
 * `.next/cache/images`. Both caches are keyed by URL, so neither notices.
 *
 * Putting the content hash in the name makes every replacement a new URL, which
 * busts both caches at once. It bit this project twice before the hash went in.
 *
 * ## Changing the mark
 *
 * Replace the file with one whose name carries the new content's hash, update
 * the constant below, and delete the old file. `scripts/set-brand-logo.mjs` does
 * all three from a single source image.
 */
export const brandLogo = "/brand/logo-13b1df6e.png"
