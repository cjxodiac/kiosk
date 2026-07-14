import { getDb } from '../db/index.js'
import { dialog, app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

// 오늘 매출/통계
export async function getTodayStats() {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  
  const total = db.prepare(`
    SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total
    FROM orders WHERE order_date = ?
  `).get(today)
  
  const byMode = db.prepare(`
    SELECT mode, COUNT(*) AS count, COALESCE(SUM(total), 0) AS total
    FROM orders WHERE order_date = ? GROUP BY mode
  `).all(today)
  
  const byAccessibility = db.prepare(`
    SELECT used_accessibility, COUNT(*) AS count
    FROM orders WHERE order_date = ? GROUP BY used_accessibility
  `).all(today)
  
  const sessions = db.prepare(`
    SELECT COUNT(*) AS total, 
           SUM(completed) AS completed,
           SUM(used_accessibility) AS withAccessibility
    FROM sessions WHERE substr(started_at, 1, 10) = ?
  `).get(today)
  
  return { 
    today, 
    orders: total, 
    byMode, 
    byAccessibility, 
    sessions,
  }
}

// 전체 누적 통계
export async function getAllTimeStats() {
  const db = getDb()
  const orders = db.prepare(`SELECT COUNT(*) AS count, COALESCE(SUM(total), 0) AS total FROM orders`).get()
  const sessions = db.prepare(`SELECT COUNT(*) AS total, SUM(completed) AS completed FROM sessions`).get()
  return { orders, sessions }
}

// 최근 주문 N건
export async function getRecentOrders(limit = 20) {
  const db = getDb()
  return db.prepare(`
    SELECT id, order_number, order_date, total, item_count, 
           payment_method, mode, used_accessibility, created_at
    FROM orders 
    ORDER BY id DESC 
    LIMIT ?
  `).all(limit)
}

// CSV 내보내기
export async function exportCsv() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'CSV 저장 폴더 선택',
    defaultPath: app.getPath('desktop'),
  })
  if (result.canceled) return { success: false, canceled: true }
  
  const dir = result.filePaths[0]
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  
  const db = getDb()
  const sessions = db.prepare(`SELECT * FROM sessions`).all()
  const events = db.prepare(`SELECT * FROM events`).all()
  const orders = db.prepare(`SELECT * FROM orders`).all()
  
  const sessionsPath = path.join(dir, `sessions_${stamp}.csv`)
  const eventsPath = path.join(dir, `events_${stamp}.csv`)
  const ordersPath = path.join(dir, `orders_${stamp}.csv`)
  
  fs.writeFileSync(sessionsPath, toCsv(sessions))
  fs.writeFileSync(eventsPath, toCsv(events))
  fs.writeFileSync(ordersPath, toCsv(orders))
  
  return { 
    success: true, 
    dir,
    files: { sessions: sessionsPath, events: eventsPath, orders: ordersPath },
    counts: { sessions: sessions.length, events: events.length, orders: orders.length }
  }
}

// 전체 데이터 초기화 (데모 리셋용)
export async function clearAllData() {
  const db = getDb()
  db.exec(`
    DELETE FROM events;
    DELETE FROM orders;
    DELETE FROM sessions;
    DELETE FROM sqlite_sequence WHERE name IN ('events', 'orders');
  `)
  return { success: true }
}

