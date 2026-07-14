import { getDb } from '../db/index.js'
import { getCurrentWeather } from './weather.js'

// ── 날씨에 따라 어울리는 카테고리 결정 (날씨 정보가 없거나 애매하면 전체 음료로 폴백해서 항상 결과가 나오게 함) ──
function getWeatherContext(weather) {
  if (!weather || weather.temp == null) return { label: null, categories: [1, 2, 3] }
  if (weather.temp >= 26) return { label: `더운 날씨 (${Math.round(weather.temp)}도)`, categories: [3] } // 스무디
  if (weather.temp <= 10 || ['Rain', 'Snow'].includes(weather.condition)) {
    return { label: `쌀쌀한 날씨 (${weather.description || weather.condition})`, categories: [1, 2] } // 따뜻한 음료 가능 카테고리
  }
  return { label: `선선한 날씨 (${Math.round(weather.temp)}도)`, categories: [1, 2, 3] } // 애매하면 음료 전체
}

// ── 주문 데이터로부터 메뉴별 인기도(soloCounts) + 연관 구매(pairCounts) 집계 ──
function buildStats() {
  const db = getDb()
  const orders = db.prepare(`SELECT items_json FROM orders ORDER BY id DESC LIMIT 500`).all()

  const soloCounts = {}   // menuId -> 주문에 등장한 횟수
  const pairCounts = {}   // "a-b" (a<b) -> 같이 주문된 횟수

  for (const row of orders) {
    let items
    try { items = JSON.parse(row.items_json) } catch { continue }
    if (!Array.isArray(items)) continue

    const menuIds = [...new Set(items.map(i => i.menuId).filter(id => id != null))]
    menuIds.forEach(id => { soloCounts[id] = (soloCounts[id] || 0) + 1 })

    for (let i = 0; i < menuIds.length; i++) {
      for (let j = i + 1; j < menuIds.length; j++) {
        const key = [menuIds[i], menuIds[j]].sort((a, b) => a - b).join('-')
        pairCounts[key] = (pairCounts[key] || 0) + 1
      }
    }
  }

  return { soloCounts, pairCounts, orderCount: orders.length }
}

function getAllMenus() {
  const db = getDb()
  return db.prepare(`
    SELECT m.*, c.name AS category_name FROM menus m
    JOIN categories c ON m.category_id = c.id
    WHERE m.is_active = 1
      AND m.is_sold_out_manual = 0
      AND NOT EXISTS (
        SELECT 1 FROM recipes r JOIN ingredients i ON r.ingredient_id = i.id
        WHERE r.menu_id = m.id AND i.stock < r.quantity
      )
  `).all()
}

// ── 인기도 + 연관성 하이브리드 스코어링 (categoryFilter 있으면 그 카테고리 안에서만 순위 매김) ──
function scoreMenus(cartMenuIds, allMenus, stats, categoryFilter = null, { alpha = 0.35, topN = 8 } = {}) {
  const { soloCounts, pairCounts } = stats
  const cartSet = new Set(cartMenuIds.map(Number))

  let candidates = allMenus.filter(m => !cartSet.has(m.id))
  if (categoryFilter) candidates = candidates.filter(m => categoryFilter.includes(m.category_id))
  if (candidates.length === 0) return []

  const maxSolo = Math.max(1, ...candidates.map(m => soloCounts[m.id] || 0))
  const rawAssoc = candidates.map(m => {
    let sum = 0
    cartMenuIds.forEach(cartId => {
      const key = [cartId, m.id].sort((a, b) => a - b).join('-')
      sum += pairCounts[key] || 0
    })
    return sum
  })
  const maxAssoc = Math.max(1, ...rawAssoc)

  const scored = candidates.map((m, idx) => {
    const popScore = (soloCounts[m.id] || 0) / maxSolo
    const assocScore = rawAssoc[idx] / maxAssoc
    const finalScore = alpha * popScore + (1 - alpha) * assocScore
    return {
      id: m.id, name: m.name, price: m.price, imagePath: m.image_path,
      categoryId: m.category_id, categoryName: m.category_name,
      finalScore, popScore, assocScore,
      orderCount: soloCounts[m.id] || 0,
    }
  })

  return scored.sort((a, b) => b.finalScore - a.finalScore).slice(0, topN)
}

// ── 인기+연관성 후보 (외부에서도 참조 - 관리자 디버그용) ──
export function getHybridCandidates(cartMenuIds = [], opts = {}) {
  const stats = buildStats()
  const allMenus = getAllMenus()
  return scoreMenus(cartMenuIds, allMenus, stats, null, opts)
}

