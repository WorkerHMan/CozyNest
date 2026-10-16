import type { Localized } from "@/types/content"

export interface BoardEntry {
  id: string
  title: Localized<string>
  status: "watching" | "finished"
  year: number
  /** Total episodes aired. */
  episodes: number
  /** Episodes watched so far. */
  watched: number
  /** Out of 10. */
  rating: number
  tags: readonly string[]
  note: Localized<string>
}

/**
 * The anime board.
 *
 * Titles carry both languages because a Chinese title and its English release
 * name are genuinely different strings, not a translation of one another.
 */
export const board: readonly BoardEntry[] = [
  {
    id: "frieren",
    title: { zh: "葬送的芙莉莲", en: "Frieren: Beyond Journey's End" },
    status: "finished",
    year: 2023,
    episodes: 28,
    watched: 28,
    rating: 9,
    tags: ["奇幻", "旅程", "治愈"],
    note: {
      zh: "把「时间尺度不同」这件事拍得最安静的一部。",
      en: "The quietest take I have seen on living on a different timescale.",
    },
  },
  {
    id: "violet",
    title: { zh: "紫罗兰永恒花园", en: "Violet Evergarden" },
    status: "finished",
    year: 2018,
    episodes: 13,
    watched: 13,
    rating: 9,
    tags: ["剧情", "作画", "书信"],
    note: {
      zh: "每一集都在讲同一件事：把说不出口的话写下来。",
      en: "Every episode is about the same thing: writing down what you cannot say.",
    },
  },
  {
    id: "bocchi",
    title: { zh: "孤独摇滚！", en: "Bocchi the Rock!" },
    status: "finished",
    year: 2022,
    episodes: 12,
    watched: 12,
    rating: 8,
    tags: ["音乐", "喜剧", "演出"],
    note: {
      zh: "演出手法比剧情更值得看，第八集值得单独复盘。",
      en: "Watch it for the staging more than the plot — episode eight deserves its own study.",
    },
  },
  {
    id: "aot",
    title: { zh: "进击的巨人", en: "Attack on Titan" },
    status: "finished",
    year: 2013,
    episodes: 87,
    watched: 87,
    rating: 8,
    tags: ["动作", "群像", "长篇"],
    note: {
      zh: "设定展开得很漂亮，收尾留了争议。",
      en: "A gorgeous build-up of its own rules; the landing is contested.",
    },
  },
  {
    id: "summertime",
    title: { zh: "夏日重现", en: "Summer Time Rendering" },
    status: "watching",
    year: 2022,
    episodes: 25,
    watched: 14,
    rating: 8,
    tags: ["悬疑", "循环", "夏天"],
    note: {
      zh: "循环题材里少见的、每一轮都在推进信息量的写法。",
      en: "A time-loop story where every repetition actually advances the information.",
    },
  },
  {
    id: "dungeon-meshi",
    title: { zh: "迷宫饭", en: "Delicious in Dungeon" },
    status: "watching",
    year: 2024,
    episodes: 24,
    watched: 9,
    rating: 8,
    tags: ["奇幻", "美食", "考据"],
    note: {
      zh: "把「迷宫生态」当真的设定来写，观赏门槛其实不低。",
      en: "It treats dungeon ecology as a real system, which asks more of the viewer than it looks.",
    },
  },
] as const
