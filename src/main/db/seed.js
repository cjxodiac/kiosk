import { getDb } from './index.js'

// 카테고리
const CATEGORIES = [
  { id: 1, name: '커피', icon: '☕', ice_only: 0, display_order: 1 },
  { id: 2, name: '논커피', icon: '🥛', ice_only: 0, display_order: 2 },
  { id: 3, name: '스무디(Only Ice)', icon: '🥤', ice_only: 1, display_order: 3 },
  { id: 4, name: '디저트', icon: '🍰', ice_only: 0, display_order: 4 },
  { id: 5, name: '푸드', icon: '🥪', ice_only: 0, display_order: 5 },
]

// 재료 (id는 자동 할당)
const INGREDIENTS = [
  { name: '에스프레소샷', unit: 'shot', stock: 200, low_stock_threshold: 30 },
  { name: '우유', unit: 'ml', stock: 10000, low_stock_threshold: 1000 },
  { name: '물', unit: 'ml', stock: 20000, low_stock_threshold: 2000 },
  { name: '바닐라시럽', unit: 'pump', stock: 100, low_stock_threshold: 15 },
  { name: '헤이즐넛시럽', unit: 'pump', stock: 100, low_stock_threshold: 15 },
  { name: '카라멜시럽', unit: 'pump', stock: 100, low_stock_threshold: 15 },
  { name: '딸기시럽', unit: 'pump', stock: 100, low_stock_threshold: 15 },
  { name: '블루베리시럽', unit: 'pump', stock: 100, low_stock_threshold: 15 },
  { name: '초코파우더', unit: 'g', stock: 1000, low_stock_threshold: 100 },
  { name: '말차파우더', unit: 'g', stock: 1000, low_stock_threshold: 100 },
  { name: '미숫가루', unit: 'g', stock: 1000, low_stock_threshold: 100 },
  { name: '요거트', unit: 'ml', stock: 5000, low_stock_threshold: 500 },
  { name: '망고', unit: 'g', stock: 2000, low_stock_threshold: 200 },
  { name: '치즈케이크', unit: '개', stock: 20, low_stock_threshold: 3 },
  { name: '티라미수', unit: '개', stock: 20, low_stock_threshold: 3 },
  { name: '크로플', unit: '개', stock: 20, low_stock_threshold: 3 },
  { name: '쿠키', unit: '개', stock: 30, low_stock_threshold: 5 },
  { name: '햄치즈샌드위치', unit: '개', stock: 15, low_stock_threshold: 3 },
  { name: '베이글', unit: '개', stock: 20, low_stock_threshold: 3 },
  { name: '에그타르트', unit: '개', stock: 25, low_stock_threshold: 4 },
  { name: '펄', unit: 'g', stock: 500, low_stock_threshold: 50 },
  { name: '휘핑크림', unit: 'ml', stock: 1000, low_stock_threshold: 100 },
]

// 메뉴
const MENUS = [
  // 커피
  { id: 101, category_id: 1, name: '아메리카노', price: 4500, image_path: '/americano.png', description: '에스프레소와 물의 조화' },
  { id: 102, category_id: 1, name: '카페라떼', price: 5000, image_path: '/cafe_latte.png', description: '부드러운 우유와 에스프레소' },
  { id: 103, category_id: 1, name: '카푸치노', price: 5000, image_path: '/cappuccino.png', description: '풍성한 우유 거품' },
  { id: 104, category_id: 1, name: '바닐라라떼', price: 5500, image_path: '/vanila_latte.png', description: '달콤한 바닐라 시럽' },
  { id: 105, category_id: 1, name: '카라멜마키아토', price: 5800, image_path: '/macchiato.png', description: '카라멜의 달콤함' },
  // 논커피
  { id: 201, category_id: 2, name: '초코라떼', price: 5500, image_path: '/choco_latte.png', description: '진한 초콜릿' },
  { id: 202, category_id: 2, name: '녹차라떼', price: 5500, image_path: '/matcha_latte.png', description: '고소한 녹차' },
  { id: 203, category_id: 2, name: '미숫가루', price: 5500, image_path: '/misugaru.png', description: '달콤한 고구마' },
  { id: 204, category_id: 2, name: '딸기라떼', price: 5800, image_path: '/strawberry_latte.png', description: '상큼한 딸기' },
  // 스무디
  { id: 301, category_id: 3, name: '딸기요거트스무디', price: 6500, image_path: '/strawberry_smoothie.png', description: '신선한 딸기와 요거트' },
  { id: 302, category_id: 3, name: '블루베리요거트스무디', price: 6500, image_path: '/blueberry_smoothie.png', description: '블루베리의 풍미' },
  { id: 303, category_id: 3, name: '망고스무디', price: 6500, image_path: '/mango_smoothie.png', description: '달콤한 망고' },
  { id: 304, category_id: 3, name: '플레인요거트', price: 5800, image_path: '/plane_yougart.png', description: '깔끔한 요거트' },
  { id: 305, category_id: 3, name: '초코스무디', price: 6500, image_path: '/choco_smoothie.png', description: '진한 초코' },
  // 디저트
  { id: 401, category_id: 4, name: '치즈케이크', price: 6000, image_path: '/cheeze_cake.png', description: '부드러운 뉴욕 치즈케이크' },
  { id: 402, category_id: 4, name: '티라미수', price: 6500, image_path: '/tiramisu.png', description: '이탈리안 정통 티라미수' },
  { id: 403, category_id: 4, name: '크로플', price: 5500, image_path: '/crople.png', description: '바삭한 크로아상 와플' },
  { id: 404, category_id: 4, name: '쿠키', price: 3500, image_path: '/cookie.png', description: '수제 초코칩 쿠키' },
  // 푸드
  { id: 501, category_id: 5, name: '햄치즈샌드위치', price: 7000, image_path: '/sandwitch.png', description: '신선한 햄과 치즈' },
  { id: 502, category_id: 5, name: '베이글', price: 5000, image_path: '/beigle.png', description: '쫄깃한 베이글' },
  { id: 503, category_id: 5, name: '에그타르트', price: 4500, image_path: '/eggtart.png', description: '포르투갈식 에그타르트' },
]

