import { getDb } from '../db/index.js'

export async function getCategories() {
  const db = getDb()
  return db.prepare(`
    SELECT id, name, icon, ice_only, display_order
    FROM categories WHERE is_active = 1 ORDER BY display_order
  `).all().map(c => ({
    id: c.id, name: c.name, icon: c.icon, iceOnly: !!c.ice_only,
  }))
}

export async function getMenus() {
  const db = getDb()
  return db.prepare(`
    SELECT m.*, 
      CASE
        WHEN m.is_sold_out_manual = 1 THEN 1
        WHEN EXISTS (
          SELECT 1 FROM recipes r
          JOIN ingredients i ON r.ingredient_id = i.id
          WHERE r.menu_id = m.id AND i.stock < r.quantity
        ) THEN 1
        ELSE 0
      END AS computed_sold_out
    FROM menus m
    WHERE m.is_active = 1
    ORDER BY m.category_id, m.display_order, m.id
  `).all().map(m => ({
    id: m.id, categoryId: m.category_id, name: m.name, price: m.price,
    image: m.image_path, description: m.description,
    soldOut: !!m.computed_sold_out, manualSoldOut: !!m.is_sold_out_manual,
  }))
}

export async function getIngredients() {
  const db = getDb()
  return db.prepare(`SELECT id, name, unit, stock, low_stock_threshold, is_active FROM ingredients ORDER BY name`)
    .all().map(i => ({ ...i, isActive: !!i.is_active, isLowStock: i.stock < i.low_stock_threshold }))
}

export async function adjustIngredientStock(ingredientId, delta) {
  const db = getDb()
  db.prepare(`UPDATE ingredients SET stock = MAX(0, stock + ?) WHERE id = ?`).run(delta, ingredientId)
  const row = db.prepare(`SELECT stock FROM ingredients WHERE id = ?`).get(ingredientId)
  return { success: true, newStock: row?.stock }
}

export async function setIngredientStock(ingredientId, stock) {
  const db = getDb()
  db.prepare(`UPDATE ingredients SET stock = ? WHERE id = ?`).run(Math.max(0, stock), ingredientId)
  return { success: true }
}

export async function toggleMenuSoldOut(menuId, soldOut) {
  const db = getDb()
  db.prepare(`UPDATE menus SET is_sold_out_manual = ? WHERE id = ?`).run(soldOut ? 1 : 0, menuId)
  return { success: true }
}

export async function getRecipe(menuId) {
  const db = getDb()
  return db.prepare(`
    SELECT r.ingredient_id, i.name AS ingredient_name, i.unit, r.quantity
    FROM recipes r JOIN ingredients i ON r.ingredient_id = i.id
    WHERE r.menu_id = ? ORDER BY i.name
  `).all(menuId)
}

export async function setRecipeIngredient(menuId, ingredientId, quantity) {
  const db = getDb()
  const existing = db.prepare(`SELECT 1 FROM recipes WHERE menu_id = ? AND ingredient_id = ?`).get(menuId, ingredientId)
  if (existing) {
    db.prepare(`UPDATE recipes SET quantity = ? WHERE menu_id = ? AND ingredient_id = ?`).run(quantity, menuId, ingredientId)
  } else {
    db.prepare(`INSERT INTO recipes (menu_id, ingredient_id, quantity) VALUES (?, ?, ?)`).run(menuId, ingredientId, quantity)
  }
  return { success: true }
}

export async function removeRecipeIngredient(menuId, ingredientId) {
  const db = getDb()
  db.prepare(`DELETE FROM recipes WHERE menu_id = ? AND ingredient_id = ?`).run(menuId, ingredientId)
  return { success: true }
}

// ===== 메뉴 CRUD =====
export async function createMenu({ categoryId, name, price, image, description }) {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO menus (category_id, name, price, image_path, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(categoryId, name, price, image || '', description || '')
  return { success: true, id: result.lastInsertRowid }
}

export async function updateMenu(menuId, { categoryId, name, price, image, description }) {
  const db = getDb()
  db.prepare(`
    UPDATE menus 
    SET category_id = ?, name = ?, price = ?, image_path = ?, description = ?
    WHERE id = ?
  `).run(categoryId, name, price, image || '', description || '', menuId)
  return { success: true }
}

export async function deleteMenu(menuId) {
  const db = getDb()
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM recipes WHERE menu_id = ?`).run(menuId)
    db.prepare(`DELETE FROM menus WHERE id = ?`).run(menuId)
  })
  tx()
  return { success: true }
}

// ===== 재료 생성 =====
export async function createIngredient({ name, unit, stock = 0, lowStockThreshold = 10 }) {
  const db = getDb()
  const clean = (name || '').trim()
  if (!clean) return { success: false, error: '재료 이름을 입력하세요' }
  const exists = db.prepare(`SELECT 1 FROM ingredients WHERE name = ?`).get(clean)
  if (exists) return { success: false, error: '이미 존재하는 재료명입니다' }
  const result = db.prepare(`
    INSERT INTO ingredients (name, unit, stock, low_stock_threshold)
    VALUES (?, ?, ?, ?)
  `).run(clean, (unit || '개').trim(), Math.max(0, stock), Math.max(0, lowStockThreshold))
  return { success: true, id: result.lastInsertRowid }
}

// ===== 🔽 [여기에 새로 추가됨] 재료 수정 및 삭제 처리 로직 =====

export async function updateIngredient(ingredientId, { name, unit, lowStockThreshold }) {
  const db = getDb()
  const cleanName = (name || '').trim()
  if (!cleanName) return { success: false, error: '재료 이름을 입력하세요' }

  // 본인 외에 이미 같은 이름을 쓰고 있는 다른 재료가 있는지 체크
  const exists = db.prepare(`SELECT 1 FROM ingredients WHERE name = ? AND id != ?`).get(cleanName, ingredientId)
  if (exists) return { success: false, error: '이미 존재하는 재료명입니다' }

  db.prepare(`
    UPDATE ingredients 
    SET name = ?, unit = ?, low_stock_threshold = ?
    WHERE id = ?
  `).run(cleanName, (unit || '개').trim(), Math.max(0, Number(lowStockThreshold)), ingredientId)
  
  return { success: true }
}

export async function deleteIngredient(ingredientId) {
  const db = getDb()
  
  // 무결성 보장 트랜잭션: 재료가 삭제될 때 해당 재료를 쓰고 있던 레시피 연동 데이터도 함께 안전하게 지워줍니다.
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM recipes WHERE ingredient_id = ?`).run(ingredientId)
    db.prepare(`DELETE FROM ingredients WHERE id = ?`).run(ingredientId)
  })
  tx()
  
  return { success: true }
}