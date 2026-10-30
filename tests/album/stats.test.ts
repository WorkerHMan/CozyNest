import { expect, test } from "vitest"

import {
  albumStats,
  cityAggregates,
  dotRadius,
  monthDensity,
  neighbours,
  photosByPlace,
  photosByYear,
  undated,
} from "@/lib/album/stats"
import { data, photo } from "./fixtures"

test("0 张照片：不崩，年份为 null", () => {
  expect(albumStats(data())).toEqual({ photoCount: 0, cityCount: 0, minYear: null, maxYear: null })
})

test("1 张照片：跨度是单年", () => {
  const s = albumStats(data(photo({ id: "a" })))
  expect([s.minYear, s.maxYear]).toEqual([2023, 2023])
})

test("没有拍摄时间的照片不参与年份跨度", () => {
  const s = albumStats(data(photo({ id: "a", takenAt: null, bucket: null })))
  expect([s.minYear, s.maxYear]).toEqual([null, null])
})

test("没有 GPS 的照片不计入城市数，但计入张数", () => {
  const s = albumStats(data(photo({ id: "a", placeId: null }), photo({ id: "b", placeId: "hz" })))
  expect(s.cityCount).toBe(1)
  expect(s.photoCount).toBe(2)
})

test("dotRadius：满额 14、零额 3、分母为 0 不除零", () => {
  expect(dotRadius(100, 100)).toBe(14)
  expect(dotRadius(0, 0)).toBe(3)
  expect(dotRadius(1, 100)).toBeCloseTo(3 + 11 * 0.1, 5)
  expect(dotRadius(50, 100)).toBeGreaterThan(dotRadius(25, 100))
})

test("cityAggregates 每张照片只计一次，并按 count 降序", () => {
  const agg = cityAggregates(
    data(photo({ id: "a", placeId: "hz" }), photo({ id: "b", placeId: "hz" }))
  )
  expect(agg).toHaveLength(1)
  expect(agg[0]).toMatchObject({ placeId: "hz", count: 2, minYear: 2023, maxYear: 2023 })
})

test("monthDensity 返回 12 个数、峰值 1、空年全 0", () => {
  const year = monthDensity(data(photo({ id: "a" }), photo({ id: "b" })), 2023)
  expect(year).toHaveLength(12)
  expect(Math.max(...year)).toBe(1)
  expect(monthDensity(data(), 1999).every((v) => v === 0)).toBe(true)
})

test("photosByYear 只返回该年，并按拍摄时间正序", () => {
  const list = photosByYear(
    data(
      photo({ id: "a", takenAt: "2023-09-01T00:00:00Z", bucket: "2023-09" }),
      photo({ id: "b", takenAt: "2023-01-01T00:00:00Z", bucket: "2023-01" }),
      photo({ id: "c", takenAt: "2022-01-01T00:00:00Z", bucket: "2022-01" })
    ),
    2023
  )
  expect(list.map((p) => p.id)).toEqual(["b", "a"])
})

test("photosByPlace 只返回该城市，无 GPS 的不出现", () => {
  const list = photosByPlace(
    data(photo({ id: "a", placeId: "hz" }), photo({ id: "b", placeId: null })),
    "hz"
  )
  expect(list.map((p) => p.id)).toEqual(["a"])
})

test("不存在的年份/城市返回空数组，不抛错", () => {
  expect(photosByYear(data(), 1800)).toEqual([])
  expect(photosByPlace(data(), "nope")).toEqual([])
})

test("undated 只返回没有拍摄时间的照片", () => {
  const list = undated(data(photo({ id: "a" }), photo({ id: "x", takenAt: null, bucket: null })))
  expect(list.map((p) => p.id)).toEqual(["x"])
})

test("neighbours 按 takenAt 排序；无时间的照片不参与翻页", () => {
  const d = data(
    photo({ id: "a", takenAt: "2023-01-01T00:00:00Z", bucket: "2023-01" }),
    photo({ id: "b", takenAt: "2024-01-01T00:00:00Z", bucket: "2024-01" }),
    photo({ id: "x", takenAt: null, bucket: null })
  )
  expect(neighbours(d, "b").previous?.id).toBe("a")
  expect(neighbours(d, "x")).toEqual({ previous: null, next: null })
})

test("首张没有 previous，末张没有 next", () => {
  const d = data(
    photo({ id: "a", takenAt: "2023-01-01T00:00:00Z", bucket: "2023-01" }),
    photo({ id: "b", takenAt: "2024-01-01T00:00:00Z", bucket: "2024-01" })
  )
  expect(neighbours(d, "a").previous).toBeNull()
  expect(neighbours(d, "b").next).toBeNull()
})