// 레시피 - menuId -> [{ingredientName, qty}]
const RECIPES = {
  101: [['에스프레소샷', 2], ['물', 200]],
  102: [['에스프레소샷', 2], ['우유', 200]],
  103: [['에스프레소샷', 2], ['우유', 150]],
  104: [['에스프레소샷', 2], ['우유', 200], ['바닐라시럽', 1]],
  105: [['에스프레소샷', 2], ['우유', 200], ['카라멜시럽', 1]],
  201: [['우유', 200], ['초코파우더', 20]],
  202: [['우유', 200], ['말차파우더', 20]],
  203: [['우유', 200], ['미숫가루', 30]],
  204: [['우유', 200], ['딸기시럽', 2]],
  301: [['요거트', 200], ['딸기시럽', 3]],
  302: [['요거트', 200], ['블루베리시럽', 3]],
  303: [['망고', 100], ['우유', 150]],
  304: [['요거트', 250]],
  305: [['우유', 200], ['초코파우더', 30]],
  401: [['치즈케이크', 1]],
  402: [['티라미수', 1]],
  403: [['크로플', 1]],
  404: [['쿠키', 1]],
  501: [['햄치즈샌드위치', 1]],
  502: [['베이글', 1]],
  503: [['에그타르트', 1]],
}

// 옵션-재료 매핑 (optionId -> ingredient + qty)
const OPTION_RECIPES = {
  '샷 추가':         ['에스프레소샷', 1],
  '우유 추가':       ['우유', 100],
  '헤이즐넛 시럽 추가': ['헤이즐넛시럽', 1],
  '바닐라 시럽 추가':  ['바닐라시럽', 1],
  '카라멜 시럽 추가':  ['카라멜시럽', 1],
  '펄 추가':         ['펄', 30],
  '휘핑 추가':       ['휘핑크림', 20],
}
export function runSeedIfEmpty() {
  const db = getDb()
  
  // 카테고리가 비어있으면 시드 실행
  const count = db.prepare(`SELECT COUNT(*) AS n FROM categories`).get().n
  if (count > 0) {
    console.log('[SEED] 데이터 이미 존재. 스킵.')
    return
  }
  
  console.log('[SEED] 초기 데이터 입력 시작...')
  const tx = db.transaction(() => {
    // 카테고리
    const catStmt = db.prepare(`INSERT INTO categories (id, name, icon, ice_only, display_order) VALUES (?, ?, ?, ?, ?)`)
    for (const c of CATEGORIES) catStmt.run(c.id, c.name, c.icon, c.ice_only, c.display_order)
    
    // 재료
    const ingStmt = db.prepare(`INSERT INTO ingredients (name, unit, stock, low_stock_threshold) VALUES (?, ?, ?, ?)`)
    const ingredientIds = {}
    for (const i of INGREDIENTS) {
      const r = ingStmt.run(i.name, i.unit, i.stock, i.low_stock_threshold)
      ingredientIds[i.name] = r.lastInsertRowid
    }
    
    // 메뉴
    const menuStmt = db.prepare(`INSERT INTO menus (id, category_id, name, price, image_path, description) VALUES (?, ?, ?, ?, ?, ?)`)
    for (const m of MENUS) menuStmt.run(m.id, m.category_id, m.name, m.price, m.image_path, m.description)
    
    // 레시피
    const recStmt = db.prepare(`INSERT INTO recipes (menu_id, ingredient_id, quantity) VALUES (?, ?, ?)`)
    for (const [menuId, items] of Object.entries(RECIPES)) {
      for (const [name, qty] of items) {
        if (ingredientIds[name]) recStmt.run(Number(menuId), ingredientIds[name], qty)
      }
    }
    
    // 옵션 레시피
// 옵션 레시피
  const optStmt = db.prepare(`INSERT INTO option_recipes (option_name, ingredient_id, quantity) VALUES (?, ?, ?)`)
  for (const [optName, [ingName, qty]] of Object.entries(OPTION_RECIPES)) {
    if (ingredientIds[ingName]) optStmt.run(optName, ingredientIds[ingName], qty)
  }
  })
  
  tx()
  console.log('[SEED] 완료. 카테고리 5, 메뉴 22, 재료 20, 레시피 매핑 등 추가됨.')
}