import type { AlbumData, Photo } from "@/lib/album/types"

/**
 * Every pure derivation the /photos page needs.
 *
 * These are computed at build time from `albumData` and handed to the components
 * as props, so a component never walks the photo list itself. That keeps the
 * "count each photo once" rule in one place: an aggregate function that counted
 * a photo twice would show up as a wrong number on the map, not as a styling
 * problem someone chases later.
 */

export interface AlbumStats {
  photoCount: number
  cityCount: number
  minYear: number | null
  maxYear: number | null
}

export interface CityAggregate {
  placeId: string
  count: number
  minYear: number
  maxYear: number
  coverId: string | null
}

/** The photo's year, or `null` when the camera had no clock. */
export function yearOf(photo: Photo): number | null {
  return photo.bucket ? Number(photo.bucket.slice(0, 4)) : null
}

export function albumStats(data: AlbumData): AlbumStats {
  const knownPlaces = new Set(data.places.map((place) => place.id))
  const years = data.photos
    .map(yearOf)
    .filter((year): year is number => year !== null && Number.isFinite(year))
  const cities = new Set(
    data.photos
      .map((photo) => photo.placeId)
      .filter((id): id is string => id !== null && knownPlaces.has(id))
  )

  return {
    photoCount: data.photos.length,
    cityCount: cities.size,
    minYear: years.length > 0 ? Math.min(...years) : null,
    maxYear: years.length > 0 ? Math.max(...years) : null,
  }
}

/**
 * One row per city, biggest first.
 *
 * `coverId` is the earliest photo that actually has a date; a city whose photos
 * are all undated still gets a cover (the first one) rather than none.
 */
export function cityAggregates(data: AlbumData): CityAggregate[] {
  const knownPlaces = new Set(data.places.map((place) => place.id))
  const grouped = new Map<string, { photos: Photo[]; years: number[] }>()

  for (const photo of data.photos) {
    if (!photo.placeId || !knownPlaces.has(photo.placeId)) continue
    const entry = grouped.get(photo.placeId) ?? { photos: [], years: [] }
    entry.photos.push(photo)
    const year = yearOf(photo)
    if (year !== null) entry.years.push(year)
    grouped.set(photo.placeId, entry)
  }

  return [...grouped.entries()]
    .map(([placeId, entry]) => ({
      placeId,
      count: entry.photos.length,
      minYear: entry.years.length > 0 ? Math.min(...entry.years) : 0,
      maxYear: entry.years.length > 0 ? Math.max(...entry.years) : 0,
      coverId: (entry.photos.find((photo) => photo.takenAt !== null) ?? entry.photos[0]).id,
    }))
    .sort((a, b) => b.count - a.count || a.placeId.localeCompare(b.placeId))
}

/**
 * Map dot radius: 3px for one photo, 14px for the busiest city, by √ of the
 * share — area grows with the count, which is what the eye reads as "bigger".
 * A zero denominator is a real case (a map with no cities at all), not a bug.
 */
export function dotRadius(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return 3
  return 3 + 11 * Math.sqrt(count / maxCount)
}

/** Twelve values in 0–1 for the timeline's density strip. */
export function monthDensity(data: AlbumData, year: number): number[] {
  const counts = Array.from({ length: 12 }, () => 0)

  for (const photo of data.photos) {
    if (!photo.bucket) continue
    if (Number(photo.bucket.slice(0, 4)) !== year) continue
    const month = Number(photo.bucket.slice(5, 7))
    if (month >= 1 && month <= 12) counts[month - 1] += 1
  }

  const peak = Math.max(...counts)
  return peak > 0 ? counts.map((count) => count / peak) : counts
}

/**
 * Oldest first, undated last.
 *
 * A photo whose camera had no clock still belongs in the album — it just cannot
 * claim a position on the timeline, so it sorts to the end instead of to 1970.
 */
function byTakenAt(a: Photo, b: Photo): number {
  if (a.takenAt === b.takenAt) return 0
  if (a.takenAt === null) return 1
  if (b.takenAt === null) return -1
  return a.takenAt < b.takenAt ? -1 : 1
}

export function photosByYear(data: AlbumData, year: number): Photo[] {
  return data.photos.filter((photo) => yearOf(photo) === year).sort(byTakenAt)
}

export function photosByPlace(data: AlbumData, placeId: string): Photo[] {
  return data.photos.filter((photo) => photo.placeId === placeId).sort(byTakenAt)
}

/** Photos with no date at all — the "未标注时间" row of the timeline. */
export function undated(data: AlbumData): Photo[] {
  return data.photos.filter((photo) => photo.takenAt === null)
}

/**
 * The photo before and after this one on the timeline.
 *
 * Undated photos are not part of the sequence, so opening one shows no arrows:
 * "next" would have no meaning, and inventing one would send the visitor
 * somewhere they did not ask to go.
 */
export function neighbours(
  data: AlbumData,
  id: string
): { previous: Photo | null; next: Photo | null } {
  const dated = data.photos.filter((photo) => photo.takenAt !== null).sort(byTakenAt)
  const index = dated.findIndex((photo) => photo.id === id)
  if (index < 0) return { previous: null, next: null }
  return { previous: dated[index - 1] ?? null, next: dated[index + 1] ?? null }
}
