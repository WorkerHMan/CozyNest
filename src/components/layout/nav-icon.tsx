import {
  BookOpen,
  Camera,
  FolderKanban,
  Gamepad2,
  Home,
  Music2,
  Newspaper,
  Video,
  Wrench,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { NavKey } from "@/config/site"
import { cn } from "@/lib/utils"

/**
 * One icon per section, in one place so the top bar, the mobile menu and the
 * footer cannot drift apart.
 *
 * Lives here rather than in `config/site.ts` to keep that file plain data: the
 * icon library is then only pulled in by components that actually draw one.
 *
 * ## Colours
 *
 * Each section gets its own hue, spread around the wheel so no two neighbours
 * read as the same colour: green → amber → violet → blue → rose → slate →
 * orange → cyan. `files` is deliberately the neutral one — a file cabinet is not
 * an occasion.
 *
 * Each entry carries a light **and** a dark shade rather than one fixed hex:
 * a 600-level colour on white and a 400-level colour on near-black both clear
 * the 3:1 non-text contrast minimum. The icons are decorative (`aria-hidden`)
 * and always sit next to a text label, so colour never has to carry meaning on
 * its own — this is polish, not information.
 *
 * The choices lean on what each section *is*: a newspaper for writing, a camera
 * for photos, a text page for the file cabinet, a board for projects.
 */
const navIcons: Record<NavKey, { Icon: LucideIcon; color: string }> = {
  home: { Icon: Home, color: "text-emerald-600 dark:text-emerald-400" },
  blog: { Icon: Newspaper, color: "text-amber-600 dark:text-amber-400" },
  projects: { Icon: FolderKanban, color: "text-blue-600 dark:text-blue-400" },
  music: { Icon: Music2, color: "text-fuchsia-600 dark:text-fuchsia-400" },
  photos: { Icon: Camera, color: "text-rose-600 dark:text-rose-400" },
  video: { Icon: Video, color: "text-cyan-600 dark:text-cyan-400" },
  books: { Icon: BookOpen, color: "text-violet-600 dark:text-violet-400" },
  tools: { Icon: Wrench, color: "text-orange-600 dark:text-orange-400" },
  games: { Icon: Gamepad2, color: "text-indigo-600 dark:text-indigo-400" },
}

export interface NavIconProps {
  name: NavKey
  className?: string
}

/**
 * Decorative: the label beside it already names the destination, so `aria-hidden`
 * keeps screen readers from announcing the icon as well. Callers size it; the
 * colour is fixed per section so the row reads as a set.
 */
export function NavIcon({ name, className }: NavIconProps) {
  const { Icon, color } = navIcons[name]
  return <Icon aria-hidden className={cn(color, className)} />
}