// CSV 유틸 (UTF-8 BOM 포함 → Excel 한글 안 깨짐)
function toCsv(rows) {
  if (rows.length === 0) return '\uFEFF'
  const keys = Object.keys(rows[0])
  const escape = (v) => {
    if (v === null || v === undefined) return ''
    const s = String(v).replace(/"/g, '""')
    return /[,"\n]/.test(s) ? `"${s}"` : s
  }
  return '\uFEFF' + [
    keys.join(','),
    ...rows.map(r => keys.map(k => escape(r[k])).join(','))
  ].join('\n')
}

// === 런타임 통계 (export 추가 & getDb() 추가) ===
export function getRuntimeStats() {
  const db = getDb(); // db 선언 추가
  // 모드별 완료 세션 평균
  const byMode = db.prepare(`
    SELECT 
      mode,
      COUNT(*) as total_completed,
      AVG((julianday(ended_at) - julianday(started_at)) * 86400) as avg_seconds,
      MIN((julianday(ended_at) - julianday(started_at)) * 86400) as min_seconds,
      MAX((julianday(ended_at) - julianday(started_at)) * 86400) as max_seconds,
      AVG(click_count) as avg_clicks
    FROM sessions
    WHERE completed = 1 AND ended_at IS NOT NULL AND started_at IS NOT NULL
    GROUP BY mode
  `).all();
  
  // 완료율 계산용
  const completionRate = db.prepare(`
    SELECT mode, COUNT(*) as total_sessions, SUM(completed) as completed_count
    FROM sessions
    WHERE ended_at IS NOT NULL
    GROUP BY mode
  `).all();
  
  return { byMode, completionRate };
}

// 시간 분포 (15초 버킷)
export function getRuntimeDistribution() {
  const db = getDb(); // db 선언 추가
  return db.prepare(`
    SELECT 
      mode,
      CAST((julianday(ended_at) - julianday(started_at)) * 86400 / 15 AS INTEGER) * 15 as bucket,
      COUNT(*) as count
    FROM sessions
    WHERE completed = 1 AND ended_at IS NOT NULL
    GROUP BY mode, bucket
    ORDER BY bucket
  `).all();
}

// 이탈 화면 분석
export function getAbandonmentStats() {
  const db = getDb(); // db 선언 추가
  return db.prepare(`
    SELECT mode, abandoned_at_screen, COUNT(*) as count
    FROM sessions
    WHERE completed = 0 AND abandoned_at_screen IS NOT NULL
    GROUP BY mode, abandoned_at_screen
    ORDER BY count DESC
  `).all();
}

// 주문별 런타임 상세
export function getOrderRuntimes(limit = 50) {
  const db = getDb(); // db 선언 추가
  return db.prepare(`
    SELECT 
      o.id, o.order_number, o.total, o.item_count, o.payment_method,
      o.mode, o.used_accessibility, o.created_at,
      s.click_count,
      CAST((julianday(s.ended_at) - julianday(s.started_at)) * 86400 AS INTEGER) as duration_seconds
    FROM orders o
    LEFT JOIN sessions s ON s.order_id = o.id
    ORDER BY o.id DESC
    LIMIT ?
  `).all(limit);
}

// (선택) 데모용 가짜 데이터 30건 생성 - 발표 시연용
export function seedDemoData() {
  const db = getDb(); // db 선언 추가
  const now = Date.now();
  let created = 0;
  
  const tx = db.transaction(() => {
    for (let i = 0; i < 30; i++) {
      const mode = Math.random() > 0.4 ? '일반' : '쉬운';
      const useA11y = mode === '쉬운' && Math.random() > 0.3 ? 1 : 0;
      const duration = mode === '일반' ? 25 + Math.random() * 40 : 50 + Math.random() * 60;
      const clicks = mode === '일반' ? 8 + Math.floor(Math.random() * 8) : 15 + Math.floor(Math.random() * 12);
      const completed = Math.random() > (mode === '쉬운' ? 0.22 : 0.15) ? 1 : 0;
      
      const startMs = now - Math.random() * 7 * 86400000;
      const endMs = startMs + duration * 1000;
      const startISO = new Date(startMs).toISOString();
      const endISO = new Date(endMs).toISOString();
      
      const a11yOpts = useA11y ? '["음성안내","자막"]' : '[]';
      const abandonedScreen = completed ? null : ['메뉴', '주문확인', '결제'][Math.floor(Math.random() * 3)];
      
      const sessRes = db.prepare(`
        INSERT INTO sessions (mode, started_at, ended_at, completed, click_count, accessibility_options, abandoned_at_screen)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(mode, startISO, endISO, completed, clicks, a11yOpts, abandonedScreen);
      
      if (completed) {
        const total = 4500 + Math.floor(Math.random() * 12000);
        const items = 1 + Math.floor(Math.random() * 3);
        const orderRes = db.prepare(`
          INSERT INTO orders (order_number, order_date, total, item_count, payment_method, mode, used_accessibility, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(1000 + i, new Date(startMs).toISOString().slice(0, 10), total, items, Math.random() > 0.4 ? 'card' : 'easy_pay', mode, useA11y, endISO);
        
        db.prepare('UPDATE sessions SET order_id = ? WHERE id = ?').run(orderRes.lastInsertRowid, sessRes.lastInsertRowid);
      }
      created++;
    }
  });
  tx();
  return { success: true, count: created };
}