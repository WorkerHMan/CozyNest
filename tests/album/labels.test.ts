import { expect, test } from "vitest"

import { photosLabels } from "@/config/photos-labels"

test("每个标签双语都不为空：漏一句就是页面上一条空白", () => {
  for (const [key, value] of Object.entries(photosLabels)) {
    expect(value.zh, `${key}.zh`).not.toBe("")
    expect(value.en, `${key}.en`).not.toBe("")
  }
})

test("空状态的文案是诚实的，不是占位符", () => {
  expect(photosLabels.noPhotos.zh).toContain("还没有照片")
  expect(photosLabels.noPhotos.en.toLowerCase()).toContain("no photos")
})
