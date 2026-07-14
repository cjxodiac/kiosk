import { getDb } from '../db/index.js'

export async function startSession({ sessionId, mode, accessibilityOptions = [], storeType = null }) {
  const db = getDb()
  const usedAccessibility = accessibilityOptions.length > 0 ? 1 : 0
  
  db.prepare(`
    INSERT INTO sessions (id, started_at, mode, used_accessibility, accessibility_options, store_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    new Date().toISOString(),
    mode || '일반',
    usedAccessibility,
    JSON.stringify(accessibilityOptions),
    storeType
  )
  
  return { success: true, sessionId }
}

export async function trackEvent({ sessionId, type, screen = null, payload = {} }) {
  const db = getDb()
  
  db.prepare(`
    INSERT INTO events (session_id, timestamp, event_type, screen, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    sessionId,
    new Date().toISOString(),
    type,
    screen,
    JSON.stringify(payload)
  )
  
  return { success: true }
}

export async function endSession({ sessionId, completed = false, abandonedAtScreen = null, clickCount = 0, accessibilityOptions = [], mode = null }) {
  const db = getDb()
  
  const session = db.prepare(`SELECT started_at FROM sessions WHERE id = ?`).get(sessionId)
  if (!session) return { success: false, error: 'session not found' }
  
  const startedAt = new Date(session.started_at)
  const endedAt = new Date()
  const durationSec = Math.floor((endedAt - startedAt) / 1000)
  
  const usedAccessibility = accessibilityOptions.length > 0 ? 1 : 0
  
  db.prepare(`
    UPDATE sessions
    SET ended_at = ?, duration_sec = ?, completed = ?, abandoned_at_screen = ?, 
        click_count = ?, accessibility_options = ?, used_accessibility = ?,
        mode = COALESCE(?, mode)
    WHERE id = ?
  `).run(
    endedAt.toISOString(),
    durationSec,
    completed ? 1 : 0,
    abandonedAtScreen,
    clickCount,
    JSON.stringify(accessibilityOptions),
    usedAccessibility,
    mode,
    sessionId
  )
  
  return { success: true, durationSec }
}