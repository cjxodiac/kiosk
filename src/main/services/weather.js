// 매장 위치 고정 좌표 (기본값: 서울 시청) - 실제 매장 위치로 교체 가능 (.env에 STORE_LAT/STORE_LON)
const STORE_LAT = process.env.STORE_LAT || '37.5665'
const STORE_LON = process.env.STORE_LON || '126.9780'

const CACHE_MS = 30 * 60 * 1000 // 날씨는 자주 안 바뀌므로 30분 캐싱 (API 호출 절약)
let cache = { data: null, fetchedAt: 0 }

// ── 현재 날씨 조회 (OpenWeatherMap) - 키 없거나 실패하면 null 반환 ──
export async function getCurrentWeather() {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) return null

  const now = Date.now()
  if (cache.data && now - cache.fetchedAt < CACHE_MS) return cache.data

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${STORE_LAT}&lon=${STORE_LON}&appid=${apiKey}&units=metric&lang=kr`
    const res = await fetch(url)
    if (!res.ok) return cache.data // 실패 시 이전 캐시라도 반환 (완전히 죽지 않게)

    const json = await res.json()
    const data = {
      temp: json.main?.temp,               // 기온(섭씨)
      condition: json.weather?.[0]?.main,   // Clear / Clouds / Rain / Snow 등 (영문 코드)
      description: json.weather?.[0]?.description, // 한글 설명 (lang=kr)
    }
    cache = { data, fetchedAt: now }
    return data
  } catch (err) {
    console.error('[weather] 조회 실패:', err.message)
    return cache.data
  }
}
