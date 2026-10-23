import type { AlbumData, Photo } from "@/lib/album/types"

/**
 * Test fixtures for the album's pure modules.
 *
 * These build *structurally valid* photos so a test can state only the field it
 * cares about. They are not sample content and never reach the site: the pages
 * read `src/data/album.ts`, which holds published photos only.
 */
export function photo(over: Partial<Photo> & { id: string }): Photo {
  return {
    src: `/album/2023/${over.id}.webp`,
    width: 1200,
    height: 800,
    blur: "",
    takenAt: "2023-05-01T10:00:00+08:00",
    bucket: "2023-05",
    placeId: null,
    albumIds: [],
    tags: [],
    ...over,
  }
}

/** One place (`hz`) is always present, so `placeId: "hz"` is a valid city. */
export function data(...photos: Photo[]): AlbumData {
  return {
    photos,
    places: [{ id: "hz", name: "杭州", nameEn: "Hangzhou", lat: 30.2741, lon: 120.1551 }],
    albums: [],
  }
}