// ── LLM 호출로 후보 중 N개 선택 + 추천 이유 생성 (API 키 없으면 null 반환 → 폴백 사용) ──
async function callLLM(cartItems, candidates, count, contextLabel) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const prompt = `너는 카페 키오스크의 메뉴 추천 도우미야.
현재 장바구니: ${cartItems.map(c => c.name).join(', ') || '(비어있음)'}
${contextLabel ? `현재 상황: ${contextLabel}` : ''}
추천 후보 목록 (이미 걸러진 상위 후보들):
${candidates.map(c => `- id:${c.id} 이름:${c.name} 카테고리:${c.categoryName} 가격:${c.price}원`).join('\n')}

이 중에서 장바구니 구성과 잘 어울리는 ${count}개를 골라서, 각각 15자 이내의 짧고 친근한 추천 이유를 붙여줘.
${contextLabel ? '현재 상황을 자연스럽게 반영한 이유면 더 좋아.' : ''}
반드시 아래 JSON 형식으로만 답해. 다른 설명은 절대 붙이지 마:
{"recommendations":[{"id":123,"reason":"..."}]}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.content?.find(b => b.type === 'text')?.text || ''
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed?.recommendations)) return null
    return parsed.recommendations
  } catch (err) {
    console.error('[recommendation] LLM call failed:', err.message)
    return null
  }
}

function fallbackReasons(list, defaultReason) {
  return list.map(c => ({
    ...c,
    reason: c.assocScore > 0 ? '함께 많이 찾는 메뉴예요' : defaultReason,
  }))
}

// ── 관리자 화면 확인용 ──
export async function getDebugStats() {
  const stats = buildStats()
  const db = getDb()
  const nameOf = (id) => db.prepare(`SELECT name FROM menus WHERE id = ?`).get(id)?.name || `#${id}`

  const topPopular = Object.entries(stats.soloCounts)
    .map(([id, count]) => ({ id: Number(id), name: nameOf(Number(id)), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const topPairs = Object.entries(stats.pairCounts)
    .map(([key, count]) => {
      const [a, b] = key.split('-').map(Number)
      return { a: nameOf(a), b: nameOf(b), count }
    })
    .sort((x, y) => y.count - x.count)
    .slice(0, 10)

  const weather = await getCurrentWeather()
  const weatherCtx = getWeatherContext(weather)

  return {
    orderCount: stats.orderCount,
    llmEnabled: !!process.env.ANTHROPIC_API_KEY,
    weatherEnabled: !!process.env.OPENWEATHER_API_KEY,
    topPopular,
    topPairs,
    context: { weatherLabel: weatherCtx.label, weather, activeCategories: weatherCtx.categories },
  }
}

// ── 최종 진입점: 인기(인기도+연관성) 3개 + 날씨 기반 3개, 두 세트를 함께 반환 ──
export async function getRecommendations(cartMenuIds = []) {
  const stats = buildStats()
  const allMenus = getAllMenus()

  const db = getDb()
  const cartItems = cartMenuIds.map(id => {
    const row = db.prepare(`SELECT name FROM menus WHERE id = ?`).get(id)
    return { id, name: row?.name || '' }
  })

  // 1) 인기(인기도+연관성) 후보 8개 → 상위 3개
  const popularCandidates = scoreMenus(cartMenuIds, allMenus, stats, null, { topN: 8 })
  // 2) 날씨 기반 후보 8개 (인기 세트와 겹치지 않게 제외) → 상위 3개
  const weather = await getCurrentWeather()
  const weatherCtx = getWeatherContext(weather)
  const popularIds = new Set(popularCandidates.map(c => c.id))
  const weatherPool = scoreMenus(
    [...cartMenuIds, ...popularIds], // 인기 세트에 이미 나온 메뉴는 장바구니처럼 취급해서 제외
    allMenus, stats, weatherCtx.categories, { topN: 8 }
  )

  let popularPicked, weatherPicked, source = 'hybrid'

  if (popularCandidates.length > 0 || weatherPool.length > 0) {
    const llmPopular = popularCandidates.length > 0 ? await callLLM(cartItems, popularCandidates, 3, null) : null
    const llmWeather = weatherPool.length > 0 ? await callLLM(cartItems, weatherPool, 3, weatherCtx.label) : null

    popularPicked = llmPopular
      ? llmPopular.map(r => { const m = popularCandidates.find(c => c.id === r.id); return m ? { ...m, reason: r.reason } : null }).filter(Boolean).slice(0, 3)
      : null
    weatherPicked = llmWeather
      ? llmWeather.map(r => { const m = weatherPool.find(c => c.id === r.id); return m ? { ...m, reason: r.reason } : null }).filter(Boolean).slice(0, 3)
      : null

    if (popularPicked?.length > 0 || weatherPicked?.length > 0) source = 'llm'
  }

  if (!popularPicked || popularPicked.length === 0) {
    popularPicked = fallbackReasons(popularCandidates.slice(0, 3), '지금 인기 있는 메뉴예요')
  }
  if (!weatherPicked || weatherPicked.length === 0) {
    weatherPicked = fallbackReasons(weatherPool.slice(0, 3), weatherCtx.label ? `${weatherCtx.label}에 어울려요` : '지금 추천하는 메뉴예요')
  }

  return {
    popular: popularPicked,
    weather: weatherPicked,
    weatherInfo: weatherCtx,
    source,
  }
}
