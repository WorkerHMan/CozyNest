import Link from "next/link"

import { Container } from "@/components/layout/container"
import { footer } from "@/config/footer"
import type { Localized } from "@/types/content"
import { defaultLocale, isLocale } from "@/i18n"
import { cn } from "@/lib/utils"

const focusRing =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const copy = {
  eyebrow: { zh: "法律", en: "Legal" },
  title: { zh: "免责声明", en: "Disclaimer" },
  updated: { zh: "最后更新：2026 年 10 月", en: "Last updated: October 2026" },
  preamble: {
    zh: "这是一个个人技术站点，不是公司，也不是任何形式的专业服务机构。下面这些话尽量说人话，但请理解它不构成法律意见。",
    en: "This is a personal technical site — not a company, not a professional service of any kind. What follows is written in plain language, but it is not legal advice.",
  },
  backHome: { zh: "返回首页", en: "Back to home" },
}

const sections: readonly { title: Localized<string>; body: Localized<string[]> }[] = [
  {
    title: { zh: "一、关于本站", en: "1. About this site" },
    body: {
      zh: [
        "本站由个人搭建与维护，用于记录技术笔记、项目作品与个人兴趣内容。站点不以营利为目的，页面上的观点仅代表我个人。",
      ],
      en: [
        "This site is built and maintained by one person to keep technical notes, project work and personal interests. It is not run for profit, and the opinions on it are mine alone.",
      ],
    },
  },
  {
    title: { zh: "二、内容准确性", en: "2. Accuracy of content" },
    body: {
      zh: [
        "技术文章写的是我自己遇到问题的过程与结论，可能存在错误、过时或只适用于特定环境的情形。我尽力校对，但不作任何保证。",
        "如果你要照着文章操作——尤其是涉及硬件、电源、驱动、生产环境或数据删除的部分——请先在可回退的环境里验证。因直接照做造成的设备损坏或数据丢失，由操作者自行承担。",
        "文章不是专业建议。涉及法律、医疗、财务等领域的判断，请咨询有资质的专业人士。",
      ],
      en: [
        "Technical posts describe problems I ran into and what I concluded. They may be wrong, outdated, or true only in a particular environment. I proofread them, but I guarantee nothing.",
        "If you follow one — especially anything involving hardware, power, drivers, production systems or deleting data — verify it in an environment you can roll back first. Damage or data loss from following a post is the operator's own risk.",
        "Nothing here is professional advice. For legal, medical or financial questions, talk to someone qualified.",
      ],
    },
  },
  {
    title: { zh: "三、责任限制", en: "3. Limitation of liability" },
    body: {
      zh: [
        "本站内容按「现状」提供，不附带任何明示或默示的担保，包括但不限于适销性、特定用途适用性与不侵权。",
        "在法律允许的最大范围内，我不对因访问、使用或无法使用本站而产生的任何直接、间接、偶然或后果性损失承担责任。",
      ],
      en: [
        'The site is provided "as is", without warranties of any kind, express or implied — including merchantability, fitness for a particular purpose and non-infringement.',
        "To the fullest extent the law allows, I am not liable for any direct, indirect, incidental or consequential loss arising from visiting, using, or being unable to use this site.",
      ],
    },
  },
  {
    title: { zh: "四、版权与署名", en: "4. Copyright and attribution" },
    body: {
      zh: [
        "站点的文字、代码片段与手绘图形，除特别注明外，版权归本站作者所有。转载或引用请注明出处并附上原文链接。",
        "站内音乐均来自可自由使用的授权：Kevin MacLeod 与 Antti Luode 的作品为 CC BY 3.0，另有 CC0 的现场录音。播放器与本页底部保留署名——这是授权条件，不是装饰。",
        "派蒙形象属于米哈游（miHoYo）。本站的派蒙是手绘的二次创作，非官方素材，与米哈游没有任何关联，也未获其认可或赞助。",
        "引用他人内容时会尽量注明来源与链接。若你认为某处侵犯了你的权利，请通过本站的联系方式告知，我会核实后删除或补充署名。",
      ],
      en: [
        "Text, code snippets and hand-drawn artwork on this site are © the author unless stated otherwise. Quote or repost with a credit and a link back.",
        "The music is all freely licensed: Kevin MacLeod and Antti Luode under CC BY 3.0, plus CC0 field recordings. The credit line in the player and this footer satisfies that licence — it is not decoration.",
        "The Paimon character belongs to miHoYo. The one on this site is a hand-drawn fan work: not official material, not affiliated with miHoYo, not endorsed or sponsored by them.",
        "Sources are credited wherever material is quoted. If something here infringes your rights, contact me through the channels on this site and I will verify and remove it or fix the credit.",
      ],
    },
  },
  {
    title: { zh: "五、打赏", en: "5. Tips" },
    body: {
      zh: [
        "赞赏码是自愿的，不构成购买任何商品或服务，也不换取任何承诺、优先支持或特殊待遇。",
        "打赏通常不退。如果发生重复支付或明显误操作，请通过联系方式说明，我会尽量处理。",
      ],
      en: [
        "Any tip is voluntary. It does not buy goods or services, and it does not purchase any promise, priority support or special treatment.",
        "Tips are generally non-refundable. If a payment was duplicated or clearly made by mistake, contact me and I will do what I reasonably can.",
      ],
    },
  },
  {
    title: { zh: "六、隐私与统计", en: "6. Privacy and analytics" },
    body: {
      zh: [
        "本站没有账号系统，也还没有评论功能，因此不收集你的姓名、邮箱或任何账户信息。",
        "阅读进度、音乐开关等偏好只保存在你自己浏览器的 localStorage 里，不会上传。",
        "页面底部有访客计数，使用第三方服务「不蒜子」(busuanzi)。它会在加载时向自己的服务器发送请求以完成计数。如果你启用了广告拦截或被拦截，数字会显示为 —，不影响其它功能。",
        "页脚还会显示你自己的 IP 与今明两天天气：IP 与城市由 ipwho.is 提供，天气由 open-meteo.com 按该坐标查询。这两个请求由你的浏览器直接发出，我不保存任何结果；被拦截时显示为 —。",
        "站点托管方（如托管平台的服务器）可能记录常规访问日志，这不在我的控制范围内。",
      ],
      en: [
        "There are no accounts and no comments yet, so no name, email address or account data is collected.",
        "Reading and playback preferences live in your own browser's localStorage only. Nothing is uploaded.",
        "The footer shows a visitor counter backed by the third-party service busuanzi. Loading it sends a request to their server so the count can happen. If it is blocked, the numbers show an em dash and everything else keeps working.",
        "The footer also shows your own IP, city and a two-day forecast: ipwho.is supplies the IP and coordinates, and open-meteo.com supplies the weather for them. Those requests leave your browser directly; I keep none of the results, and a blocked call renders an em dash.",
        "The hosting provider may keep ordinary access logs. That is outside my control.",
      ],
    },
  },
  {
    title: { zh: "七、第三方链接", en: "7. Third-party links" },
    body: {
      zh: [
        "本站会链接到外部站点（GitHub、友链、授权协议原文等）。这些站点的内容、隐私做法与可用性都不由我控制，我不对其负责。",
      ],
      en: [
        "Links to other sites — GitHub, friend links, licence texts — go somewhere I do not control. I am not responsible for their content, privacy practices or availability.",
      ],
    },
  },
  {
    title: { zh: "八、服务可用性", en: "8. Availability" },
    body: {
      zh: [
        "这是一个个人站点，可能随时改版、调整地址、暂停或彻底下线，不承诺任何可用性或数据保留。",
        "文章可能被修改或删除而不另行通知。需要的资料请自行保存副本。",
      ],
      en: [
        "This is a personal site. It may be redesigned, moved, paused or taken down at any time, with no commitment to availability or to keeping anything.",
        "Posts may be edited or removed without notice. Keep your own copy of anything you need.",
      ],
    },
  },
  {
    title: { zh: "九、法律适用与更新", en: "9. Governing law and changes" },
    body: {
      zh: [
        "本声明适用中华人民共和国法律。若本声明的部分条款被认定无效，其余条款仍然有效。",
        "本声明可能更新，更新后的版本自发布在本页面之时生效，不另行通知。",
      ],
      en: [
        "This disclaimer is governed by the laws of the People's Republic of China. If any part of it is held invalid, the rest stays in force.",
        "This page may change; the new version takes effect when published here, without separate notice.",
      ],
    },
  },
]

