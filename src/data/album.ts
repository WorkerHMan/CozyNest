import type { AlbumData } from "@/lib/album/types"

/**
 * The published album. The only photo source the site reads.
 *
 * ## Empty is a real state, not a stub
 *
 * Nothing has been published yet, so this holds nothing. The page renders the
 * honest empty state from spec §8.7 ("还没有照片，这个相册刚开张") instead of
 * inventing seed photos — a fake map with sample dots is the one thing the spec
 * forbids by name.
 *
 * ## Who writes this file
 *
 * In the end state the publish pipeline generates it from the private library
 * (`/studio/publish`, spec §10): only photos marked public, and only public
 * albums. Until that exists, entries are added by hand, and `tests/album/
 * data.test.ts` holds whichever writer ran to the same consistency rules.
 *
 * A photo's `src` must point at a webp that is already in `public/album/` at
 * ≤ 320KB, and the whole set must stay under 300 photos / 90MB (spec §4.3).
 */
export const albumData: AlbumData = {
  photos: [],
  places: [],
  albums: [],
}
