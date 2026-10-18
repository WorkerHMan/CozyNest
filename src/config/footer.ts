import type { Localized } from "@/types/content"

/**
 * Site-wide footer content.
 *
 * ## The filing number is a placeholder
 *
 * `filing` below is **not a real ICP filing**. A filing is issued per domain by
 * MIIT and cannot be invented; publishing a made-up number is not just wrong, it
 * is a compliance problem. It is here so the layout is complete, and the footer
 * renders the row only when the value is non-empty — clear it, or replace it with
 * the real number, before this site is deployed.
 */
export const footer = {
  /** Replace with the real filing number, or `""` to hide the row. */
  filing: {
    label: "京ICP备00000000号-1",
    href: "https://beian.miit.gov.cn/",
  },

  /** Shown in the bottom bar as 设计人 / Designed by. */
  designer: "CozyNest",

  /**
   * Uptime counts from this day. A fixed date, never `new Date()` at module
   * scope: the page is prerendered, and reading the clock during prerender is a
   * build error under `cacheComponents`.
   */
  launchedOn: "2026-01-01",

  /**
   * Visitor counter: busuanzi (不蒜子), the zero-config counter used by most
   * Chinese personal sites.
   *
   * It reports site UV, site PV and page PV — and **nothing daily**. There is no
   * "today's visitors" figure to be had from a free counter: counting unique
   * visitors per day requires storing a row per day, i.e. a backend. The footer
   * therefore shows 本站访客 (UV) and 本站浏览 (PV) instead of inventing a
   * "today" number.
   *
   * The script is loaded lazily and only mutates its own `<span>`s; if an ad
   * blocker eats it, the spans keep their em dash and nothing breaks.
   */
  counter: {
    script: "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js",
    /** Element ids the script writes into — must stay in sync with the footer. */
    uvId: "busuanzi_value_site_uv",
    pvId: "busuanzi_value_site_pv",
  },

  /** Third-party platforms.
   *
   * GitHub points at the profile. The QR entries point at the **image itself**:
   * clicking opens the picture at full size in a new tab, which is what the owner
   * asked for — simpler than a popover, and it works on touch, where hover does
   * not exist. Replace the files in `public/footer/` and nothing else changes.
   */
  platforms: [
    { id: "github", href: "https://github.com/WorkerHMan", newTab: true },
    { id: "wechat", href: "/footer/qr-wechat.jpg", newTab: true },
    { id: "qq", href: "/footer/qr-qq.jpg", newTab: true },
    { id: "tipWechat", href: "/footer/qr-tip1.jpg", newTab: true },
    { id: "tipAlipay", href: "/footer/qr-tip2.jpg", newTab: true },
    { id: "friends", href: "/friends", newTab: false },
  ] as const,

  labels: {
    sections: { zh: "站点导航", en: "Sections" },
    about: { zh: "关于本站", en: "About" },
    platforms: { zh: "联系方式", en: "Contact" },
    siteInfo: { zh: "站点信息", en: "Site info" },
    filing: { zh: "备案", en: "Filing" },
    designer: { zh: "设计人", en: "Designed by" },
    uptime: { zh: "已运行", en: "Up for" },
    /* Unit suffixes for the uptime counter. Chinese spells them out; English
       uses the conventional short forms. */
    days: { zh: "天", en: "d" },
    hours: { zh: "小时", en: "h" },
    minutes: { zh: "分钟", en: "m" },
    seconds: { zh: "秒", en: "s" },
    today: { zh: "今日访客", en: "Today" },
    total: { zh: "本站访客", en: "Visitors" },
    views: { zh: "本站浏览", en: "Page views" },
    visitorsOff: {
      zh: "由不蒜子统计，显示 — 说明脚本被拦截",
      en: "Counted by busuanzi; an em dash means the script was blocked",
    },
    rights: { zh: "保留所有权利", en: "All rights reserved" },
    openImage: { zh: "打开图片", en: "Open the image" },
    qrPlaceholder: { zh: "二维码占位图", en: "Placeholder QR code" },
    friends: { zh: "友链", en: "Friends" },
    /* Two tip jars, not one: the codes belong to different payment apps, so they
       get their own buttons and their own brand marks. */
    tipWechat: { zh: "微信赞赏", en: "Tip via WeChat" },
    tipAlipay: { zh: "支付宝赞赏", en: "Tip via Alipay" },
    wechat: { zh: "微信", en: "WeChat" },
    qq: { zh: "QQ", en: "QQ" },
    github: { zh: "GitHub", en: "GitHub" },
  } satisfies Record<string, Localized<string>>,
} as const
