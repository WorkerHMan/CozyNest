import type { Localized } from "@/types/content"

export interface HeroSlide {
  /** File in `public/`. 1920 × 1080 minimum, WebP preferred. */
  src: string
  alt: Localized<string>
}

/**
 * Home cover carousel.
 *
 * ## Adding a wallpaper
 *
 * Drop a **1920 × 1080 or larger** WebP into `public/hero/` and append `{ src,
 * alt }` to `slides`. Nothing else changes: the component derives the arrows,
 * the dots and the counter from the array length, and the first slide is the
 * only one marked `priority`.
 *
 * Keep the middle of the artwork relatively calm — the site wordmark sits dead
 * centre (and a music player goes directly beneath it).
 */
export const homeBanner = {
  /**
   * The creed pool, shown under the wordmark. A different one is drawn each time
   * the wallpaper changes, so the two move together.
   *
   * They are all *working* beliefs rather than slogans: patience, craft,
   * long-term thinking, and the design principle this site is actually built on
   * (少即是多 / less is more). Adding one is a single line.
   */
  mottos: [
    {
      zh: "慢就是快，少即是多",
      en: "Slow is fast. Less is more.",
    },
    {
      zh: "路虽远，行则将至",
      en: "However long the road, walking gets you there.",
    },
    {
      zh: "把复杂留给自己，把简单留给别人",
      en: "Keep the complexity. Hand over the simplicity.",
    },
    {
      zh: "先做完，再做好",
      en: "Finish it first, then make it good.",
    },
    {
      zh: "不积跬步，无以至千里",
      en: "No thousand-mile journey without the first small step.",
    },
    {
      zh: "做一个长期主义者",
      en: "Play the long game.",
    },
  ] as readonly Localized<string>[],
  slides: [
    {
      src: "/hero/dusk-lake.webp",
      alt: {
        zh: "夜晚的雪山下，蜡笔小新牵着小白走在木栈道上，路灯与房屋的暖光映在深蓝色的夜色里",
        en: "Crayon Shin-chan walking his dog along a boardwalk beneath snowy mountains at night, warm lamplight glowing against the deep blue sky",
      },
    },
    {
      src: "/hero/anime-profile.webp",
      alt: {
        zh: "水花飞溅中的二次元少女侧脸，深蓝色调与暖色逆光",
        en: "An anime girl in profile among splashing water, deep blue tones with a warm backlight",
      },
    },
    {
      src: "/hero/winter-snow.webp",
      alt: {
        zh: "雪地里一位裹着黑色围巾的少女特写，冷蓝色调与飘落的雪花",
        en: "Close portrait of a young woman in a black scarf in the snow, cool blue tones and falling snow",
      },
    },
    {
      src: "/hero/rooftop-berries.webp",
      alt: {
        zh: "蓝天下枝叶繁茂的老树与红色果实，下方是青瓦屋顶，一只白猫走在屋脊上",
        en: "An old tree heavy with green leaves and red fruit against a blue sky, a tiled roof below and a white cat walking along its ridge",
      },
    },
    {
      src: "/hero/cartoon-goats.webp",
      alt: {
        zh: "卡通风格：喜羊羊坐在树下，闭着眼睛微笑",
        en: "Cartoon artwork of the Pleasant Goat sitting under a tree, smiling with his eyes closed",
      },
    },
    {
      src: "/hero/anime-sleep.webp",
      alt: {
        zh: "二次元插画：少女躺在床上举起星纹薄被，窗外是夜色与星空",
        en: "Anime illustration of a girl on a bed holding up a star-patterned sheet, night sky beyond the window",
      },
    },
  ] as readonly HeroSlide[],

  /**
   * No attribution chip by default: these are the owner's own desktop
   * wallpapers. Set a bilingual string here if a credit is ever needed.
   */
  credit: null as Localized<string> | null,

  /** Accessible names for the carousel controls. */
  labels: {
    region: { zh: "壁纸轮播", en: "Wallpaper carousel" },
    previous: { zh: "上一张壁纸", en: "Previous wallpaper" },
    next: { zh: "下一张壁纸", en: "Next wallpaper" },
    goTo: { zh: "切换到第 {n} 张壁纸", en: "Show wallpaper {n}" },
    counter: { zh: "第 {n} 张，共 {total} 张", en: "Wallpaper {n} of {total}" },
    pauseRotation: { zh: "暂停自动轮播", en: "Pause automatic rotation" },
    startRotation: { zh: "开始自动轮播", en: "Start automatic rotation" },
    enter: { zh: "进入内容", en: "Enter" },
  },

  /**
   * Darkens the centre of the artwork so the wordmark keeps its contrast no
   * matter which wallpaper is showing. Built from the background token rather
   * than a literal colour, so it follows the theme.
   */
  scrim:
    "radial-gradient(ellipse 60% 48% at 50% 46%, color-mix(in oklab, var(--background) 82%, transparent) 0%, color-mix(in oklab, var(--background) 34%, transparent) 58%, transparent 78%)",

  /** Fallback artwork if `slides` is ever emptied, so the cover cannot break. */
  placeholderBackground: [
    "radial-gradient(ellipse 60% 58% at 18% 26%, oklch(0.88 0.075 25 / 0.55), transparent 62%)",
    "radial-gradient(ellipse 56% 62% at 78% 30%, oklch(0.86 0.085 305 / 0.5), transparent 64%)",
    "radial-gradient(ellipse 66% 52% at 52% 88%, oklch(0.9 0.075 168 / 0.45), transparent 66%)",
  ].join(", "),
} as const
