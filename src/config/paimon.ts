import type { Localized } from "@/types/content"

/**
 * 派蒙看板娘 — the mascot's copy and geometry.
 *
 * ## The lines are original
 *
 * They must stay that way. Paimon's actual dialogue and voice lines are miHoYo's
 * copyrighted material; the character drawn here is a hand-drawn fan piece and
 * the text has to be written fresh, not quoted.
 *
 * ## Size is a constant, not a setting
 *
 * The owner asked for a deliberately small v1, so only "show the mascot" is
 * exposed. Size, speech frequency and "home only" are fixed here and can become
 * settings later without moving anything else.
 */
export const paimon = {
  /** Rendered width in CSS pixels. */
  size: 330,

  /**
   * The mascot's default spot: right side, lower-middle. Further left than the
   * edge because the quick menu needs room on its right.
   */
  defaultPosition: { x: 74, y: 58 },

  /** Keep the whole figure on screen when dragged. */
  clamp: { minX: 8, maxX: 92, minY: 20, maxY: 88 },

  /**
   * Room reserved on the right for the arc menu: the menu radius (size/2 + 30),
   * half a 44px button, and a little air. 195 + 22 + 11 = 228. Used as a CSS
   * clamp so neither the character nor its menu can be pushed off screen.
   */
  rightReserve: 228,
  bottomReserve: 225,

  /** Auto-dismiss the quick menu after this long without interaction. */
  menuIdleMs: 10_000,

  /** How long a poke's reaction animation runs. */
  pokeMs: 900,

  /** Bubble lifetime, then the fade. */
  bubbleMs: 2800,
  bubbleFadeMs: 300,

  /** Idle self-talk interval; only runs while the tab is visible. */
  idleMs: 60_000,

  /** A press that moves further than this is a drag, not a poke. */
  dragThresholdPx: 6,

  /**
   * 撒娇卖萌 lines. Shared by pokes and idle chatter, and never repeated twice
   * in a row.
   */
  lines: [
    { zh: "欸嘿～再戳我，我可要生气啦（才不会）", en: "Hehe~ poke me again and Paimon will get mad. (She won't.)" },
    { zh: "派蒙可是你最好的伙伴哦！", en: "Paimon is your bestest buddy, you know!" },
    { zh: "好饿……你带吃的了吗？", en: "So hungry… did you bring snacks?" },
    { zh: "别戳啦，头发都要乱掉了！", en: "Stop poking! You'll mess up Paimon's hair!" },
    { zh: "你是不是觉得派蒙很可爱？说吧说吧～", en: "You think Paimon is cute, right? Go on, say it~" },
    { zh: "哼哼，派蒙可是很厉害的！", en: "Hmph, Paimon is very impressive, thank you!" },
    { zh: "再摸一下，就一下下哦", en: "One more pat. Just one, okay?" },
    { zh: "你忙你的，派蒙在这儿陪着你", en: "You do your thing — Paimon will stay right here." },
    { zh: "有派蒙在，什么都不用怕！", en: "With Paimon around, nothing to worry about!" },
    { zh: "唔……让我猜猜你在想什么", en: "Mmm… Paimon is guessing what you're thinking." },
    { zh: "今天也要好好吃饭哦", en: "Remember to eat properly today, okay?" },
    { zh: "派蒙会一直一直站在这里的！", en: "Paimon will stay right here, always!" },
  ] as readonly Localized<string>[],

  labels: {
    poke: { zh: "戳一下派蒙", en: "Poke Paimon" },
    menu: { zh: "快捷设置", en: "Quick settings" },
    restore: { zh: "把派蒙叫回来", en: "Bring Paimon back" },
    handleHint: { zh: "点一下叫回派蒙，右击打开设置", en: "Click to bring Paimon back, right-click for settings" },
    showPaimon: { zh: "显示派蒙", en: "Show Paimon" },
  },
} as const
