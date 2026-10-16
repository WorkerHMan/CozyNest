import type { Localized } from "@/types/content"

/** Shape of a tile, so the grid can reserve the right box before paint. */
export type PhotoAspect = "square" | "portrait" | "landscape"

export interface Photo {
  id: string
  /** Key of the album this photo belongs to (see `photoAlbums`). */
  album: string
  title: Localized<string>
  /**
   * Real description of the picture, not a restatement of the title.
   *
   * This is a required accessibility feature, not decoration: the tile exposes
   * it as its accessible name and the lightbox shows it as a caption, so the
   * gallery is usable without seeing it.
   */
  alt: Localized<string>
  aspect: PhotoAspect
  /** CSS background used in place of a bitmap. See the note below the albums. */
  gradient: string
}

export interface PhotoAlbum {
  key: string
  title: Localized<string>
}

/**
 * Photo albums.
 *
 * There are no binary assets in this repository, so every photo is rendered
 * from a CSS `gradient` instead of an `<img>`/`next/image` source. That is why
 * `Photo` has no `src`: nothing points at a file that does not exist. Real
 * photography is a data change — add a `src` here and render it through
 * `next/image` with the same reserved aspect ratio, exactly as
 * `hero-gate.tsx` already does for wallpapers.
 *
 * The `gradient` strings are the one documented exception to the "tokens only"
 * rule: they are content (they stand in for the image), not chrome.
 */
export const photoAlbums: readonly PhotoAlbum[] = [
  {
    key: "morning-light",
    title: { zh: "晨光", en: "Morning light" },
  },
  {
    key: "city-nights",
    title: { zh: "城市夜色", en: "City nights" },
  },
  {
    key: "desk-corners",
    title: { zh: "桌面一角", en: "Desk corners" },
  },
  {
    key: "mountain-trails",
    title: { zh: "山路", en: "Mountain trails" },
  },
]

