import type { Localized } from "@/types/content"

/**
 * Photos module copy.
 *
 * Beside the feature, not in the site dictionary — the project's habit for
 * per-module strings (`blog-labels`, `hero-player`, `paimon`).
 *
 * Place names are **not** here on purpose: they follow the content, not the
 * interface (spec §12), so they come from `place.name` / `place.name_en` through
 * `placeName()`. Braces in a string mark a value the caller substitutes.
 */
export const photosLabels = {
  eyebrow: { zh: "相册", en: "Photos" },
  /* Not "相册" again: the eyebrow already says that, and the pair reads as a
     stutter. The blog solves the same problem the same way (博客 / 技术笔记). */
  title: { zh: "去过的地方", en: "Everywhere I've been" },
  intro: {
    zh: "按时间与地点铺开的照片，每一张都是自己拍下、自己挑出来的。",
    en: "Photos laid out by time and place — every one of them taken and picked by hand.",
  },
  count: { zh: "张照片", en: "photos" },
  cities: { zh: "个城市", en: "cities" },
  years: { zh: "年份跨度", en: "years" },

  footprint: { zh: "足迹", en: "Footprint" },
  categories: { zh: "归类", en: "Filed under" },
  albumsGroup: { zh: "相册", en: "Albums" },
  placesGroup: { zh: "地点", en: "Places" },
  tagsGroup: { zh: "主题", en: "Themes" },
  timeline: { zh: "时间轴", en: "Timeline" },
  allPhotos: { zh: "全部", en: "All" },

  searchPlaceholder: { zh: "搜照片", en: "Search photos" },
  searchEmpty: { zh: "没有和「{q}」对上的照片。", en: "Nothing matched “{q}”." },
  searchHint: {
    zh: "试试城市名、年份，或者「海」「山」「夜」。",
    en: "Try a city, a year, or “sea”, “mountain”, “night”.",
  },

  footprintFact: {
    zh: "你去过 {cities} 个城市，最北到 {north}，最南到 {south}。",
    en: "You have been to {cities} cities, from {north} in the north to {south} in the south.",
  },

  noPhotos: { zh: "还没有照片，这个相册刚开张。", en: "No photos yet — this album just opened." },
  noPhotosHint: {
    zh: "照片攒进来之后，这里会按年份和城市铺开。",
    en: "Once photos arrive, this page fills up by year and by city.",
  },

  backToAlbums: { zh: "返回相册", en: "Back to the album" },
  previous: { zh: "上一张", en: "Previous photo" },
  next: { zh: "下一张", en: "Next photo" },
  close: { zh: "关闭", en: "Close" },

  /* Detail rows and map copy. These live here rather than inline in components:
     copy written inside a component drifted — and once arrived mojibake'd after a
     shell edit rewrote the file in the wrong encoding. */
  takenAt: { zh: "时间", en: "Taken" },
  takenPlace: { zh: "地点", en: "Place" },
  noTakenAt: { zh: "没有时间信息", en: "No capture time" },
  photo: { zh: "照片", en: "Photo" },
  noPlaces: {
    zh: "这些照片没有定位信息，所以还画不出足迹。",
    en: "None of these photos carry a location, so there is no footprint to draw yet.",
  },
  mapHint: { zh: "点越大，照片越多", en: "A bigger dot means more photos" },
} satisfies Record<string, Localized<string>>
