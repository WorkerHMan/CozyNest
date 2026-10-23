import { expect, test } from "vitest"

import { placeName } from "@/lib/album/place-name"

test("zh 用中文名", () => {
  expect(placeName({ name: "杭州", nameEn: "Hangzhou" }, "zh")).toBe("杭州")
})

test("en 用英文名，而不是中文名", () => {
  expect(placeName({ name: "杭州", nameEn: "Hangzhou" }, "en")).toBe("Hangzhou")
})

test("缺英文名时退回中文名，不返回空串", () => {
  expect(placeName({ name: "某镇", nameEn: "" }, "en")).toBe("某镇")
})
