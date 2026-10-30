import { conceptIdsFor } from "@/lib/album/concepts"
import type { AlbumData } from "@/lib/album/types"

/**
 * Turning what someone typed into what the index can answer.
 *
 * ## Three kinds of token
 *
 * A word is either a **year**, a **place**, an **album**, or free text. The first
 * three are exact filters applied outside the text index, which is what keeps
 * 「杭州 2023」 precise instead of hoping the words appear in a caption.
 *
 * ## What is deliberately not matched
 *
 * Anything that is not a plausible year stays free text: 「1800」 is a number
 * somebody might be looking for, and silently turning it into a filter that
 * matches nothing is worse than searching for it.
 */
export interface ParsedQuery {
  terms: string[]
  year: number | null
  placeId: string | null
  albumId: string | null
}

const PLAUSIBLE_YEAR = /^(19|20)\d{2}$/

export function parseQuery(raw: string, data: Pick<AlbumData, "places" | "albums">): ParsedQuery {
  const parsed: ParsedQuery = { terms: [], year: null, placeId: null, albumId: null }
  const tokens = raw.trim().split(/\s+/).filter(Boolean)

  for (const token of tokens) {
    const lower = token.toLowerCase()

    if (parsed.year === null && PLAUSIBLE_YEAR.test(token)) {
      parsed.year = Number(token)
      continue
    }

    if (parsed.placeId === null) {
      const place = data.places.find(
        (item) => item.name === token || item.nameEn.toLowerCase() === lower
      )
      // A place name is content, not interface: 「杭州」 and "Hangzhou" both reach
      // the same city from either locale (spec §12).
      if (place) {
        parsed.placeId = place.id
        continue
      }
    }

    if (parsed.albumId === null) {
      const album = data.albums.find(
        (item) =>
          item.title === token || item.titleEn.toLowerCase() === lower || item.slug === lower
      )
      if (album) {
        parsed.albumId = album.id
        continue
      }
    }

    parsed.terms.push(token)
  }

  return parsed
}

/**
 * One searchable and renderable record per photo.
 *
 * Built on the server and handed to the client as props. A separate index file
 * would be a second request for the same bytes at this corpus size; the 120KB
 * ceiling is asserted in a test so the trade stays honest as the album grows.
 */
export interface SearchItem {
  id: string
  caption: string
  place: string
  placeEn: string
  bucket: string
  tags: string
  takenAt: string
  placeId: string
  albumIds: string[]
  src: string
  width: number
  height: number
  blur: string
}

export function toSearchItems(data: AlbumData): SearchItem[] {
  const places = new Map(data.places.map((place) => [place.id, place]))

  return data.photos.map((photo) => {
    const place = photo.placeId ? places.get(photo.placeId) : undefined
    return {
      id: photo.id,
      caption: photo.caption ?? "",
      place: place?.name ?? "",
      placeEn: place?.nameEn ?? "",
      bucket: photo.bucket ?? "",
      tags: photo.tags.join(" "),
      takenAt: photo.takenAt ?? "",
      placeId: photo.placeId ?? "",
      albumIds: [...photo.albumIds],
      src: photo.src,
      width: photo.width,
      height: photo.height,
      blur: photo.blur,
    }
  })
}

/**
 * The words actually handed to the text index.
 *
 * Chinese has no spaces, and the index tokenises on whitespace — so a caption
 * like 「傍晚的海边，两个人在拍照」 is one token and can never be matched by
 * 「海边」. The route that does work is the fixed concept vocabulary: every typed
 * word is first mapped to concept ids (`小狗 → dog`), and those ids are what the
 * `tags` field holds. A word with no concept falls through as-is for the English
 * and caption text.
 */
export function queryTermsFor(terms: readonly string[]): string[] {
  const out: string[] = []
  for (const term of terms) {
    const concepts = conceptIdsFor(term)
    if (concepts.length > 0) out.push(...concepts)
    else out.push(term)
  }
  return out
}

/** Exact filters, applied before the text index gets a say. */
export function matchesFilters(item: SearchItem, parsed: ParsedQuery): boolean {
  if (parsed.year !== null && !item.bucket.startsWith(String(parsed.year))) return false
  if (parsed.placeId !== null && item.placeId !== parsed.placeId) return false
  if (parsed.albumId !== null && !item.albumIds.includes(parsed.albumId)) return false
  return true
}
