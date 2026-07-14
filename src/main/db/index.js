import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { SCHEMA_SQL } from './schema.js'
import { runSeedIfEmpty } from './seed.js'

let db = null

export function initDatabase() {
  if (db) return db
  
  const dbPath = join(app.getPath('userData'), 'kiosk.db')
  console.log('[DB] 경로:', dbPath)
  
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  
  db.exec(SCHEMA_SQL)
  console.log('[DB] 스키마 적용 완료')
  
  // 시드 (비어있을 때만)
  runSeedIfEmpty()
  
  return db
}

export function getDb() {
  if (!db) throw new Error('DB가 초기화되지 않았습니다.')
  return db
}