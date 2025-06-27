import Database from 'better-sqlite3'
import { Client, Pool } from 'pg'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'
const databaseUrl = process.env.DATABASE_URL!

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export let db: Database.Database | Pool

if (isDevelopment || databaseUrl.includes('sqlite')) {
  // SQLite for development
  const dbPath = databaseUrl.replace('sqlite:', '')
  db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')
  
  console.log('Connected to SQLite database')
} else {
  // PostgreSQL for production
  db = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  
  console.log('Connected to PostgreSQL database')
}

// Database helper functions
export const query = async (text: string, params?: any[]): Promise<any> => {
  if (db instanceof Database) {
    // SQLite
    if (text.toLowerCase().startsWith('select')) {
      return db.prepare(text).all(...(params || []))
    } else {
      return db.prepare(text).run(...(params || []))
    }
  } else {
    // PostgreSQL
    const result = await db.query(text, params)
    return result.rows
  }
}

export const closeDatabase = async (): Promise<void> => {
  if (db instanceof Database) {
    db.close()
  } else {
    await db.end()
  }
}