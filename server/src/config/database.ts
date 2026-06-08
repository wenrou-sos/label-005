import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.resolve(__dirname, '../../data')
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

const DB_PATH = path.join(DB_DIR, 'repair_management.db')

export const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'repair_management'
}

let dbInstance: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH)
    dbInstance.pragma('journal_mode = WAL')
    dbInstance.pragma('foreign_keys = ON')
  }
  return dbInstance
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
