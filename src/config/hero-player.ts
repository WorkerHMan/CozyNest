/**
 * Track list for the cover music player.
 *
 * ## The audio in this repo
 *
 * All **CC BY 3.0 or CC0** — CC0 needs no attribution, CC BY does. Attribution
 * is a condition of that licence, so the player displays a credit line;
 * removing it puts the site out of compliance.
 *
 * **The first six are Chinese**: Hubei folk songs (a CC0 field recording of
 * 湖北民歌, the only Chinese *vocal* material with a free licence that could be
 * found), then 古筝 / 二胡 pieces by Antti Luode. They lead the list so the site
 * opens with that character.
 *
 * Commercial Chinese pop is tightly licensed and does not appear in the free
 * catalogues — 海阔天空 / 浮夸 / 光辉岁月 are **not** included, because that
 * material is copyrighted.
 *
 * Every file has been checked with a strict MPEG decoder pass — MPEG-1 Layer III
 * only, contiguous frames, well under 0.02% skipped bytes — so none of them is
 * truncated or corrupt. That matters for track skipping: a truncated file cuts
 * out mid-track and looks like "this song won't play".
 *
 * To use your own files, drop them in `public/audio/` and edit `tracks`.
 * 海阔天空 / 浮夸 / 光辉岁月 are **not** included: that is copyrighted material.
 *
 * ## Licences
 *
 * Chinese instrument (Antti Luode):
 * - Guzheng Morning, Señor Guzheng and the Happy Monks
 * - Dances With Erhu, More Erhu!, Erhu on 3
 *
 * Previously added (Kevin MacLeod, incompetech.com):
 * - Serene, Midsummer Sky, Reaching Out, Lone Harvest, Swimmey Texture,
 *   Piano Between
 *
 * Licence text: https://creativecommons.org/licenses/by/3.0/
 * Source: https://commons.wikimedia.org/
 */
export interface Track {
  id: string
  /** Track titles are proper nouns, so they are not translated. */
  title: string
  artist: string
  src: string
}

export const heroPlayer = {
  tracks: [
    {
      id: "guzheng-morning",
      title: "Guzheng Morning",
      artist: "Antti Luode · 古筝",
      src: "/audio/guzheng-morning.mp3",
    },
    {
      id: "hubei-folk-songs",
      title: "Hubei Folk Songs",
      artist: "湖北民歌 · CC0",
      src: "/audio/hubei-folk-songs.mp3",
    },
    {
      id: "beijing-park-choir",
      title: "Beijing Park Choir",
      artist: "北京公园合唱 · CC0",
      src: "/audio/beijing-park-choir.mp3",
    },
    {
      id: "guzheng-happy-monks",
      title: "Señor Guzheng and the Happy Monks",
      artist: "Antti Luode · 古筝",
      src: "/audio/guzheng-happy-monks.mp3",
    },
    {
      id: "dances-with-erhu",
      title: "Dances With Erhu",
      artist: "Antti Luode · 二胡",
      src: "/audio/dances-with-erhu.mp3",
    },
    {
      id: "more-erhu",
      title: "More Erhu!",
      artist: "Antti Luode · 二胡",
      src: "/audio/more-erhu.mp3",
    },
    {
      id: "erhu-on-3",
      title: "Erhu on 3",
      artist: "Antti Luode · 二胡",
      src: "/audio/erhu-on-3.mp3",
    },
    { id: "serene", title: "Serene", artist: "Kevin MacLeod", src: "/audio/serene.mp3" },
    {
      id: "midsummer-sky",
      title: "Midsummer Sky",
      artist: "Kevin MacLeod",
      src: "/audio/midsummer-sky.mp3",
    },
    {
      id: "reaching-out",
      title: "Reaching Out",
      artist: "Kevin MacLeod",
      src: "/audio/reaching-out.mp3",
    },
    {
      id: "lone-harvest",
      title: "Lone Harvest",
      artist: "Kevin MacLeod",
      src: "/audio/lone-harvest.mp3",
    },
    {
      id: "swimmey-texture",
      title: "Swimmey Texture",
      artist: "Kevin MacLeod",
      src: "/audio/swimmey-texture.mp3",
    },
    {
      id: "piano-between",
      title: "Piano Between",
      artist: "Kevin MacLeod",
      src: "/audio/piano-between.mp3",
    },
  ] as readonly Track[],

  /**
   * CC BY 3.0 requires attribution, so it is displayed rather than buried in a
   * comment. Names both authors; the link goes to the licence text because the
   * line covers two different sources.
   */
  credit: "Kevin MacLeod · Antti Luode · CC BY 3.0",
  creditHref: "https://creativecommons.org/licenses/by/3.0/",

  /**
   * Starting volume, 0–1. Half of the element's default (1.0): music that
   * arrives unasked-for should sit under the page, not on top of it.
   */
  volume: 0.5,

  labels: {
    region: { zh: "音乐播放器", en: "Music player" },
    play: { zh: "播放", en: "Play" },
    pause: { zh: "暂停", en: "Pause" },
    previous: { zh: "上一首", en: "Previous track" },
    next: { zh: "下一首", en: "Next track" },
    close: { zh: "收起播放器", en: "Collapse the player" },
    open: { zh: "打开音乐播放器", en: "Open the music player" },
    openPlaying: { zh: "正在播放，打开播放器", en: "Playing — open the player" },
    openBlocked: {
      zh: "浏览器拦截了自动播放，点一下页面即可开始，或打开播放器",
      en: "Autoplay was blocked — click the page to start, or open the player",
    },
    musicCredit: { zh: "音乐来源", en: "Music" },
    seek: { zh: "播放进度", en: "Playback position" },
    unavailable: { zh: "音频暂不可用", en: "Audio unavailable" },
    autoplayBlocked: {
      zh: "浏览器阻止了自动播放，点一下播放键即可",
      en: "Your browser blocked autoplay — press play to start",
    },
  },
} as const
