/** Formats a duration in seconds as `m:ss`, or `h:mm:ss` past an hour. */
export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value: number) => value.toString().padStart(2, "0")

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`
}
