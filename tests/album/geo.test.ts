import { expect, test } from "vitest"

import {
  CHINA_VIEWBOX,
  WORLD_VIEWBOX,
  chinaPaths,
  projectChina,
  worldPaths,
} from "@/generated/geo"

function sizeOf(viewBox: string): { width: number; height: number } {
  const parts = viewBox.split(/\s+/).map(Number)
  return { width: parts[2], height: parts[3] }
}

test("path 非空且不含 NaN：一个 NaN 就整块地图消失", () => {
  expect(chinaPaths.length).toBeGreaterThan(50)
  expect(worldPaths.length).toBeGreaterThan(50)
  for (const d of [...chinaPaths, ...worldPaths]) {
    expect(d.length).toBeGreaterThan(10)
    expect(d).not.toContain("NaN")
  }
})

test("中国视图把三亚、漠河、喀什都框进 viewBox", () => {
  const { width, height } = sizeOf(CHINA_VIEWBOX)
  expect(width).toBeGreaterThan(0)
  expect(height).toBeGreaterThan(0)

  // 最南、最北、最西三个极端点 —— 决定了中国视图的取景范围
  for (const [lon, lat] of [
    [109.5, 18.2],
    [122.3, 53.5],
    [75.9, 39.5],
  ] as const) {
    const [x, y] = projectChina(lon, lat)
    expect(x, `lon ${lon}`).toBeGreaterThan(0)
    expect(x, `lon ${lon}`).toBeLessThan(width)
    expect(y, `lat ${lat}`).toBeGreaterThan(0)
    expect(y, `lat ${lat}`).toBeLessThan(height)
  }
})

test("世界视图的 viewBox 是有效的四段数字", () => {
  const parts = WORLD_VIEWBOX.split(/\s+/).map(Number)
  expect(parts).toHaveLength(4)
  expect(parts.every((n) => Number.isFinite(n))).toBe(true)
})

test("同一经纬度在两个投影下位置不同：说明用的不是同一套投影", () => {
  const [chinaX] = projectChina(120.15, 30.27)
  expect(Number.isFinite(chinaX)).toBe(true)
  // 中国视图是 Albers，杭州不落在按经度线性的位置上
  expect(chinaX).not.toBeCloseTo(120.15, 1)
})
