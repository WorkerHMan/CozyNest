export interface Track {
  id: string
  title: string
  artist: string
  /** Length in seconds, as a number so the player can do arithmetic on it. */
  duration: number
}

export interface Playlist {
  key: string
  title: string
  tracks: readonly Track[]
}

/**
 * Playlists for the local player.
 *
 * There are deliberately **no audio file references** anywhere in this file:
 * nothing here can autoplay, because there is nothing to play. The player
 * renders transport state from this data and says so out loud (see
 * `dict.pages.music.notLoaded`) instead of pretending a track is sounding.
 */
export const playlists: readonly Playlist[] = [
  {
    key: "daily",
    title: "Daily Focus",
    tracks: [
      {
        id: "daily-1",
        title: "Long Way From Home",
        artist: "Kai Engel",
        duration: 274,
      },
      {
        id: "daily-2",
        title: "Cylinder Five",
        artist: "Chris Zabriskie",
        duration: 372,
      },
      {
        id: "daily-3",
        title: "Ice and Snow",
        artist: "Scott Buckley",
        duration: 245,
      },
      {
        id: "daily-4",
        title: "Signal to Noise",
        artist: "Josh Woodward",
        duration: 198,
      },
    ],
  },
  {
    key: "night",
    title: "Night Drive",
    tracks: [
      {
        id: "night-1",
        title: "Divider",
        artist: "Chris Zabriskie",
        duration: 318,
      },
      {
        id: "night-2",
        title: "Undercover Vampire Policeman",
        artist: "Chris Zabriskie",
        duration: 266,
      },
      {
        id: "night-3",
        title: "Snowfall",
        artist: "Scott Buckley",
        duration: 301,
      },
      {
        id: "night-4",
        title: "Wanderlust",
        artist: "Kai Engel",
        duration: 231,
      },
    ],
  },
]

export function isPlaylistKey(value: string | undefined): boolean {
  return (
    typeof value === "string" && playlists.some((list) => list.key === value)
  )
}

export function getPlaylist(key: string): Playlist | undefined {
  return playlists.find((list) => list.key === key)
}
