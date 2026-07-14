import { getDb } from '../db/index.js'

export async function createOrder({ sessionId = null, items, total, payment, paymentMethod, mode, usedAccessibility = 0, memberId = null, pointsEarned = 0, pointsUsed = 0 }) {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  
  const tx = db.transaction(() => {
    // 1. 다음 주문번호
    const row = db.prepare(`
      SELECT COALESCE(MAX(order_number), 0) + 1 AS next_num 
      FROM orders WHERE order_date = ?
    `).get(today)
    const orderNumber = row.next_num
    
    const itemCount = items.reduce((sum, it) => sum + (it.qty || 1), 0)
    
    // 2. 주문 저장
    const result = db.prepare(`
      INSERT INTO orders (
        session_id, order_number, order_date, items_json, item_count, total,
        payment_method, payment_json, mode, used_accessibility,
        member_id, points_earned, points_used, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId, orderNumber, today,
      JSON.stringify(items), itemCount, total,
      paymentMethod || null,
      payment ? JSON.stringify(payment) : null,
      mode || '일반', usedAccessibility ? 1 : 0,
      memberId, pointsEarned, pointsUsed,
      new Date().toISOString()
    )
    
    const orderId = result.lastInsertRowid
    
    // 3. 재고 차감 (레시피 + 옵션 레시피)
    const recipeStmt = db.prepare(`SELECT ingredient_id, quantity FROM recipes WHERE menu_id = ?`)
    const optRecipeStmt = db.prepare(`SELECT ingredient_id, quantity FROM option_recipes WHERE option_name = ?`)
    const decStmt = db.prepare(`UPDATE ingredients SET stock = MAX(0, stock - ?) WHERE id = ?`)
    
    for (const item of items) {
      const qty = item.qty || 1
      
      // 메뉴 본체 재료
      const recipe = recipeStmt.all(item.menuId)
      for (const r of recipe) {
        decStmt.run(r.quantity * qty, r.ingredient_id)
      }
      
      // 옵션 재료 (OptionModal이 '샷 추가(2)' 형태 문자열로 저장)
      for (const optStr of (item.options || [])) {
        // 파싱: '샷 추가(2)' -> 이름='샷 추가', 수량=2
        const match = String(optStr).match(/^(.+)\((\d+)\)$/)
        if (!match) continue  // '연하게', '차가운(ICE)' 같은 무료/기본 옵션은 매칭 안 됨
        
        const optName = match[1].trim()
        const optQty = parseInt(match[2], 10)
        
        // '차가운(ICE)', '따뜻한(HOT)' 같이 숫자가 아닌 ()는 위 정규식이 거름
        // 하지만 혹시 모르니 추가 체크
        if (!optName || isNaN(optQty)) continue
        
        const optR = optRecipeStmt.get(optName)
        if (optR) {
          decStmt.run(optR.quantity * optQty * qty, optR.ingredient_id)
        }
      }
    }
    
    // 4. 세션에 주문 연결
    if (sessionId) {
      db.prepare(`UPDATE sessions SET order_id = ? WHERE id = ?`).run(orderId, sessionId)
    }
    
    return { orderId, orderNumber, itemCount }
  })
  
  const { orderId, orderNumber, itemCount } = tx()
  
  return {
    id: orderId,
    orderNumber,
    items,
    itemCount,
    total,
    payment,
    createdAt: new Date().toISOString(),
  }
}

export async function getTodaysSales() {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  return db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total 
    FROM orders WHERE order_date = ?
  `).get(today)
}