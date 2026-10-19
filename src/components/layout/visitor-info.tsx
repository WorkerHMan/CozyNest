"use client"

import { useEffect, useState } from "react"

import type { Locale } from "@/i18n"

/**
 * Visitor IP and a two-day forecast, for the footer's right side.
 *
 * ## Where the data comes from
 *
 * Both services are free and key-less, which is why they were chosen:
 *
 *  1. `ipwho.is/` — the caller's IP, city and coordinates (CORS `*`).
 *  2. `open-meteo.com` — today and tomorrow's weather for those coordinates.
 *
 * `ipapi.co` was the first choice and had to be dropped: it sits behind a
 * Cloudflare challenge that answers a browser request with an HTML page, so the
 * block would have silently never filled in.
 *
 * The coordinates from step 1 feed step 2, so the forecast follows the visitor
 * rather than the server. Both are third-party requests made from the browser;
 * see the privacy section of /disclaimer.
 *
 * ## It fails quietly
 *
 * Either call can be blocked (ad blockers, restricted networks, rate limits).
 * When that happens the affected part renders an em dash and the rest of the
 * footer carries on — a decorative line is never worth an error state.
 *
 * ## Why the date is read in the effect
 *
 * The weekday must be the visitor's local weekday, and reading the clock during
 * prerender trips the cache-components rule. So the clock is only touched inside
 * the effect, after mount.
 */
const WEEKDAY = {
  zh: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
} as const

const TERM = {
  today: { zh: "今天", en: "Today" },
  tomorrow: { zh: "明天", en: "Tomorrow" },
} as const

/** WMO weather codes, as returned by Open-Meteo's `weather_code`. */
const WEATHER: Record<number, { zh: string; en: string }> = {
  0: { zh: "晴天", en: "Clear" },
  1: { zh: "晴间多云", en: "Mostly clear" },
  2: { zh: "多云", en: "Partly cloudy" },
  3: { zh: "阴天", en: "Overcast" },
  45: { zh: "有雾", en: "Fog" },
  48: { zh: "雾凇", en: "Rime fog" },
  51: { zh: "毛毛雨", en: "Light drizzle" },
  53: { zh: "毛毛雨", en: "Drizzle" },
  55: { zh: "毛毛雨", en: "Heavy drizzle" },
  56: { zh: "冻雨", en: "Freezing drizzle" },
  57: { zh: "冻雨", en: "Freezing drizzle" },
  61: { zh: "小雨", en: "Light rain" },
  63: { zh: "中雨", en: "Rain" },
  65: { zh: "大雨", en: "Heavy rain" },
  66: { zh: "冻雨", en: "Freezing rain" },
  67: { zh: "冻雨", en: "Freezing rain" },
  71: { zh: "小雪", en: "Light snow" },
  73: { zh: "中雪", en: "Snow" },
  75: { zh: "大雪", en: "Heavy snow" },
  77: { zh: "雪粒", en: "Snow grains" },
  80: { zh: "阵雨", en: "Showers" },
  81: { zh: "阵雨", en: "Showers" },
  82: { zh: "强阵雨", en: "Violent showers" },
  85: { zh: "阵雪", en: "Snow showers" },
  86: { zh: "阵雪", en: "Snow showers" },
  95: { zh: "雷阵雨", en: "Thunderstorm" },
  96: { zh: "雷阵雨伴冰雹", en: "Thunderstorm with hail" },
  99: { zh: "雷阵雨伴冰雹", en: "Thunderstorm with hail" },
}

interface Visitor {
  ip: string
  place: string
}

interface DayForecast {
  term: "today" | "tomorrow"
  weekday: string
  temperature: number
  weather: string
}

const copy = {
  ip: { zh: "IP", en: "IP" },
  unknown: { zh: "—", en: "—" },
  hint: {
    zh: "IP 与天气来自第三方服务",
    en: "IP and weather come from third-party services",
  },
}

export function VisitorInfo({ locale }: { locale: Locale }) {
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [forecast, setForecast] = useState<DayForecast[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch("https://ipwho.is/", { signal: controller.signal })
        if (!response.ok) return
        const data = (await response.json()) as {
          success?: boolean
          ip?: string
          city?: string
          region?: string
          country?: string
          latitude?: number
          longitude?: number
        }

        // ipwho.is answers 200 with `success: false` for reserved addresses such
        // as a private network or localhost.
        if (data.success === false) return

        setVisitor({
          ip: data.ip ?? "",
          place: data.city || data.region || data.country || "",
        })

        const latitude = Number(data.latitude)
        const longitude = Number(data.longitude)
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

        const weather = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            "&daily=weather_code,temperature_2m_max&forecast_days=2&timezone=auto",
          { signal: controller.signal }
        )
        if (!weather.ok) return

        const report = (await weather.json()) as {
          daily?: { weather_code?: number[]; temperature_2m_max?: number[] }
        }
        const codes = report.daily?.weather_code ?? []
        const highs = report.daily?.temperature_2m_max ?? []
        if (codes.length < 2 || highs.length < 2) return

        const now = new Date()
        const days: DayForecast[] = [0, 1].map((offset) => {
          const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
          return {
            term: offset === 0 ? "today" : "tomorrow",
            weekday: WEEKDAY[locale][day.getDay()],
            temperature: Math.round(highs[offset]),
            weather: (WEATHER[codes[offset]] ?? { zh: "未知", en: "Unknown" })[locale],
          }
        })
        setForecast(days)
      } catch {
        // Blocked or rate-limited: leave the dashes. Nothing here is essential.
      }
    }

    void load()
    return () => controller.abort()
  }, [locale])

  return (
    <p className="min-w-0 text-xs text-muted-foreground sm:ml-auto sm:text-right">
      <span className="font-mono">
        <span>{copy.ip[locale]} </span>
        <span className="text-foreground">{visitor?.ip || copy.unknown[locale]}</span>
        {visitor?.place ? <span> · {visitor.place}</span> : null}
      </span>

      <span className="font-mono"> · </span>

      {forecast.length === 2 ? (
        <span>
          {forecast.map((day, dayIndex) => (
            <span key={day.term}>
              {dayIndex > 0 ? "，" : null}
              <span className="text-foreground">
                {TERM[day.term][locale]}
                {day.weekday}
              </span>
              、{day.temperature}° {day.weather}
            </span>
          ))}
        </span>
      ) : (
        <span>{copy.unknown[locale]}</span>
      )}
    </p>
  )
}
