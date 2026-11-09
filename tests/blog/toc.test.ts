import { describe, expect, it } from "vitest"

import { slugifyHeadings } from "@/lib/mdx"

describe("slugifyHeadings", () => {
  it("lists h2 and h3 in document order, with GitHub-style ids", () => {
    const source = "## 先看代价\n\n正文。\n\n### 细节\n\n## 什么时候不值得"

    expect(slugifyHeadings(source)).toEqual([
      { id: "先看代价", text: "先看代价", depth: 2 },
      { id: "细节", text: "细节", depth: 3 },
      { id: "什么时候不值得", text: "什么时候不值得", depth: 2 },
    ])
  })

  it("gives repeated headings the same -1 suffixes rehype-slug does", () => {
    // This is the whole point of the function: the table of contents links and the
    // rendered `id` attributes are produced by separate code paths and must agree.
    const entries = slugifyHeadings("## 例子\n\n## 例子\n\n## 例子")

    expect(entries.map((entry) => entry.id)).toEqual(["例子", "例子-1", "例子-2"])
  })

  it("ignores lines inside fenced code, including their comment markers", () => {
    const source = ["## 真标题", "", "```bash", "## 这不是标题", "# 也不是", "```", "", "## 另一个"].join("\n")

    expect(slugifyHeadings(source).map((entry) => entry.text)).toEqual(["真标题", "另一个"])
  })

  it("ignores h1 and h4 — only h2 and h3 become a table of contents", () => {
    const entries = slugifyHeadings("# 标题\n\n## 二级\n\n#### 四级")

    expect(entries.map((entry) => entry.text)).toEqual(["二级"])
  })

  it("strips inline Markdown from the label", () => {
    const entries = slugifyHeadings("## 用 `constexpr` 生成")

    expect(entries[0]).toEqual({ id: "用-constexpr-生成", text: "用 constexpr 生成", depth: 2 })
  })
})