export const photos: readonly Photo[] = [
  {
    id: "morning-light-1",
    album: "morning-light",
    title: { zh: "窗台的第一缕光", en: "First light on the sill" },
    alt: {
      zh: "清晨的阳光斜穿过百叶窗，在浅色木地板上投下一道道平行的亮纹。",
      en: "Early sun sloping through venetian blinds, laying parallel bars of light across a pale wooden floor.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(140% 120% at 12% 0%, oklch(0.96 0.06 95) 0%, transparent 55%), radial-gradient(100% 90% at 88% 78%, oklch(0.82 0.09 70) 0%, transparent 60%), linear-gradient(160deg, oklch(0.9 0.045 85) 0%, oklch(0.68 0.06 60) 100%)",
  },
  {
    id: "morning-light-2",
    album: "morning-light",
    title: { zh: "叶尖的露水", en: "Dew on the leaf tip" },
    alt: {
      zh: "特写镜头里，一片深绿色叶子边缘挂着几颗露珠，背景是被虚化的亮色斑块。",
      en: "Close-up of a deep green leaf edge holding a few beads of dew, with a bright blurred background.",
    },
    aspect: "square",
    gradient:
      "radial-gradient(80% 80% at 30% 25%, oklch(0.98 0.03 150) 0%, transparent 45%), radial-gradient(120% 100% at 70% 80%, oklch(0.6 0.13 155) 0%, transparent 60%), linear-gradient(200deg, oklch(0.72 0.12 145) 0%, oklch(0.34 0.08 160) 100%)",
  },
  {
    id: "morning-light-3",
    album: "morning-light",
    title: { zh: "巷口的早餐摊", en: "Breakfast stand at the alley mouth" },
    alt: {
      zh: "狭窄巷口的小摊冒着白色蒸汽，暖色灯泡照亮摆开的蒸笼与塑料凳。",
      en: "A small stand at a narrow alley mouth steaming, warm bulbs lighting stacked bamboo baskets and plastic stools.",
    },
    aspect: "portrait",
    gradient:
      "radial-gradient(120% 90% at 50% 12%, oklch(0.94 0.07 80) 0%, transparent 52%), radial-gradient(90% 70% at 20% 85%, oklch(0.55 0.1 40) 0%, transparent 58%), linear-gradient(200deg, oklch(0.7 0.09 55) 0%, oklch(0.3 0.05 35) 100%)",
  },
  {
    id: "city-nights-1",
    album: "city-nights",
    title: { zh: "雨夜的霓虹街口", en: "Neon crossing on a rainy night" },
    alt: {
      zh: "湿漉漉的柏油路上倒映着青色与品红色的霓虹招牌，行人的伞影被拉长。",
      en: "Cyan and magenta neon signs reflected in wet asphalt, with the shadows of umbrellas stretched long.",
    },
    aspect: "portrait",
    gradient:
      "radial-gradient(90% 70% at 25% 20%, oklch(0.72 0.2 330) 0%, transparent 52%), radial-gradient(110% 80% at 80% 70%, oklch(0.68 0.16 200) 0%, transparent 58%), linear-gradient(190deg, oklch(0.3 0.09 300) 0%, oklch(0.14 0.05 265) 100%)",
  },
  {
    id: "city-nights-2",
    album: "city-nights",
    title: { zh: "天桥上的车流光轨", en: "Light trails from the footbridge" },
    alt: {
      zh: "从天桥俯拍的高架路，长时间曝光把车灯拉成红白两色的连续光带。",
      en: "An elevated road shot from a footbridge, where a long exposure smears headlights into red and white bands.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(120% 60% at 15% 30%, oklch(0.7 0.18 25) 0%, transparent 55%), radial-gradient(130% 60% at 85% 60%, oklch(0.75 0.14 60) 0%, transparent 55%), linear-gradient(175deg, oklch(0.26 0.07 275) 0%, oklch(0.12 0.04 270) 100%)",
  },
  {
    id: "city-nights-3",
    album: "city-nights",
    title: { zh: "便利店门口的灯光", en: "Light spilling from a convenience store" },
    alt: {
      zh: "深夜便利店的白光洒在人行道上，玻璃门上贴着几张促销海报。",
      en: "Late-night fluorescent light from a convenience store washing over the pavement, promo posters taped to the glass door.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(100% 90% at 60% 45%, oklch(0.95 0.04 190) 0%, transparent 55%), radial-gradient(80% 70% at 15% 85%, oklch(0.5 0.1 220) 0%, transparent 60%), linear-gradient(200deg, oklch(0.34 0.06 230) 0%, oklch(0.16 0.04 250) 100%)",
  },
  {
    id: "city-nights-4",
    album: "city-nights",
    title: { zh: "楼顶望下去的街区", en: "Blocks seen from a rooftop" },
    alt: {
      zh: "从楼顶往下看的密集街区，一格格的窗灯与楼间空隙里的深色街道形成对比。",
      en: "A dense block of buildings seen from a rooftop, grid after grid of lit windows against dark streets in the gaps.",
    },
    aspect: "square",
    gradient:
      "radial-gradient(70% 70% at 30% 30%, oklch(0.86 0.1 90) 0%, transparent 50%), radial-gradient(90% 90% at 75% 75%, oklch(0.55 0.1 260) 0%, transparent 55%), linear-gradient(210deg, oklch(0.4 0.07 275) 0%, oklch(0.16 0.04 265) 100%)",
  },
  {
    id: "desk-corners-1",
    album: "desk-corners",
    title: { zh: "焊台与元件盒", en: "Soldering station and parts trays" },
    alt: {
      zh: "桌面上摊开的元件盒按阻值分格，旁边是烙铁架、松香和一块未焊完的洞洞板。",
      en: "Parts trays sorted by resistance, next to an iron stand, flux, and a half-soldered prototyping board.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(110% 90% at 20% 15%, oklch(0.86 0.08 55) 0%, transparent 55%), radial-gradient(90% 80% at 85% 80%, oklch(0.45 0.08 40) 0%, transparent 58%), linear-gradient(170deg, oklch(0.62 0.07 65) 0%, oklch(0.28 0.05 45) 100%)",
  },
  {
    id: "desk-corners-2",
    album: "desk-corners",
    title: { zh: "屏幕上的逻辑分析仪波形", en: "Logic analyser traces on screen" },
    alt: {
      zh: "暗色界面上排着四条数字通道的方波，其中第三条有一段明显被拉长的低电平。",
      en: "Four digital channels of square waves on a dark interface, the third showing one visibly stretched low pulse.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(80% 70% at 25% 20%, oklch(0.6 0.14 160) 0%, transparent 52%), radial-gradient(120% 80% at 80% 80%, oklch(0.45 0.1 200) 0%, transparent 55%), linear-gradient(180deg, oklch(0.24 0.05 220) 0%, oklch(0.11 0.03 250) 100%)",
  },
  {
    id: "desk-corners-3",
    album: "desk-corners",
    title: { zh: "笔记本与一杯冷掉的茶", en: "Notebook and a cup of cold tea" },
    alt: {
      zh: "手写满页的方格笔记本压在键盘边，右手边一只玻璃杯里剩半杯茶水。",
      en: "A grid notebook filled with handwriting tucked against a keyboard, half a glass of tea to the right.",
    },
    aspect: "portrait",
    gradient:
      "radial-gradient(100% 80% at 70% 15%, oklch(0.9 0.05 110) 0%, transparent 55%), radial-gradient(90% 70% at 20% 85%, oklch(0.48 0.09 130) 0%, transparent 58%), linear-gradient(195deg, oklch(0.68 0.07 120) 0%, oklch(0.3 0.05 145) 100%)",
  },
  {
    id: "mountain-trails-1",
    album: "mountain-trails",
    title: { zh: "山脊线上的云海", en: "Sea of cloud from the ridge line" },
    alt: {
      zh: "海拔高处向下望，白云填满整条山谷，只露出几座深色山峰的尖顶。",
      en: "Looking down from high ground, cloud filling the whole valley with only a few dark peaks showing through.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(140% 100% at 25% 15%, oklch(0.98 0.01 240) 0%, transparent 55%), radial-gradient(120% 90% at 80% 70%, oklch(0.62 0.09 235) 0%, transparent 58%), linear-gradient(170deg, oklch(0.8 0.05 230) 0%, oklch(0.36 0.06 255) 100%)",
  },
  {
    id: "mountain-trails-2",
    album: "mountain-trails",
    title: { zh: "杉树林中的石阶", en: "Stone steps through a fir forest" },
    alt: {
      zh: "笔直的石阶在深色杉树之间向上延伸，脚下铺着厚厚一层褐色落叶。",
      en: "Straight stone steps climbing between dark firs, a thick layer of brown needles underfoot.",
    },
    aspect: "portrait",
    gradient:
      "radial-gradient(90% 70% at 50% 20%, oklch(0.82 0.08 105) 0%, transparent 55%), radial-gradient(120% 90% at 20% 90%, oklch(0.4 0.08 145) 0%, transparent 58%), linear-gradient(200deg, oklch(0.5 0.08 135) 0%, oklch(0.2 0.05 155) 100%)",
  },
  {
    id: "mountain-trails-3",
    album: "mountain-trails",
    title: { zh: "半山腰的溪流", en: "Stream at the halfway point" },
    alt: {
      zh: "浅溪漫过一片灰色碎石，长曝光让水流看起来像一条连续的白色丝带。",
      en: "A shallow stream over grey gravel, a long exposure turning the water into one continuous white ribbon.",
    },
    aspect: "square",
    gradient:
      "radial-gradient(100% 80% at 30% 25%, oklch(0.97 0.02 195) 0%, transparent 50%), radial-gradient(110% 90% at 75% 80%, oklch(0.58 0.1 200) 0%, transparent 58%), linear-gradient(180deg, oklch(0.76 0.06 195) 0%, oklch(0.3 0.05 215) 100%)",
  },
  {
    id: "mountain-trails-4",
    album: "mountain-trails",
    title: { zh: "日落时的山脊投影", en: "Ridge shadows at sunset" },
    alt: {
      zh: "低角度的夕阳把山的影子投向对面山坡，暖橙色覆盖了整片草甸。",
      en: "A low sun throwing the mountain's shadow onto the facing slope, warm orange spreading over the whole meadow.",
    },
    aspect: "landscape",
    gradient:
      "radial-gradient(130% 90% at 15% 65%, oklch(0.85 0.16 65) 0%, transparent 55%), radial-gradient(120% 100% at 85% 20%, oklch(0.6 0.14 25) 0%, transparent 58%), linear-gradient(200deg, oklch(0.66 0.12 45) 0%, oklch(0.26 0.06 300) 100%)",
  },
]

export function isPhotoAlbumKey(value: string | undefined): boolean {
  return (
    typeof value === "string" && photoAlbums.some((album) => album.key === value)
  )
}

export function getPhotosByAlbum(key: string): readonly Photo[] {
  return photos.filter((photo) => photo.album === key)
}
