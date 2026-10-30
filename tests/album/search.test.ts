import { expect, test } from "vitest"

import { conceptIdsFor } from "@/lib/album/concepts"
import { parseQuery } from "@/lib/album/search"
import { data } from "./fixtures"

test("中文别名映射到概念：小狗 → dog", () => {
  expect(conceptIdsFor("小狗")).toEqual(["dog"])
})

test("同一个概念的其它说法也进得来：柴犬 / 狗狗 / 汪", () => {
  for (const word of ["柴犬", "狗狗", "汪"]) {
    expect(conceptIdsFor(word), word).toEqual(["dog"])
  }
})

test("英文概念名本身也认", () => {
  expect(conceptIdsFor("dog")).toEqual(["dog"])
})

test("没收录的词不硬凑概念", () => {
  expect(conceptIdsFor("没收录的词")).toEqual([])
})

test("小狗 2023 → 一次查询拆成标签与年份", () => {
  expect(parseQuery("小狗 2023", data())).toEqual({
    terms: ["小狗"],
    year: 2023,
    placeId: null,
    albumId: null,
  })
})

test("只输入空格 → 空查询，不是搜索失败", () => {
  expect(parseQuery("   ", data())).toEqual({ terms: [], year: null, placeId: null, albumId: null })
})

test("不像年份的数字不被当成年份", () => {
  expect(parseQuery("1800", data()).year).toBeNull()
  expect(parseQuery("20233", data()).year).toBeNull()
})

test("地点名（中英）都能识别成城市", () => {
  expect(parseQuery("杭州", data()).placeId).toBe("hz")
  expect(parseQuery("Hangzhou", data()).placeId).toBe("hz")
  expect(parseQuery("hangzhou", data()).placeId).toBe("hz")
})

test("多个词都落在 terms 里，顺序保留", () => {
  expect(parseQuery("海边 日落", data()).terms).toEqual(["海边", "日落"])
})

test("搜索载荷 gzip 后仍在 120KB 预算内（超了就该拆索引）", async () => {
  const { gzipSync } = await import("node:zlib")
  const { toSearchItems } = await import("@/lib/album/search")
  const { albumData } = await import("@/data/album")
  const bytes = gzipSync(Buffer.from(JSON.stringify(toSearchItems(albumData)))).length
  expect(bytes).toBeLessThan(120 * 1024)
})