/**
 * 免责声明 — a disclaimer written for *this* site.
 *
 * Not a generic legal template: every clause names something the site actually
 * does — CC BY music that requires the credit line, a hand-drawn Paimon that is
 * fan work rather than official material, a buanzani counter that phones home,
 * voluntary tips that buy nothing. Boilerplate that describes a different site
 * protects nobody.
 *
 * It is a Server Component: there is no state here, only prose per locale.
 */
export default async function DisclaimerPage(props: PageProps<"/[locale]/disclaimer">) {
  const { locale: rawLocale } = await props.params
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale

  return (
    <Container className="py-16 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow text-brand">{copy.eyebrow[locale]}</p>
        <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{copy.updated[locale]}</p>
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground">
          {copy.preamble[locale]}
        </p>
      </header>

      <div className="mt-12 max-w-2xl space-y-10">
        {sections.map((section) => (
          <section key={section.title.en}>
            <h2 className="font-heading text-lg font-semibold tracking-tight text-balance">
              {section.title[locale]}
            </h2>
            <div className="mt-2 space-y-3">
              {section.body[locale].map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-sm leading-relaxed text-pretty text-foreground/85"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <Link
          href="/"
          className={cn("transition-colors duration-200 hover:text-foreground", focusRing)}
        >
          {copy.backHome[locale]}
        </Link>
        <span className="font-mono">{footer.designer}</span>
      </div>
    </Container>
  )
}
